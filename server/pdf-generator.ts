import PDFDocument from "pdfkit";
import type { Payslip, Employee, PayrollRun, Report } from "@shared/schema";

export class PDFGenerator {
  generatePayslipPDF(payslip: Payslip, employee: Employee, payrollRun: PayrollRun): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header with gradient effect (using colored rectangles)
        doc.rect(0, 0, 612, 150).fill('#4F46E5');
        
        // Company name and payslip title
        doc.fillColor('#FFFFFF')
          .fontSize(28)
          .font('Helvetica-Bold')
          .text('INNOVARE PAYROLL', 50, 40);
        
        doc.fontSize(14)
          .font('Helvetica')
          .text('Complete HR & Payroll Management System', 50, 75);
        
        doc.fontSize(20)
          .font('Helvetica-Bold')
          .text('PAYSLIP', 400, 50);

        // Period box
        doc.rect(400, 80, 150, 50)
          .fillAndStroke('#6366F1', '#4F46E5');
        
        doc.fillColor('#FFFFFF')
          .fontSize(10)
          .text('Period', 410, 90);
        
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .text(payslip.period, 410, 105);

        // Employee details section
        doc.fillColor('#1F2937')
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Employee Details', 50, 170);

        doc.rect(50, 185, 512, 80).stroke('#E5E7EB');

        const employeeDetails = [
          ['Name:', `${employee.firstName} ${employee.lastName}`],
          ['Employee Number:', employee.employeeNumber],
          ['NRC:', employee.nrcNumber],
          ['Position:', employee.position || 'N/A'],
          ['Department:', employee.department || 'N/A'],
        ];

        let yPos = 200;
        employeeDetails.forEach((detail, index) => {
          if (index < 3) {
            doc.fillColor('#6B7280')
              .fontSize(9)
              .font('Helvetica')
              .text(detail[0], 60, yPos, { width: 140 });
            
            doc.fillColor('#1F2937')
              .fontSize(10)
              .font('Helvetica-Bold')
              .text(detail[1], 200, yPos, { width: 150 });
          } else {
            doc.fillColor('#6B7280')
              .fontSize(9)
              .font('Helvetica')
              .text(detail[0], 370, yPos - 30 * (index - 3), { width: 80 });
            
            doc.fillColor('#1F2937')
              .fontSize(10)
              .font('Helvetica-Bold')
              .text(detail[1], 450, yPos - 30 * (index - 3), { width: 100 });
          }
          if (index < 3) yPos += 22;
        });

        // Earnings section
        yPos = 290;
        doc.fillColor('#059669')
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Earnings', 50, yPos);

        doc.rect(50, yPos + 15, 512, 2).fill('#059669');

        yPos += 30;
        const baseSalary = parseFloat(payslip.baseSalary);
        
        doc.fillColor('#1F2937')
          .fontSize(10)
          .font('Helvetica')
          .text('Basic Salary', 60, yPos);
        
        doc.font('Helvetica-Bold')
          .text(`ZMW ${baseSalary.toLocaleString('en-ZM', { minimumFractionDigits: 2 })}`, 400, yPos, { align: 'right' });

        yPos += 20;

        // Allowances
        const allowances = Array.isArray(payslip.allowances) ? payslip.allowances : [];
        if (allowances.length > 0) {
          allowances.forEach((allowance: any) => {
            doc.fillColor('#6B7280')
              .fontSize(9)
              .font('Helvetica')
              .text(`${allowance.name}`, 70, yPos);
            
            doc.fillColor('#059669')
              .fontSize(10)
              .font('Helvetica')
              .text(`ZMW ${parseFloat(String(allowance.amount)).toLocaleString('en-ZM', { minimumFractionDigits: 2 })}`, 400, yPos, { align: 'right' });
            
            yPos += 18;
          });
        }

        yPos += 5;
        doc.rect(50, yPos, 512, 1).fill('#D1D5DB');
        yPos += 15;

        doc.fillColor('#1F2937')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('Gross Pay', 60, yPos);
        
        doc.fillColor('#059669')
          .text(`ZMW ${parseFloat(payslip.grossPay).toLocaleString('en-ZM', { minimumFractionDigits: 2 })}`, 400, yPos, { align: 'right' });

        // Deductions section
        yPos += 40;
        doc.fillColor('#DC2626')
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Deductions', 50, yPos);

        doc.rect(50, yPos + 15, 512, 2).fill('#DC2626');

        yPos += 30;

        // Statutory deductions
        const statutoryDeductions = [
          ['PAYE Tax', parseFloat(payslip.paye)],
          ['NAPSA (Employee)', parseFloat(payslip.napsaEmployee)],
          ['NHIMA', parseFloat(payslip.nhima)],
        ];

