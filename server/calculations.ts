import type { StatutoryConfig, Employee, Allowance, Deduction, AttendanceRecord, OvertimeEntry } from "@shared/schema";

interface PayeCalculation {
  taxableIncome: number;
  paye: number;
  breakdown: Array<{
    band: string;
    amount: number;
    rate: number;
    tax: number;
  }>;
}

export class PayrollCalculator {
  private config: StatutoryConfig;

  constructor(config: StatutoryConfig) {
    this.config = config;
  }

  calculatePAYE(grossPay: number): PayeCalculation {
    const bands = Array.isArray(this.config.payeBands) 
      ? this.config.payeBands 
      : JSON.parse(this.config.payeBands as any);

    let remainingIncome = grossPay;
    let totalTax = 0;
    const breakdown: Array<{
      band: string;
      amount: number;
      rate: number;
      tax: number;
    }> = [];

    // Process each band accumulating the fixed amount
    for (const band of bands) {
      if (remainingIncome <= 0) break;

      const bandMin = band.min;
      const bandMax = band.max;
      const bandRate = band.rate;
      const fixedAmount = band.fixedAmount; // Fixed tax from previous bands

      if (grossPay <= bandMin) continue;

      const taxableInBand = Math.min(
        remainingIncome,
        bandMax - bandMin,
        grossPay - bandMin
      );

      // Tax for this band = (taxable amount in this band * rate) + accumulated fixed amount from prior bands
      const taxForBand = (taxableInBand * bandRate) + fixedAmount;
      
      breakdown.push({
        band: `ZMW ${bandMin.toLocaleString()} - ${bandMax === 999999999 ? 'Above' : bandMax.toLocaleString()}`,
        amount: taxableInBand,
        rate: bandRate,
        tax: taxForBand,
      });

      totalTax = taxForBand; // The total tax is the last band's tax (which includes all prior fixed amounts)
      remainingIncome -= taxableInBand;
    }

    return {
      taxableIncome: grossPay,
      paye: Math.round(totalTax * 100) / 100,
      breakdown,
    };
  }

  calculateNAPSA(grossPay: number, isExempt: boolean): { employee: number; employer: number } {
    if (isExempt) {
      return { employee: 0, employer: 0 };
    }

    const rate = parseFloat(this.config.napsaRate);
    // NAPSA cap is on pensionable earnings (K21,170), not contribution
    // If monthly cap is K4,185, that represents 5% of K83,700 annual or K6,975 monthly
    const monthlyCap = this.config.napsaCap ? parseFloat(this.config.napsaCap) : null;
    
    // Cap the pensionable earnings first, then calculate 5%
    const pensionableEarnings = monthlyCap && (grossPay * rate > monthlyCap) 
      ? monthlyCap / rate  // Reverse calculate the capped earnings
      : grossPay;

    const contribution = pensionableEarnings * rate;

    return {
      employee: Math.round(contribution * 100) / 100,
      employer: Math.round(contribution * 100) / 100,
    };
  }

  calculateNHIMA(grossPay: number, isExempt: boolean): number {
    if (isExempt) {
      return 0;
    }

    const rate = parseFloat(this.config.nhimaRate);
    // NHIMA is 1% with annual cap of K12,600 (K1,050 monthly)
    const monthlyNhimaCap = 1050;
    
    let contribution = grossPay * rate;
    if (contribution > monthlyNhimaCap) {
      contribution = monthlyNhimaCap;
    }
    
    return Math.round(contribution * 100) / 100;
  }

