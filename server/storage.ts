import {
  users, employees, allowances, deductions, payrollRuns, payslips,
  statutoryConfig, leavePolicies, leaveBalances, leaveRequests, advances, reports, auditLogs,
  attendanceRecords, overtimeEntries, payrollAdjustments,
  type User, type InsertUser, type Employee, type InsertEmployee,
  type Allowance, type InsertAllowance, type Deduction, type InsertDeduction,
  type PayrollRun, type InsertPayrollRun, type Payslip,
  type StatutoryConfig, type InsertStatutoryConfig,
  type LeavePolicy, type InsertLeavePolicy, type LeaveBalance,
  type LeaveRequest, type InsertLeaveRequest,
  type Advance, type InsertAdvance, type Report, type AuditLog,
  type AttendanceRecord, type InsertAttendanceRecord,
  type OvertimeEntry, type InsertOvertimeEntry,
  type PayrollAdjustment, type InsertPayrollAdjustment
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Employees
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByNumber(employeeNumber: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;
  
  // Allowances
  getEmployeeAllowances(employeeId: string): Promise<Allowance[]>;
  createAllowance(allowance: InsertAllowance): Promise<Allowance>;
  
  // Deductions
  getEmployeeDeductions(employeeId: string): Promise<Deduction[]>;
  createDeduction(deduction: InsertDeduction): Promise<Deduction>;
  
  // Payroll Runs
  getPayrollRuns(): Promise<PayrollRun[]>;
  getPayrollRun(id: string): Promise<PayrollRun | undefined>;
  createPayrollRun(payrollRun: InsertPayrollRun): Promise<PayrollRun>;
  updatePayrollRun(id: string, data: Partial<PayrollRun>): Promise<PayrollRun>;
  
  // Payslips
  getPayslips(): Promise<Payslip[]>;
  getPayslipsByPayrollRun(payrollRunId: string): Promise<Payslip[]>;
  getPayslip(id: string): Promise<Payslip | undefined>;
  createPayslip(payslip: any): Promise<Payslip>;
  
  // Statutory Config
  getActiveStatutoryConfig(): Promise<StatutoryConfig | undefined>;
  getStatutoryConfig(id: string): Promise<StatutoryConfig | undefined>;
  createStatutoryConfig(config: InsertStatutoryConfig): Promise<StatutoryConfig>;
  updateStatutoryConfig(id: string, config: Partial<InsertStatutoryConfig>): Promise<StatutoryConfig>;
  
  // Leave Policies
  getLeavePolicies(): Promise<LeavePolicy[]>;
  getLeavePolicy(id: string): Promise<LeavePolicy | undefined>;
  createLeavePolicy(policy: InsertLeavePolicy): Promise<LeavePolicy>;
  
  // Leave Balances
  getEmployeeLeaveBalances(employeeId: string): Promise<LeaveBalance[]>;
  
  // Leave Requests
  getLeaveRequests(): Promise<LeaveRequest[]>;
  getLeaveRequest(id: string): Promise<LeaveRequest | undefined>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest>;
  
  // Advances
  getAdvances(): Promise<Advance[]>;
  getAdvance(id: string): Promise<Advance | undefined>;
  createAdvance(advance: InsertAdvance): Promise<Advance>;
  updateAdvance(id: string, data: Partial<Advance>): Promise<Advance>;
  
  // Reports
  getReports(): Promise<Report[]>;
  createReport(report: any): Promise<Report>;
  
  // Audit Logs
  createAuditLog(log: any): Promise<AuditLog>;
  
  // Attendance Records
  getAttendanceRecords(): Promise<AttendanceRecord[]>;
  getEmployeeAttendanceRecords(employeeId: string): Promise<AttendanceRecord[]>;
  getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  updateAttendanceRecord(id: string, data: Partial<AttendanceRecord>): Promise<AttendanceRecord>;
  
  // Overtime Entries
  getOvertimeEntries(): Promise<OvertimeEntry[]>;
  getEmployeeOvertimeEntries(employeeId: string): Promise<OvertimeEntry[]>;
  getOvertimeEntry(id: string): Promise<OvertimeEntry | undefined>;
  createOvertimeEntry(entry: InsertOvertimeEntry): Promise<OvertimeEntry>;
  updateOvertimeEntry(id: string, data: Partial<OvertimeEntry>): Promise<OvertimeEntry>;
  
  // Payroll Adjustments
  getPayrollAdjustments(payrollRunId: string): Promise<PayrollAdjustment[]>;
  createPayrollAdjustment(adjustment: InsertPayrollAdjustment): Promise<PayrollAdjustment>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Employees
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async getEmployeeByNumber(employeeNumber: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.employeeNumber, employeeNumber));
    return employee;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db.insert(employees).values(insertEmployee).returning();
    return employee;
  }

  async updateEmployee(id: string, data: Partial<InsertEmployee>): Promise<Employee> {
    const [employee] = await db.update(employees).set(data).where(eq(employees.id, id)).returning();
    return employee;
  }

  async deleteEmployee(id: string): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  // Allowances
  async getEmployeeAllowances(employeeId: string): Promise<Allowance[]> {
    return await db.select().from(allowances).where(eq(allowances.employeeId, employeeId));
  }

  async createAllowance(insertAllowance: InsertAllowance): Promise<Allowance> {
    const [allowance] = await db.insert(allowances).values(insertAllowance).returning();
    return allowance;
  }

  // Deductions
  async getEmployeeDeductions(employeeId: string): Promise<Deduction[]> {
    return await db.select().from(deductions).where(eq(deductions.employeeId, employeeId));
  }

  async createDeduction(insertDeduction: InsertDeduction): Promise<Deduction> {
    const [deduction] = await db.insert(deductions).values(insertDeduction).returning();
    return deduction;
  }

  // Payroll Runs
  async getPayrollRuns(): Promise<PayrollRun[]> {
    return await db.select().from(payrollRuns).orderBy(desc(payrollRuns.createdAt));
  }

  async getPayrollRun(id: string): Promise<PayrollRun | undefined> {
    const [payrollRun] = await db.select().from(payrollRuns).where(eq(payrollRuns.id, id));
    return payrollRun;
  }

  async createPayrollRun(insertPayrollRun: InsertPayrollRun): Promise<PayrollRun> {
    const [payrollRun] = await db.insert(payrollRuns).values(insertPayrollRun).returning();
    return payrollRun;
  }

  async updatePayrollRun(id: string, data: Partial<PayrollRun>): Promise<PayrollRun> {
    const [payrollRun] = await db.update(payrollRuns).set(data).where(eq(payrollRuns.id, id)).returning();
    return payrollRun;
  }

  // Payslips
  async getPayslips(): Promise<Payslip[]> {
    return await db.select().from(payslips).orderBy(desc(payslips.createdAt));
  }

  async getPayslipsByPayrollRun(payrollRunId: string): Promise<Payslip[]> {
    return await db.select().from(payslips).where(eq(payslips.payrollRunId, payrollRunId));
  }

  async getPayslip(id: string): Promise<Payslip | undefined> {
    const [payslip] = await db.select().from(payslips).where(eq(payslips.id, id));
    return payslip;
  }

  async createPayslip(payslipData: any): Promise<Payslip> {
    const [payslip] = await db.insert(payslips).values(payslipData).returning();
    return payslip;
  }

  // Statutory Config
  async getActiveStatutoryConfig(): Promise<StatutoryConfig | undefined> {
    const [config] = await db.select().from(statutoryConfig).where(eq(statutoryConfig.isActive, true));
    return config;
  }

  async getStatutoryConfig(id: string): Promise<StatutoryConfig | undefined> {
    const [config] = await db.select().from(statutoryConfig).where(eq(statutoryConfig.id, id));
    return config;
  }

  async createStatutoryConfig(insertConfig: InsertStatutoryConfig): Promise<StatutoryConfig> {
    const [config] = await db.insert(statutoryConfig).values(insertConfig).returning();
    return config;
  }

  async updateStatutoryConfig(id: string, data: Partial<InsertStatutoryConfig>): Promise<StatutoryConfig> {
    const [config] = await db.update(statutoryConfig).set(data).where(eq(statutoryConfig.id, id)).returning();
    return config;
  }

  // Leave Policies
  async getLeavePolicies(): Promise<LeavePolicy[]> {
    return await db.select().from(leavePolicies).where(eq(leavePolicies.isActive, true));
  }

  async getLeavePolicy(id: string): Promise<LeavePolicy | undefined> {
    const [policy] = await db.select().from(leavePolicies).where(eq(leavePolicies.id, id));
    return policy;
  }

  async createLeavePolicy(insertPolicy: InsertLeavePolicy): Promise<LeavePolicy> {
    const [policy] = await db.insert(leavePolicies).values(insertPolicy).returning();
    return policy;
  }

  // Leave Balances
  async getEmployeeLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
    return await db.select().from(leaveBalances).where(eq(leaveBalances.employeeId, employeeId));
  }

  // Leave Requests
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return await db.select().from(leaveRequests).orderBy(desc(leaveRequests.createdAt));
  }

  async getLeaveRequest(id: string): Promise<LeaveRequest | undefined> {
    const [request] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id));
    return request;
  }

  async createLeaveRequest(insertRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const [request] = await db.insert(leaveRequests).values(insertRequest).returning();
    return request;
  }

  async updateLeaveRequest(id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const [request] = await db.update(leaveRequests).set(data).where(eq(leaveRequests.id, id)).returning();
    return request;
  }

  // Advances
  async getAdvances(): Promise<Advance[]> {
    return await db.select().from(advances).orderBy(desc(advances.createdAt));
  }

  async getAdvance(id: string): Promise<Advance | undefined> {
    const [advance] = await db.select().from(advances).where(eq(advances.id, id));
    return advance;
  }

  async createAdvance(insertAdvance: InsertAdvance): Promise<Advance> {
    const [advance] = await db.insert(advances).values(insertAdvance).returning();
    return advance;
  }

  async updateAdvance(id: string, data: Partial<Advance>): Promise<Advance> {
    const [advance] = await db.update(advances).set(data).where(eq(advances.id, id)).returning();
    return advance;
  }

  // Reports
  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async createReport(reportData: any): Promise<Report> {
    const [report] = await db.insert(reports).values(reportData).returning();
    return report;
  }

  // Audit Logs
  async createAuditLog(logData: any): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(logData).returning();
    return log;
  }

  // Attendance Records
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    return await db.select().from(attendanceRecords).orderBy(desc(attendanceRecords.date));
  }

  async getEmployeeAttendanceRecords(employeeId: string): Promise<AttendanceRecord[]> {
    return await db.select().from(attendanceRecords).where(eq(attendanceRecords.employeeId, employeeId)).orderBy(desc(attendanceRecords.date));
  }

  async getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined> {
    const [record] = await db.select().from(attendanceRecords).where(eq(attendanceRecords.id, id));
    return record;
  }

  async createAttendanceRecord(insertRecord: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const [record] = await db.insert(attendanceRecords).values(insertRecord).returning();
    return record;
  }

  async updateAttendanceRecord(id: string, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const [record] = await db.update(attendanceRecords).set(data).where(eq(attendanceRecords.id, id)).returning();
    return record;
  }

  // Overtime Entries
  async getOvertimeEntries(): Promise<OvertimeEntry[]> {
    return await db.select().from(overtimeEntries).orderBy(desc(overtimeEntries.date));
  }

  async getEmployeeOvertimeEntries(employeeId: string): Promise<OvertimeEntry[]> {
    return await db.select().from(overtimeEntries).where(eq(overtimeEntries.employeeId, employeeId)).orderBy(desc(overtimeEntries.date));
  }

  async getOvertimeEntry(id: string): Promise<OvertimeEntry | undefined> {
    const [entry] = await db.select().from(overtimeEntries).where(eq(overtimeEntries.id, id));
    return entry;
  }

  async createOvertimeEntry(insertEntry: InsertOvertimeEntry): Promise<OvertimeEntry> {
    const [entry] = await db.insert(overtimeEntries).values(insertEntry).returning();
    return entry;
  }

  async updateOvertimeEntry(id: string, data: Partial<OvertimeEntry>): Promise<OvertimeEntry> {
    const [entry] = await db.update(overtimeEntries).set(data).where(eq(overtimeEntries.id, id)).returning();
    return entry;
  }

  // Payroll Adjustments
  async getPayrollAdjustments(payrollRunId: string): Promise<PayrollAdjustment[]> {
    return await db.select().from(payrollAdjustments).where(eq(payrollAdjustments.payrollRunId, payrollRunId));
  }

  async createPayrollAdjustment(insertAdjustment: InsertPayrollAdjustment): Promise<PayrollAdjustment> {
    const [adjustment] = await db.insert(payrollAdjustments).values(insertAdjustment).returning();
    return adjustment;
  }
}

export const storage = new DatabaseStorage();