        statutoryDeductions.forEach((ded) => {
          doc.fillColor('#1F2937')
            .fontSize(10)
            .font('Helvetica')
            .text(ded[0], 60, yPos);
          
          doc.fillColor('#DC2626')
            .text(`ZMW ${(ded[1] as number).toLocaleString('en-ZM', { minimumFractionDigits: 2 })}`, 400, yPos, { align: 'right' });
          
          yPos += 20;
        });

        // Other deductions
        const otherDeductions = Array.isArray(payslip.deductions) ? payslip.deductions : [];
        if (otherDeductions.length > 0) {
          otherDeductions.forEach((deduction: any) => {
            doc.fillColor('#6B7280')
              .fontSize(9)
              .font('Helvetica')
              .text(`${deduction.name}`, 70, yPos);
            
            doc.fillColor('#DC2626')
              .fontSize(10)
              .text(`ZMW ${parseFloat(String(deduction.amount)).toLocaleString('en-ZM', { minimumFractionDigits: 2 })}`, 400, yPos, { align: 'right' });
            
            yPos += 18;
          });
        }

        yPos += 5;
        doc.rect(50, yPos, 512, 1).fill('#D1D5DB');
        yPos += 15;

        doc.fillColor('#1F2937')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('Total Deductions', 60, yPos);
        
        doc.fillColor('#DC2626')
          .text(`ZMW ${parseFloat(payslip.totalDeductions).toLocaleString('en-ZM', { minimumFractionDigits: 2 })}`, 400, yPos, { align: 'right' });

        // Net pay section
        yPos += 40;
        doc.rect(50, yPos, 512, 60).fillAndStroke('#4F46E5', '#4338CA');

        doc.fillColor('#FFFFFF')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text('NET PAY', 60, yPos + 15);
        
        doc.fontSize(20)
          .text(`ZMW ${parseFloat(payslip.netPay).toLocaleString('en-ZM', { minimumFractionDigits: 2 })}`, 300, yPos + 18, { align: 'right' });

        // Bank details
        yPos += 80;
        doc.fillColor('#6B7280')
          .fontSize(9)
          .font('Helvetica')
          .text('Payment Method: Bank Transfer', 50, yPos);
        
        if (employee.bankName && employee.bankAccount) {
          doc.text(`Bank: ${employee.bankName} | Account: ${employee.bankAccount}`, 50, yPos + 15);
        }

        // Footer
        doc.fontSize(8)
          .fillColor('#9CA3AF')
          .text('This is a computer-generated document. No signature required.', 50, 750, { align: 'center', width: 512 });
        
        doc.text('For any queries, please contact the HR department.', 50, 765, { align: 'center', width: 512 });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  generateReportPDF(report: Report): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.rect(0, 0, 612, 100).fill('#4F46E5');
        
        doc.fillColor('#FFFFFF')
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('INNOVARE PAYROLL', 50, 30);
        
        doc.fontSize(16)
          .text(`${report.type} Report`, 50, 60);

        // Report details
        doc.fillColor('#1F2937')
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Report Details', 50, 120);

        doc.fontSize(10)
          .font('Helvetica')
          .text(`Period: ${report.period}`, 50, 145)
          .text(`Generated: ${new Date(report.createdAt).toLocaleString()}`, 50, 165)
          .text(`Report Type: ${report.type}`, 50, 185);

        // Report data table
        let yPos = 220;
        const reportData = report.data as any;

        if (Array.isArray(reportData.items)) {
          // Table header
          doc.rect(50, yPos, 512, 30).fill('#F3F4F6');
          
          doc.fillColor('#1F2937')
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Employee', 60, yPos + 10)
            .text('Amount', 450, yPos + 10, { align: 'right' });

          yPos += 35;

          // Table rows
          reportData.items.forEach((item: any, index: number) => {
            if (index % 2 === 0) {
              doc.rect(50, yPos - 5, 512, 25).fill('#FFFFFF');
            } else {
              doc.rect(50, yPos - 5, 512, 25).fill('#F9FAFB');
            }

            doc.fillColor('#1F2937')
              .fontSize(9)
              .font('Helvetica')
              .text(item.employeeName || item.description || 'N/A', 60, yPos)
              .text(`ZMW ${parseFloat(item.amount || 0).toLocaleString('en-ZM', { minimumFractionDigits: 2 })}`, 450, yPos, { align: 'right' });

            yPos += 25;

            if (yPos > 700) {
              doc.addPage();
              yPos = 50;
            }
          });

          // Total
          yPos += 10;
          doc.rect(50, yPos, 512, 30).fill('#4F46E5');
          
          doc.fillColor('#FFFFFF')
            .fontSize(11)
            .font('Helvetica-Bold')
            .text('Total', 60, yPos + 10)
            .text(`ZMW ${parseFloat(reportData.total || 0).toLocaleString('en-ZM', { minimumFractionDigits: 2 })}`, 450, yPos + 10, { align: 'right' });
        }

        // Footer
        doc.fontSize(8)
          .fillColor('#9CA3AF')
          .text('Generated by Innovare Payroll System', 50, 750, { align: 'center', width: 512 });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