  calculatePayslip(
    employee: Employee,
    allowances: Allowance[],
    deductions: Deduction[],
    period: string,
    attendanceRecords: AttendanceRecord[] = [],
    overtimeEntries: OvertimeEntry[] = []
  ) {
    const baseSalary = parseFloat(employee.baseSalary);
    
    const totalAllowances = allowances
      .filter(a => a.isRecurring)
      .reduce((sum, a) => sum + parseFloat(a.amount), 0);
    
    // Calculate attendance deduction based on approved absences only
    // Standard 8 hours per day
    const standardDailyHours = 8;
    const hourlyRate = baseSalary / (standardDailyHours * 22); // ~22 working days per month
    
    // Deduct only for approved absences
    const approvedAbsences = attendanceRecords.filter(r => 
      r.status === 'Approved' && r.type === 'absence'
    );
    const totalAbsenceHours = approvedAbsences.reduce((sum, r) => {
      // If hoursWorked is specified, use the shortfall from standard day
      // Otherwise, assume full day absence
      if (r.hoursWorked) {
        const workedHours = parseFloat(r.hoursWorked);
        return sum + Math.max(0, standardDailyHours - workedHours);
      }
      return sum + standardDailyHours;
    }, 0);
    
    const attendanceDeduction = totalAbsenceHours * hourlyRate;
    
    // Calculate total hours worked from all approved attendance records
    const totalHoursWorked = attendanceRecords
      .filter(r => r.status === 'Approved' && r.hoursWorked)
      .reduce((sum, r) => sum + parseFloat(r.hoursWorked!), 0);

    // Calculate overtime addition
    const approvedOvertime = overtimeEntries.filter(e => e.status === 'Approved');
    const overtimeAddition = approvedOvertime.reduce((sum, e) => {
      const hours = parseFloat(e.hours);
      const multiplier = parseFloat(e.rateMultiplier);
      return sum + (hours * hourlyRate * multiplier);
    }, 0);
    
    // Apply attendance deduction BEFORE calculating statutory deductions
    // Gross pay is reduced by absences and increased by overtime
    const grossPay = baseSalary + totalAllowances - attendanceDeduction + overtimeAddition;
    
    const taxableAllowances = allowances
      .filter(a => a.isRecurring && a.isTaxable)
      .reduce((sum, a) => sum + parseFloat(a.amount), 0);
    
    // Taxable income includes overtime but accounts for attendance deductions
    const taxableIncome = baseSalary + taxableAllowances - attendanceDeduction + overtimeAddition;
    
    // Calculate statutory deductions based on adjusted gross pay
    const payeCalc = this.calculatePAYE(taxableIncome);
    const napsa = this.calculateNAPSA(grossPay, employee.isNapsaExempt);
    const nhima = this.calculateNHIMA(grossPay, employee.isNhimaExempt);
    
    const otherDeductions = deductions
      .filter(d => d.isRecurring)
      .reduce((sum, d) => sum + parseFloat(d.amount), 0);
    
    // Total deductions do NOT include attendance deduction (already applied to gross pay)
    const totalStatutory = payeCalc.paye + napsa.employee + nhima;
    const totalDeductions = totalStatutory + otherDeductions;
    const netPay = grossPay - totalDeductions;

    return {
      employeeId: employee.id,
      period,
      baseSalary: baseSalary.toFixed(2),
      allowances: allowances.map(a => ({
        name: a.name,
        amount: a.amount,
        isTaxable: a.isTaxable,
      })),
      deductions: deductions.map(d => ({
        name: d.name,
        amount: d.amount,
      })),
      attendanceDeduction: attendanceDeduction.toFixed(2),
      overtimeAddition: overtimeAddition.toFixed(2),
      totalHoursWorked: totalHoursWorked.toFixed(2),
      approvedOvertimeHours: approvedOvertime.reduce((sum, e) => sum + parseFloat(e.hours), 0).toFixed(2),
      grossPay: grossPay.toFixed(2),
      taxableIncome: taxableIncome.toFixed(2),
      paye: payeCalc.paye.toFixed(2),
      payeCalculation: payeCalc.breakdown,
      napsaEmployee: napsa.employee.toFixed(2),
      napsaEmployer: napsa.employer.toFixed(2),
      nhima: nhima.toFixed(2),
      totalStatutory: totalStatutory.toFixed(2),
      totalDeductions: totalDeductions.toFixed(2),
      netPay: netPay.toFixed(2),
    };
  }
}
