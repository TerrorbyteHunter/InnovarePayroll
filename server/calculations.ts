import type { StatutoryConfig, Employee, Allowance, Deduction } from "@shared/schema";

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
    period: string
  ) {
    const baseSalary = parseFloat(employee.baseSalary);
    
    const totalAllowances = allowances
      .filter(a => a.isRecurring)
      .reduce((sum, a) => sum + parseFloat(a.amount), 0);
    
    const grossPay = baseSalary + totalAllowances;
    
    const taxableAllowances = allowances
      .filter(a => a.isRecurring && a.isTaxable)
      .reduce((sum, a) => sum + parseFloat(a.amount), 0);
    
    const taxableIncome = baseSalary + taxableAllowances;
    
    const payeCalc = this.calculatePAYE(taxableIncome);
    const napsa = this.calculateNAPSA(grossPay, employee.isNapsaExempt);
    const nhima = this.calculateNHIMA(grossPay, employee.isNhimaExempt);
    
    const otherDeductions = deductions
      .filter(d => d.isRecurring)
      .reduce((sum, d) => sum + parseFloat(d.amount), 0);
    
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
