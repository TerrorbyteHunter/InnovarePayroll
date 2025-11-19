import * as XLSX from 'xlsx';
import type { Employee, Payslip, PayrollRun } from '@shared/schema';

export class ExcelGenerator {
  /**
   * Generate attendance register template for download
   */
  generateAttendanceTemplate(employees: Employee[], period: string): Buffer {
    const worksheetData = [
      // Header row
      [
        'Employee Number',
        'Employee Name',
        'Department',
        'Date',
        'Status',
        'Hours Worked',
        'Overtime Hours',
        'Late Minutes',
        'Reason/Notes'
      ],
      // Instructions row
      [
        'Fill in the following rows for each employee',
        '',
        '',
        'Use format: YYYY-MM-DD',
        'Present/Absent/Sick/Leave',
        'Regular hours (e.g., 8)',
        'Extra hours (e.g., 2)',
        'Minutes late (e.g., 15)',
        'Any notes or comments'
      ],
    ];

    // Add rows for each employee (example for first day of month)
    employees.forEach(emp => {
      worksheetData.push([
        emp.employeeNumber,
        `${emp.firstName} ${emp.lastName}`,
        emp.department || '',
        '', // Date to be filled
        'Present', // Default status
        '8', // Default hours
        '0', // Default overtime
        '0', // Default late minutes
        '' // Notes
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Employee Number
      { wch: 25 }, // Employee Name
      { wch: 15 }, // Department
      { wch: 12 }, // Date
      { wch: 12 }, // Status
      { wch: 12 }, // Hours Worked
      { wch: 15 }, // Overtime Hours
      { wch: 12 }, // Late Minutes
      { wch: 30 }, // Reason/Notes
    ];

    // Style header row
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center" }
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Register');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Parse attendance data from uploaded Excel file
   */
  parseAttendanceFile(buffer: Buffer): Array<{
    employeeNumber: string;
    date: string;
    status: string;
    hoursWorked: number;
    overtimeHours: number;
    lateMinutes: number;
    notes: string;
  }> {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

    const records: Array<{
      employeeNumber: string;
      date: string;
      status: string;
      hoursWorked: number;
      overtimeHours: number;
      lateMinutes: number;
      notes: string;
    }> = [];

    // Skip header rows (first 2 rows)
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[0] || !row[3]) continue; // Skip empty rows or rows without employee number and date

      // Parse date - handle both Date objects and string formats
      let dateStr = '';
      const dateValue = row[3];
      if (dateValue instanceof Date) {
        // Convert Date object to YYYY-MM-DD format
        dateStr = dateValue.toISOString().split('T')[0];
      } else if (typeof dateValue === 'number') {
        // Excel serial date number - convert to YYYY-MM-DD
        const excelEpoch = new Date(1900, 0, 1);
        const daysOffset = dateValue - 2; // Excel has a 1900 leap year bug
        const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
        dateStr = date.toISOString().split('T')[0];
      } else {
        // String format - validate it's YYYY-MM-DD
        dateStr = String(dateValue).trim();
        // Basic validation for YYYY-MM-DD format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          console.warn(`Invalid date format: ${dateStr}, skipping row`);
          continue;
        }
      }

      records.push({
        employeeNumber: String(row[0]).trim(),
        date: dateStr,
        status: String(row[4] || 'Present').trim(),
        hoursWorked: parseFloat(String(row[5] || '0')),
        overtimeHours: parseFloat(String(row[6] || '0')),
        lateMinutes: parseFloat(String(row[7] || '0')),
        notes: String(row[8] || '').trim(),
      });
    }

    return records;
  }

  /**
   * Generate attendance export with all records
   */
  generateAttendanceExport(
    recordsWithEmployees: Array<any>
  ): Buffer {
    const worksheetData: (string | number)[][] = [
      // Header row
      [
        'Employee Number',
        'Employee Name',
        'Department',
        'Date',
        'Type',
        'Hours Worked',
        'Status',
        'Reason',
        'Notes'
      ]
    ];

    // Add attendance records
    recordsWithEmployees.forEach(record => {
      const emp = record.employee;
      worksheetData.push([
        emp?.employeeNumber || '',
        emp ? `${emp.firstName} ${emp.lastName}` : '',
        emp?.department || '',
        new Date(record.date).toISOString().split('T')[0],
        record.type,
        record.hoursWorked || '0',
        record.status,
        record.reason || '',
        record.notes || ''
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Employee Number
      { wch: 25 }, // Employee Name
      { wch: 15 }, // Department
      { wch: 12 }, // Date
      { wch: 12 }, // Type
      { wch: 12 }, // Hours Worked
      { wch: 12 }, // Status
      { wch: 30 }, // Reason
      { wch: 30 }, // Notes
    ];

    // Style header row
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center" }
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Records');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Generate payroll export with all employee payslips
   */
  generatePayrollExport(
    payrollRun: PayrollRun,
    payslips: Array<Payslip & { employee: Employee }>
  ): Buffer {
    const worksheetData: (string | number)[][] = [
      // Header row
      [
        'Payroll Period',
        payrollRun.period,
        '',
        'Total Employees',
        payrollRun.employeeCount,
        '',
        'Total Gross',
        `ZMW ${parseFloat(payrollRun.totalGross).toLocaleString('en-ZM', { minimumFractionDigits: 2 })}`,
        '',
        'Total Net',
        `ZMW ${parseFloat(payrollRun.totalNet).toLocaleString('en-ZM', { minimumFractionDigits: 2 })}`
      ],
      [], // Empty row
      // Column headers
      [
        'Employee Number',
        'Employee Name',
        'Department',
        'Position',
        'NRC Number',
        'Bank',
        'Account Number',
        'Base Salary',
        'Total Allowances',
        'Gross Pay',
        'PAYE',
        'NAPSA (Employee)',
        'NAPSA (Employer)',
        'NHIMA',
        'Other Deductions',
        'Total Deductions',
        'Net Pay',
        'Residential Address'
      ]
    ];

    // Add payslip data rows
    payslips.forEach(ps => {
      const allowancesTotal = Array.isArray(ps.allowances)
        ? ps.allowances.reduce((sum: number, a: any) => sum + parseFloat(String(a.amount || 0)), 0)
        : 0;

      const otherDeductionsTotal = Array.isArray(ps.deductions)
        ? ps.deductions.reduce((sum: number, d: any) => sum + parseFloat(String(d.amount || 0)), 0)
        : 0;

      worksheetData.push([
        ps.employee.employeeNumber,
        `${ps.employee.firstName} ${ps.employee.lastName}`,
        ps.employee.department || '',
        ps.employee.position || '',
        ps.employee.nrcNumber,
        ps.employee.bankName || '',
        ps.employee.bankAccount || '',
        parseFloat(String(ps.baseSalary)),
        allowancesTotal,
        parseFloat(String(ps.grossPay)),
        parseFloat(String(ps.paye)),
        parseFloat(String(ps.napsaEmployee)),
        parseFloat(String(ps.napsaEmployer)),
        parseFloat(String(ps.nhima)),
        otherDeductionsTotal,
        parseFloat(String(ps.totalDeductions)),
        parseFloat(String(ps.netPay)),
        ps.employee.residentialAddress || ps.employee.address || ''
      ]);
    });

    // Add totals row
    const totalBaseSalary = payslips.reduce((sum, ps) => sum + parseFloat(ps.baseSalary), 0);
    const totalGross = payslips.reduce((sum, ps) => sum + parseFloat(ps.grossPay), 0);
    const totalPaye = payslips.reduce((sum, ps) => sum + parseFloat(ps.paye), 0);
    const totalNapsaEmp = payslips.reduce((sum, ps) => sum + parseFloat(ps.napsaEmployee), 0);
    const totalNapsaEr = payslips.reduce((sum, ps) => sum + parseFloat(ps.napsaEmployer), 0);
    const totalNhima = payslips.reduce((sum, ps) => sum + parseFloat(ps.nhima), 0);
    const totalDeductions = payslips.reduce((sum, ps) => sum + parseFloat(ps.totalDeductions), 0);
    const totalNet = payslips.reduce((sum, ps) => sum + parseFloat(ps.netPay), 0);

    worksheetData.push([]);
    worksheetData.push([
      '',
      '',
      '',
      '',
      '',
      '',
      'TOTALS:',
      totalBaseSalary,
      '',
      totalGross,
      totalPaye,
      totalNapsaEmp,
      totalNapsaEr,
      totalNhima,
      '',
      totalDeductions,
      totalNet,
      ''
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Employee Number
      { wch: 25 }, // Employee Name
      { wch: 15 }, // Department
      { wch: 20 }, // Position
      { wch: 15 }, // NRC
      { wch: 15 }, // Bank
      { wch: 18 }, // Account
      { wch: 12 }, // Base Salary
      { wch: 15 }, // Total Allowances
      { wch: 12 }, // Gross Pay
      { wch: 12 }, // PAYE
      { wch: 15 }, // NAPSA Employee
      { wch: 15 }, // NAPSA Employer
      { wch: 12 }, // NHIMA
      { wch: 15 }, // Other Deductions
      { wch: 15 }, // Total Deductions
      { wch: 15 }, // Net Pay
      { wch: 30 }, // Residential Address
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Summary');

    // Add detailed breakdown sheet
    const detailsData = [
      ['Employee Number', 'Employee Name', 'Item Type', 'Item Name', 'Amount']
    ];

    payslips.forEach(ps => {
      const empName = `${ps.employee.firstName} ${ps.employee.lastName}`;
      
      // Add allowances
      if (Array.isArray(ps.allowances)) {
        ps.allowances.forEach((a: any) => {
          detailsData.push([
            ps.employee.employeeNumber,
            empName,
            'Allowance',
            a.name,
            parseFloat(String(a.amount || 0))
          ]);
        });
      }

      // Add deductions
      if (Array.isArray(ps.deductions)) {
        ps.deductions.forEach((d: any) => {
          detailsData.push([
            ps.employee.employeeNumber,
            empName,
            'Deduction',
            d.name,
            parseFloat(String(d.amount || 0))
          ]);
        });
      }
    });

    const detailsWorksheet = XLSX.utils.aoa_to_sheet(detailsData);
    detailsWorksheet['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
      { wch: 12 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, detailsWorksheet, 'Allowances & Deductions');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Generate employee list export
   */
  generateEmployeeListExport(employees: Employee[]): Buffer {
    const worksheetData: (string | number)[][] = [
      // Header row
      [
        'Employee Number',
        'First Name',
        'Last Name',
        'NRC Number',
        'Email',
        'Phone',
        'Date of Birth',
        'Gender',
        'Residential Address',
        'Department',
        'Position',
        'Hire Date',
        'Bank Name',
        'Bank Account',
        'Bank Branch',
        'Base Salary',
        'PAYE Number',
        'NAPSA Number',
        'NHIMA Number',
        'Status'
      ]
    ];

    employees.forEach(emp => {
      worksheetData.push([
        emp.employeeNumber,
        emp.firstName,
        emp.lastName,
        emp.nrcNumber,
        emp.email || '',
        emp.phone || '',
        emp.dateOfBirth || '',
        emp.gender || '',
        emp.residentialAddress || emp.address || '',
        emp.department || '',
        emp.position || '',
        emp.hireDate,
        emp.bankName || '',
        emp.bankAccount || '',
        emp.bankBranch || '',
        parseFloat(String(emp.baseSalary)),
        emp.payeNumber || '',
        emp.napsaNumber || '',
        emp.nhimaNumber || '',
        emp.isActive ? 'Active' : 'Inactive'
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!cols'] = Array(20).fill({ wch: 15 });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
