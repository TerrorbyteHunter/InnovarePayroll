import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { PayrollCalculator } from "./calculations";
import { PDFGenerator } from "./pdf-generator";
import { ExcelGenerator } from "./excel-generator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { 
  insertUserSchema, loginSchema, insertEmployeeSchema,
  insertPayrollRunSchema, insertLeaveRequestSchema, insertAdvanceSchema,
  insertAttendanceRecordSchema, insertOvertimeEntrySchema
} from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "innovare-payroll-secret-key";

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware for authentication
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error });
      }

      const { username, email, password, ...rest } = result.data;

      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        ...rest,
      });

      res.status(201).json({ message: "User created successfully", userId: user.id });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const { username, password } = result.data;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Employee Routes
  app.get("/api/employees", authenticateToken, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/employees/:id", authenticateToken, async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/employees", authenticateToken, async (req, res) => {
    try {
      const result = insertEmployeeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error });
      }

      // Check for duplicate employee number
      const existing = await storage.getEmployeeByNumber(result.data.employeeNumber);
      if (existing) {
        return res.status(400).json({ message: "Employee number already exists" });
      }

      const employee = await storage.createEmployee(result.data);
      
      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: "CREATE_EMPLOYEE",
        entity: "Employee",
        entityId: employee.id,
        beforeSnapshot: null,
        afterSnapshot: employee,
        metadata: null,
      });

      res.status(201).json(employee);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/employees/:id", authenticateToken, async (req, res) => {
    try {
      const before = await storage.getEmployee(req.params.id);
      if (!before) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const employee = await storage.updateEmployee(req.params.id, req.body);
      
      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: "UPDATE_EMPLOYEE",
        entity: "Employee",
        entityId: employee.id,
        beforeSnapshot: before,
        afterSnapshot: employee,
        metadata: null,
      });

      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/employees/template/download", authenticateToken, async (req, res) => {
    try {
      const { generateEmployeeTemplate } = await import("./employee-import");
      const XLSX = await import("xlsx");
      
      const workbook = generateEmployeeTemplate();
      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
      
      res.setHeader("Content-Disposition", "attachment; filename=employee_import_template.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.send(buffer);
    } catch (error) {
      console.error("Template download error:", error);
      res.status(500).json({ message: "Failed to generate template" });
    }
  });

  app.post("/api/employees/bulk-import", authenticateToken, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { parseEmployeeExcel } = await import("./employee-import");
      const { employees, errors } = parseEmployeeExcel(req.file.buffer);

      if (errors.length > 0 && employees.length === 0) {
        return res.status(400).json({ message: "No valid employees found", errors });
      }

      const results = {
        successful: [] as any[],
        failed: [] as { row: string; error: string }[],
      };

      for (let i = 0; i < employees.length; i++) {
        const employeeData = employees[i];
        try {
          const existing = await storage.getEmployeeByNumber(employeeData.employeeNumber);
          if (existing) {
            results.failed.push({
              row: `Employee ${employeeData.employeeNumber}`,
              error: "Employee number already exists",
            });
            continue;
          }

          const employee = await storage.createEmployee(employeeData);
          
          await storage.createAuditLog({
            userId: (req as any).user.id,
            action: "BULK_IMPORT_EMPLOYEE",
            entity: "Employee",
            entityId: employee.id,
            beforeSnapshot: null,
            afterSnapshot: employee,
            metadata: { importBatch: new Date().toISOString() },
          });

          results.successful.push(employee);
        } catch (error) {
          results.failed.push({
            row: `Employee ${employeeData.employeeNumber}`,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      res.json({
        message: `Imported ${results.successful.length} employees. ${results.failed.length} failed.`,
        successful: results.successful.length,
        failed: results.failed.length,
        errors: results.failed,
        parseErrors: errors,
      });
    } catch (error) {
      console.error("Bulk import error:", error);
      res.status(500).json({ message: "Failed to import employees" });
    }
  });

  app.delete("/api/employees/:id", authenticateToken, async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      await storage.deleteEmployee(req.params.id);
      
      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: "DELETE_EMPLOYEE",
        entity: "Employee",
        entityId: req.params.id,
        beforeSnapshot: employee,
        afterSnapshot: null,
        metadata: null,
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Payroll Routes
  app.get("/api/payroll", authenticateToken, async (req, res) => {
    try {
      const payrollRuns = await storage.getPayrollRuns();
      res.json(payrollRuns);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/payroll", authenticateToken, async (req, res) => {
    try {
      const result = insertPayrollRunSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error });
      }

      const payrollRun = await storage.createPayrollRun({
        ...result.data,
        createdBy: (req as any).user.id,
      });

      // Calculate totals
      const employees = await storage.getEmployees();
      const activeEmployees = employees.filter(e => e.isActive);
      const config = await storage.getActiveStatutoryConfig();
      
      if (!config) {
        return res.status(400).json({ message: "No active statutory configuration" });
      }

      const calculator = new PayrollCalculator(config);
      let totalGross = 0;
      let totalPaye = 0;
      let totalNapsa = 0;
      let totalNhima = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      for (const employee of activeEmployees) {
        const allowances = await storage.getEmployeeAllowances(employee.id);
        const deductions = await storage.getEmployeeDeductions(employee.id);
        
        // Fetch attendance and overtime for this employee and period
        // Period format is YYYY-MM, dates are YYYY-MM-DD
        const allAttendance = await storage.getAttendanceRecords();
        const employeeAttendance = allAttendance.filter(r => 
          r.employeeId === employee.id && r.date.startsWith(payrollRun.period)
        );
        
        const allOvertime = await storage.getOvertimeEntries();
        const employeeOvertime = allOvertime.filter(e => 
          e.employeeId === employee.id && e.date.startsWith(payrollRun.period)
        );
        
        const payslipCalc = calculator.calculatePayslip(
          employee, 
          allowances, 
          deductions, 
          payrollRun.period,
          employeeAttendance,
          employeeOvertime
        );

        totalGross += parseFloat(payslipCalc.grossPay);
        totalPaye += parseFloat(payslipCalc.paye);
        totalNapsa += parseFloat(payslipCalc.napsaEmployee) + parseFloat(payslipCalc.napsaEmployer);
        totalNhima += parseFloat(payslipCalc.nhima);
        totalDeductions += parseFloat(payslipCalc.totalDeductions);
        totalNet += parseFloat(payslipCalc.netPay);
      }

      const updated = await storage.updatePayrollRun(payrollRun.id, {
        totalGross: totalGross.toFixed(2),
        totalPaye: totalPaye.toFixed(2),
        totalNapsa: totalNapsa.toFixed(2),
        totalNhima: totalNhima.toFixed(2),
        totalDeductions: totalDeductions.toFixed(2),
        totalNet: totalNet.toFixed(2),
        employeeCount: activeEmployees.length,
      });

      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: "CREATE_PAYROLL_RUN",
        entity: "PayrollRun",
        entityId: updated.id,
        beforeSnapshot: null,
        afterSnapshot: updated,
        metadata: null,
      });

      res.status(201).json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/payroll/:id/preview", authenticateToken, async (req, res) => {
    try {
      const payrollRun = await storage.getPayrollRun(req.params.id);
      if (!payrollRun) {
        return res.status(404).json({ message: "Payroll run not found" });
      }

      const payslips = await storage.getPayslipsByPayrollRun(req.params.id);
      res.json(payslips);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/payroll/:id/approve", authenticateToken, async (req, res) => {
    try {
      const payrollRun = await storage.getPayrollRun(req.params.id);
      if (!payrollRun) {
        return res.status(404).json({ message: "Payroll run not found" });
      }

      if (payrollRun.status !== "Draft") {
        return res.status(400).json({ message: "Payroll run is not in draft status" });
      }

      const config = await storage.getActiveStatutoryConfig();
      if (!config) {
        return res.status(400).json({ message: "No active statutory configuration" });
      }

      const calculator = new PayrollCalculator(config);
      const employees = await storage.getEmployees();
      const activeEmployees = employees.filter(e => e.isActive);

      // Generate payslips
      for (const employee of activeEmployees) {
        const allowances = await storage.getEmployeeAllowances(employee.id);
        const deductions = await storage.getEmployeeDeductions(employee.id);
        
        // Fetch attendance and overtime for this employee and period
        // Period format is YYYY-MM, dates are YYYY-MM-DD
        const allAttendance = await storage.getAttendanceRecords();
        const employeeAttendance = allAttendance.filter(r => 
          r.employeeId === employee.id && r.date.startsWith(payrollRun.period)
        );
        
        const allOvertime = await storage.getOvertimeEntries();
        const employeeOvertime = allOvertime.filter(e => 
          e.employeeId === employee.id && e.date.startsWith(payrollRun.period)
        );
        
        const payslipData = calculator.calculatePayslip(
          employee, 
          allowances, 
          deductions, 
          payrollRun.period,
          employeeAttendance,
          employeeOvertime
        );

        await storage.createPayslip({
          payrollRunId: payrollRun.id,
          ...payslipData,
        });
      }

      const updated = await storage.updatePayrollRun(req.params.id, {
        status: "Approved",
        approvedBy: (req as any).user.id,
        approvedAt: new Date(),
      });

      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: "APPROVE_PAYROLL_RUN",
        entity: "PayrollRun",
        entityId: updated.id,
        beforeSnapshot: payrollRun,
        afterSnapshot: updated,
        metadata: null,
      });

      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/payroll/:id/lock", authenticateToken, async (req, res) => {
    try {
      const payrollRun = await storage.getPayrollRun(req.params.id);
      if (!payrollRun) {
        return res.status(404).json({ message: "Payroll run not found" });
      }

      if (payrollRun.status !== "Approved") {
        return res.status(400).json({ message: "Only approved payroll runs can be locked" });
      }

      const updated = await storage.updatePayrollRun(req.params.id, {
        status: "Locked",
      });

      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: "LOCK_PAYROLL_RUN",
        entity: "PayrollRun",
        entityId: updated.id,
        beforeSnapshot: payrollRun,
        afterSnapshot: updated,
        metadata: null,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/payroll/:id/unlock", authenticateToken, async (req, res) => {
    try {
      const payrollRun = await storage.getPayrollRun(req.params.id);
      if (!payrollRun) {
        return res.status(404).json({ message: "Payroll run not found" });
      }

      if (payrollRun.status !== "Locked") {
        return res.status(400).json({ message: "Only locked payroll runs can be unlocked" });
      }

      const updated = await storage.updatePayrollRun(req.params.id, {
        status: "Approved",
      });

      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: "UNLOCK_PAYROLL_RUN",
        entity: "PayrollRun",
        entityId: updated.id,
        beforeSnapshot: payrollRun,
        afterSnapshot: updated,
        metadata: null,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Payslip Routes
  app.get("/api/payslips", authenticateToken, async (req, res) => {
    try {
      const payslips = await storage.getPayslips();
      res.json(payslips);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/payslips/:id", authenticateToken, async (req, res) => {
    try {
      const payslip = await storage.getPayslip(req.params.id);
      if (!payslip) {
        return res.status(404).json({ message: "Payslip not found" });
      }
      res.json(payslip);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Download Payslip as PDF
  app.get("/api/payslips/:id/download", authenticateToken, async (req, res) => {
    try {
      const payslip = await storage.getPayslip(req.params.id);
      if (!payslip) {
        return res.status(404).json({ message: "Payslip not found" });
      }

      const employee = await storage.getEmployee(payslip.employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const payrollRun = await storage.getPayrollRun(payslip.payrollRunId);
      if (!payrollRun) {
        return res.status(404).json({ message: "Payroll run not found" });
      }

      const pdfGenerator = new PDFGenerator();
      const pdfBuffer = await pdfGenerator.generatePayslipPDF(payslip, employee, payrollRun);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payslip-${employee.employeeNumber}-${payslip.period}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Excel Export Routes

  // Download attendance register template
  app.get("/api/attendance/template/:period", authenticateToken, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      const activeEmployees = employees.filter(e => e.isActive);
      
      const excelGenerator = new ExcelGenerator();
      const excelBuffer = excelGenerator.generateAttendanceTemplate(activeEmployees, req.params.period);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-register-${req.params.period}.xlsx`);
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error generating attendance template:", error);
      res.status(500).json({ message: "Failed to generate attendance template" });
    }
  });

  // Import attendance from Excel
  app.post("/api/attendance/import", authenticateToken, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const excelGenerator = new ExcelGenerator();
      const records = excelGenerator.parseAttendanceFile(req.file.buffer);

      const created: any[] = [];
      const errors: any[] = [];

      for (const record of records) {
        try {
          // Find employee by employee number
          const employee = await storage.getEmployeeByNumber(record.employeeNumber);
          if (!employee) {
            errors.push({ record, error: "Employee not found" });
            continue;
          }

          // Determine attendance type
          let type = 'present';
          if (record.status.toLowerCase() === 'absent') type = 'absent';
          else if (record.status.toLowerCase() === 'sick') type = 'sick';
          else if (record.status.toLowerCase() === 'leave') type = 'leave';

          // Create attendance record
          const attendance = await storage.createAttendanceRecord({
            employeeId: employee.id,
            date: record.date,
            type,
            hoursWorked: String(record.hoursWorked),
            reason: record.notes,
            notes: record.lateMinutes > 0 ? `Late by ${record.lateMinutes} minutes` : undefined,
            status: 'Approved', // Auto-approve imports
          });

          created.push(attendance);

          // If overtime exists, create overtime entry
          if (record.overtimeHours > 0) {
            // Calculate overtime amount (assuming hourly rate from base salary / 160 hours per month)
            const hourlyRate = parseFloat(employee.baseSalary) / 160;
            const overtimeAmount = hourlyRate * 1.5 * record.overtimeHours;
            
            await storage.createOvertimeEntry({
              employeeId: employee.id,
              date: record.date,
              hours: String(record.overtimeHours),
              rateMultiplier: '1.5',
              amount: String(overtimeAmount.toFixed(2)),
              reason: record.notes || 'Imported from attendance register',
              status: 'Approved',
            });
          }
        } catch (err) {
          errors.push({ record, error: String(err) });
        }
      }

      res.json({
        message: `Imported ${created.length} attendance records`,
        created: created.length,
        errors: errors.length,
        errorDetails: errors
      });
    } catch (error) {
      console.error("Error importing attendance:", error);
      res.status(500).json({ message: "Failed to import attendance data" });
    }
  });

  // Export attendance records to Excel
  app.get("/api/attendance/export", authenticateToken, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      let attendanceRecords = await storage.getAttendanceRecords();
      
      // Filter by month if provided
      const month = req.query.month as string;
      if (month) {
        const [year, monthNum] = month.split('-');
        attendanceRecords = attendanceRecords.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate.getFullYear() === parseInt(year) && 
                 (recordDate.getMonth() + 1) === parseInt(monthNum);
        });
      }

      // Combine attendance with employee data
      const recordsWithEmployees = attendanceRecords.map(record => {
        const employee = employees.find(e => String(e.id) === record.employeeId);
        return {
          ...record,
          employee
        };
      });

      const excelGenerator = new ExcelGenerator();
      const excelBuffer = excelGenerator.generateAttendanceExport(recordsWithEmployees);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-export-${month || 'all'}.xlsx`);
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error exporting attendance:", error);
      res.status(500).json({ message: "Failed to export attendance data" });
    }
  });

  // Export payroll to Excel
  app.get("/api/payroll/:id/export", authenticateToken, async (req, res) => {
    try {
      const payrollRun = await storage.getPayrollRun(req.params.id);
      if (!payrollRun) {
        return res.status(404).json({ message: "Payroll run not found" });
      }

      const payslips = await storage.getPayslipsByPayrollRun(req.params.id);
      
      // Fetch employee data for each payslip
      const payslipsWithEmployees = await Promise.all(
        payslips.map(async (ps) => {
          const employee = await storage.getEmployee(ps.employeeId);
          return { ...ps, employee: employee! };
        })
      );

      const excelGenerator = new ExcelGenerator();
      const excelBuffer = excelGenerator.generatePayrollExport(payrollRun, payslipsWithEmployees);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=payroll-${payrollRun.period}.xlsx`);
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error exporting payroll:", error);
      res.status(500).json({ message: "Failed to export payroll" });
    }
  });

  // Export employee list to Excel
  app.get("/api/employees/export", authenticateToken, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      
      const excelGenerator = new ExcelGenerator();
      const excelBuffer = excelGenerator.generateEmployeeListExport(employees);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=employees-${new Date().toISOString().split('T')[0]}.xlsx`);
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error exporting employees:", error);
      res.status(500).json({ message: "Failed to export employee list" });
    }
  });

  // Reports Routes
  app.get("/api/reports", authenticateToken, async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/reports/generate", authenticateToken, async (req, res) => {
    try {
      const { type, period } = req.body;

      if (!type || !period) {
        return res.status(400).json({ message: "Type and period are required" });
      }

      const payslips = await storage.getPayslips();
      const periodPayslips = payslips.filter(p => p.period === period);

      let reportData: any = {};

      if (type === "PAYE") {
        reportData = {
          period,
          totalPaye: periodPayslips.reduce((sum, p) => sum + parseFloat(p.paye), 0).toFixed(2),
          employees: periodPayslips.map(p => ({
            employeeId: p.employeeId,
            taxableIncome: p.taxableIncome,
            paye: p.paye,
          })),
        };
      } else if (type === "NAPSA") {
        reportData = {
          period,
          totalEmployee: periodPayslips.reduce((sum, p) => sum + parseFloat(p.napsaEmployee), 0).toFixed(2),
          totalEmployer: periodPayslips.reduce((sum, p) => sum + parseFloat(p.napsaEmployer), 0).toFixed(2),
          employees: periodPayslips.map(p => ({
            employeeId: p.employeeId,
            grossPay: p.grossPay,
            napsaEmployee: p.napsaEmployee,
            napsaEmployer: p.napsaEmployer,
          })),
        };
      } else if (type === "NHIMA") {
        reportData = {
          period,
          totalNhima: periodPayslips.reduce((sum, p) => sum + parseFloat(p.nhima), 0).toFixed(2),
          employees: periodPayslips.map(p => ({
            employeeId: p.employeeId,
            grossPay: p.grossPay,
            nhima: p.nhima,
          })),
        };
      } else if (type === "PayrollJournal") {
        reportData = {
          period,
          totalGross: periodPayslips.reduce((sum, p) => sum + parseFloat(p.grossPay), 0).toFixed(2),
          totalNet: periodPayslips.reduce((sum, p) => sum + parseFloat(p.netPay), 0).toFixed(2),
          employees: periodPayslips.map(p => ({
            employeeId: p.employeeId,
            grossPay: p.grossPay,
            netPay: p.netPay,
          })),
        };
      }

      const report = await storage.createReport({
        type,
        period,
        payrollRunId: null,
        data: reportData,
        generatedBy: (req as any).user.id,
      });

      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Download Report as PDF
  app.get("/api/reports/:id/download", authenticateToken, async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      const pdfGenerator = new PDFGenerator();
      const pdfBuffer = await pdfGenerator.generateReportPDF(report);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${report.type}-${report.period}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating report PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Leave Routes
  app.get("/api/leave/policies", authenticateToken, async (req, res) => {
    try {
      const policies = await storage.getLeavePolicies();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/leave/requests", authenticateToken, async (req, res) => {
    try {
      const requests = await storage.getLeaveRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/leave/requests", authenticateToken, async (req, res) => {
    try {
      const result = insertLeaveRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error });
      }

      const request = await storage.createLeaveRequest(result.data);

      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: "CREATE_LEAVE_REQUEST",
        entity: "LeaveRequest",
        entityId: request.id,
        beforeSnapshot: null,
        afterSnapshot: request,
        metadata: null,
      });

      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/leave/requests/:id", authenticateToken, async (req, res) => {
    try {
      const before = await storage.getLeaveRequest(req.params.id);
      if (!before) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      const updated = await storage.updateLeaveRequest(req.params.id, {
        ...req.body,
        reviewedBy: (req as any).user.id,
        reviewedAt: new Date(),
      });

      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: "UPDATE_LEAVE_REQUEST",
        entity: "LeaveRequest",
        entityId: updated.id,
        beforeSnapshot: before,
        afterSnapshot: updated,
        metadata: null,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Advance Routes
  app.get("/api/advances", authenticateToken, async (req, res) => {
    try {
      const advances = await storage.getAdvances();
      res.json(advances);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/advances", authenticateToken, async (req, res) => {
    try {
      const result = insertAdvanceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error });
      }

      const advance = await storage.createAdvance(result.data);

      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: "CREATE_ADVANCE",
        entity: "Advance",
        entityId: advance.id,
        beforeSnapshot: null,
        afterSnapshot: advance,
        metadata: null,
      });

      res.status(201).json(advance);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/advances/:id", authenticateToken, async (req, res) => {
    try {
      const before = await storage.getAdvance(req.params.id);
      if (!before) {
        return res.status(404).json({ message: "Advance not found" });
      }

      const updateData: any = { ...req.body };

      if (req.body.status === "Approved") {
        updateData.approvedBy = (req as any).user.id;
        updateData.approvedAt = new Date();
        updateData.status = "Active";
      }

      const updated = await storage.updateAdvance(req.params.id, updateData);

      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: "UPDATE_ADVANCE",
        entity: "Advance",
        entityId: updated.id,
        beforeSnapshot: before,
        afterSnapshot: updated,
        metadata: null,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Settings Routes
  app.get("/api/settings/statutory", authenticateToken, async (req, res) => {
    try {
      const config = await storage.getActiveStatutoryConfig();
      if (!config) {
        return res.status(404).json({ message: "No active statutory configuration" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/settings/statutory", authenticateToken, async (req, res) => {
    try {
      const currentConfig = await storage.getActiveStatutoryConfig();
      
      if (currentConfig) {
        await storage.updateStatutoryConfig(currentConfig.id, { isActive: false });
      }

      const newConfig = await storage.createStatutoryConfig({
        ...req.body,
        isActive: true,
      });

      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: "UPDATE_STATUTORY_CONFIG",
        entity: "StatutoryConfig",
        entityId: newConfig.id,
        beforeSnapshot: currentConfig,
        afterSnapshot: newConfig,
        metadata: null,
      });

      res.json(newConfig);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Attendance Routes
  app.get("/api/attendance", authenticateToken, async (req, res) => {
    try {
      const records = await storage.getAttendanceRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/attendance", authenticateToken, async (req, res) => {
    try {
      const result = insertAttendanceRecordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error });
      }

      const record = await storage.createAttendanceRecord(result.data);

      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: "CREATE_ATTENDANCE_RECORD",
        entity: "AttendanceRecord",
        entityId: record.id,
        beforeSnapshot: null,
        afterSnapshot: record,
        metadata: null,
      });

      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/attendance/:id", authenticateToken, async (req, res) => {
    try {
      const before = await storage.getAttendanceRecord(req.params.id);
      if (!before) {
        return res.status(404).json({ message: "Attendance record not found" });
      }

      const { status, ...otherData } = req.body;
      
      // If status is being updated, validate it
      if (status !== undefined) {
        const validStatuses = ['Pending', 'Approved', 'Rejected'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ message: "Invalid status value" });
        }
        
        // Use status update method
        const record = await storage.updateAttendanceStatus(
          req.params.id, 
          status, 
          (req as any).user.id
        );

        await storage.createAuditLog({
          userId: (req as any).user.id,
          action: "UPDATE_ATTENDANCE_STATUS",
          entity: "AttendanceRecord",
          entityId: record.id,
          beforeSnapshot: before,
          afterSnapshot: record,
          metadata: { status },
        });

        res.json(record);
      } else {
        // Regular update
        const record = await storage.updateAttendanceRecord(req.params.id, otherData);

        await storage.createAuditLog({
          userId: (req as any).user.id,
          action: "UPDATE_ATTENDANCE_RECORD",
          entity: "AttendanceRecord",
          entityId: record.id,
          beforeSnapshot: before,
          afterSnapshot: record,
          metadata: null,
        });

        res.json(record);
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Overtime Routes
  app.get("/api/overtime", authenticateToken, async (req, res) => {
    try {
      const entries = await storage.getOvertimeEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/overtime", authenticateToken, async (req, res) => {
    try {
      const result = insertOvertimeEntrySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error });
      }

      const entry = await storage.createOvertimeEntry(result.data);

      await storage.createAuditLog({
        userId: (req as any).user.id,
        action: "CREATE_OVERTIME_ENTRY",
        entity: "OvertimeEntry",
        entityId: entry.id,
        beforeSnapshot: null,
        afterSnapshot: entry,
        metadata: null,
      });

      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/overtime/:id", authenticateToken, async (req, res) => {
    try {
      const before = await storage.getOvertimeEntry(req.params.id);
      if (!before) {
        return res.status(404).json({ message: "Overtime entry not found" });
      }

      const { status, ...otherData } = req.body;
      
      // If status is being updated, validate it
      if (status !== undefined) {
        const validStatuses = ['Pending', 'Approved', 'Rejected'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ message: "Invalid status value" });
        }
        
        // Use status update method
        const entry = await storage.updateOvertimeStatus(
          req.params.id, 
          status, 
          (req as any).user.id
        );

        await storage.createAuditLog({
          userId: (req as any).user.id,
          action: "UPDATE_OVERTIME_STATUS",
          entity: "OvertimeEntry",
          entityId: entry.id,
          beforeSnapshot: before,
          afterSnapshot: entry,
          metadata: { status },
        });

        res.json(entry);
      } else {
        // Regular update
        const entry = await storage.updateOvertimeEntry(req.params.id, otherData);

        await storage.createAuditLog({
          userId: (req as any).user.id,
          action: "UPDATE_OVERTIME_ENTRY",
          entity: "OvertimeEntry",
          entityId: entry.id,
          beforeSnapshot: before,
          afterSnapshot: entry,
          metadata: null,
        });

        res.json(entry);
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
