import * as XLSX from 'xlsx';
import { InsertEmployee, insertEmployeeSchema } from '../shared/schema';

export function generateEmployeeTemplate(): XLSX.WorkBook {
  const headers = [
    'Employee Number*',
    'First Name*',
    'Last Name*',
    'NRC Number*',
    'Email',
    'Phone',
    'Date of Birth (YYYY-MM-DD)',
    'Gender (Male/Female/Other)',
    'Address',
    'Residential Address',
    'Department',
    'Position',
    'Hire Date (YYYY-MM-DD)*',
    'Payment Method* (bank/cash/mobile_money)',
    'Bank Name',
    'Bank Account',
    'Bank Branch',
    'Mobile Money Provider (MTN/Airtel/Zamtel)',
    'Mobile Money Number',
    'Base Salary (ZMW)*',
    'PAYE Number',
    'NAPSA Number',
    'NHIMA Number',
    'Is NAPSA Exempt (TRUE/FALSE)',
    'Is NHIMA Exempt (TRUE/FALSE)',
    'Is Active (TRUE/FALSE)',
  ];

  const exampleRow = [
    'EMP001',
    'John',
    'Mwale',
    '123456/78/9',
    'john@example.com',
    '+260 XXX XXX XXX',
    '1990-01-15',
    'Male',
    'P.O. Box 1234',
    'Plot 123, Kabulonga, Lusaka',
    'Finance',
    'Accountant',
    '2024-01-01',
    'bank',
    'Zanaco',
    '1234567890',
    'Lusaka Main',
    '',
    '',
    '5000.00',
    'PAYE123456',
    'NAPSA123456',
    'NHIMA123456',
    'FALSE',
    'FALSE',
    'TRUE',
  ];

  const worksheetData = [headers, exampleRow];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  const colWidths = headers.map(() => ({ wch: 20 }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
  
  return workbook;
}

export function parseEmployeeExcel(buffer: Buffer): { employees: InsertEmployee[], errors: string[] } {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  
  if (rawData.length < 2) {
    return { employees: [], errors: ['Excel file must contain at least a header row and one data row'] };
  }

  const headers = rawData[0];
  const dataRows = rawData.slice(1);
  
  const employees: InsertEmployee[] = [];
  const errors: string[] = [];

  dataRows.forEach((row, index) => {
    const rowNumber = index + 2;
    
    if (row.every(cell => !cell)) {
      return;
    }

    try {
      const employeeData: any = {
        employeeNumber: row[0]?.toString().trim() || '',
        firstName: row[1]?.toString().trim() || '',
        lastName: row[2]?.toString().trim() || '',
        nrcNumber: row[3]?.toString().trim() || '',
        email: row[4]?.toString().trim() || null,
        phone: row[5]?.toString().trim() || null,
        dateOfBirth: row[6]?.toString().trim() || null,
        gender: row[7]?.toString().trim() || null,
        address: row[8]?.toString().trim() || null,
        residentialAddress: row[9]?.toString().trim() || null,
        department: row[10]?.toString().trim() || null,
        position: row[11]?.toString().trim() || null,
        hireDate: row[12]?.toString().trim() || '',
        paymentMethod: row[13]?.toString().trim().toLowerCase() || 'bank',
        bankName: row[14]?.toString().trim() || null,
        bankAccount: row[15]?.toString().trim() || null,
        bankBranch: row[16]?.toString().trim() || null,
        mobileMoneyProvider: row[17]?.toString().trim() || null,
        mobileMoneyNumber: row[18]?.toString().trim() || null,
        baseSalary: row[19]?.toString().trim() || '0',
        payeNumber: row[20]?.toString().trim() || null,
        napsaNumber: row[21]?.toString().trim() || null,
        nhimaNumber: row[22]?.toString().trim() || null,
        isNapsaExempt: row[23]?.toString().trim().toUpperCase() === 'TRUE',
        isNhimaExempt: row[24]?.toString().trim().toUpperCase() === 'TRUE',
        isActive: row[25] === undefined || row[25]?.toString().trim().toUpperCase() === 'TRUE',
      };

      const result = insertEmployeeSchema.safeParse(employeeData);
      
      if (!result.success) {
        const errorMessages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        errors.push(`Row ${rowNumber}: ${errorMessages}`);
      } else {
        employees.push(result.data);
      }
    } catch (error) {
      errors.push(`Row ${rowNumber}: Failed to parse - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return { employees, errors };
}
