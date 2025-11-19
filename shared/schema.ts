import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users with role-based access
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // Admin, PayrollOfficer, HROfficer, Auditor
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Employees
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeNumber: text("employee_number").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  nrcNumber: text("nrc_number").notNull().unique(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  address: text("address"),
  residentialAddress: text("residential_address"),
  department: text("department"),
  position: text("position"),
  hireDate: text("hire_date").notNull(),
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),
  bankBranch: text("bank_branch"),
  baseSalary: decimal("base_salary", { precision: 12, scale: 2 }).notNull(),
  payeNumber: text("paye_number"),
  napsaNumber: text("napsa_number"),
  nhimaNumber: text("nhima_number"),
  isNapsaExempt: boolean("is_napsa_exempt").notNull().default(false),
  isNhimaExempt: boolean("is_nhima_exempt").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Employee Allowances
export const allowances = pgTable("allowances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  isTaxable: boolean("is_taxable").notNull().default(true),
  isRecurring: boolean("is_recurring").notNull().default(true),
});

// Employee Deductions
export const deductions = pgTable("deductions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  isRecurring: boolean("is_recurring").notNull().default(true),
});

// Payroll Runs
export const payrollRuns = pgTable("payroll_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  period: text("period").notNull(), // e.g., "2024-01", "January 2024"
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  status: text("status").notNull(), // Draft, Processing, Approved, Locked
  totalGross: decimal("total_gross", { precision: 12, scale: 2 }).notNull().default('0'),
  totalPaye: decimal("total_paye", { precision: 12, scale: 2 }).notNull().default('0'),
  totalNapsa: decimal("total_napsa", { precision: 12, scale: 2 }).notNull().default('0'),
  totalNhima: decimal("total_nhima", { precision: 12, scale: 2 }).notNull().default('0'),
  totalDeductions: decimal("total_deductions", { precision: 12, scale: 2 }).notNull().default('0'),
  totalNet: decimal("total_net", { precision: 12, scale: 2 }).notNull().default('0'),
  employeeCount: integer("employee_count").notNull().default(0),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Payslips
export const payslips = pgTable("payslips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  payrollRunId: varchar("payroll_run_id").notNull().references(() => payrollRuns.id),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  period: text("period").notNull(),
  baseSalary: decimal("base_salary", { precision: 12, scale: 2 }).notNull(),
  allowances: jsonb("allowances").notNull().default('[]'),
  deductions: jsonb("deductions").notNull().default('[]'),
  grossPay: decimal("gross_pay", { precision: 12, scale: 2 }).notNull(),
  taxableIncome: decimal("taxable_income", { precision: 12, scale: 2 }).notNull(),
  paye: decimal("paye", { precision: 12, scale: 2 }).notNull(),
  payeCalculation: jsonb("paye_calculation").notNull().default('{}'),
  napsaEmployee: decimal("napsa_employee", { precision: 12, scale: 2 }).notNull().default('0'),
  napsaEmployer: decimal("napsa_employer", { precision: 12, scale: 2 }).notNull().default('0'),
  nhima: decimal("nhima", { precision: 12, scale: 2 }).notNull().default('0'),
  totalStatutory: decimal("total_statutory", { precision: 12, scale: 2 }).notNull(),
  totalDeductions: decimal("total_deductions", { precision: 12, scale: 2 }).notNull(),
  netPay: decimal("net_pay", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Statutory Configuration
export const statutoryConfig = pgTable("statutory_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  effectiveDate: text("effective_date").notNull(),
  payeBands: jsonb("paye_bands").notNull(), // Array of {min, max, rate, fixedAmount}
  payeReliefs: jsonb("paye_reliefs").notNull(), // {personal: amount}
  napsaRate: decimal("napsa_rate", { precision: 5, scale: 4 }).notNull(), // 0.05 (5%)
  napsaCap: decimal("napsa_cap", { precision: 12, scale: 2 }), // Monthly cap
  nhimaRate: decimal("nhima_rate", { precision: 5, scale: 4 }).notNull(), // 0.01 (1%)
  sdlEnabled: boolean("sdl_enabled").notNull().default(false),
  sdlRate: decimal("sdl_rate", { precision: 5, scale: 4 }).default('0'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Leave Policies
export const leavePolicies = pgTable("leave_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  daysPerYear: integer("days_per_year").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Leave Balances
export const leaveBalances = pgTable("leave_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  policyId: varchar("policy_id").notNull().references(() => leavePolicies.id),
  year: integer("year").notNull(),
  totalDays: integer("total_days").notNull(),
  usedDays: integer("used_days").notNull().default(0),
  remainingDays: integer("remaining_days").notNull(),
});

// Leave Requests
export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  policyId: varchar("policy_id").notNull().references(() => leavePolicies.id),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  days: integer("days").notNull(),
  reason: text("reason"),
  status: text("status").notNull(), // Pending, Approved, Rejected
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewComments: text("review_comments"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Salary Advances
export const advances = pgTable("advances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  reason: text("reason"),
  installments: integer("installments").notNull(),
  installmentAmount: decimal("installment_amount", { precision: 12, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", { precision: 12, scale: 2 }).notNull(),
  paidInstallments: integer("paid_installments").notNull().default(0),
  status: text("status").notNull(), // Pending, Approved, Rejected, Active, Completed
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Reports
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // PAYE, NAPSA, NHIMA, PayrollJournal
  period: text("period").notNull(),
  payrollRunId: varchar("payroll_run_id").references(() => payrollRuns.id),
  data: jsonb("data").notNull(),
  generatedBy: varchar("generated_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: varchar("entity_id"),
  beforeSnapshot: jsonb("before_snapshot"),
  afterSnapshot: jsonb("after_snapshot"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Attendance Records
export const attendanceRecords = pgTable("attendance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  date: text("date").notNull(),
  type: text("type").notNull(), // Present, Absent, Late, HalfDay, Sick, Leave
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }),
  reason: text("reason"),
  status: text("status").notNull().default('Pending'), // Pending, Approved, Rejected
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Overtime Entries
export const overtimeEntries = pgTable("overtime_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  date: text("date").notNull(),
  hours: decimal("hours", { precision: 5, scale: 2 }).notNull(),
  rateMultiplier: decimal("rate_multiplier", { precision: 3, scale: 2 }).notNull().default('1.5'), // 1.5x, 2x, etc.
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  reason: text("reason"),
  status: text("status").notNull().default('Pending'), // Pending, Approved, Rejected
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Payroll Adjustments
export const payrollAdjustments = pgTable("payroll_adjustments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  payrollRunId: varchar("payroll_run_id").notNull().references(() => payrollRuns.id),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  type: text("type").notNull(), // Attendance, Overtime, Bonus, Penalty, Other
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  isAddition: boolean("is_addition").notNull(), // true for additions, false for deductions
  sourceType: text("source_type"), // AttendanceRecord, OvertimeEntry, Manual
  sourceId: varchar("source_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Zod Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true }).extend({
  password: z.string().min(8),
  role: z.enum(["Admin", "PayrollOfficer", "HROfficer", "Auditor"]),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true });

export const insertAllowanceSchema = createInsertSchema(allowances).omit({ id: true });

export const insertDeductionSchema = createInsertSchema(deductions).omit({ id: true });

export const insertPayrollRunSchema = createInsertSchema(payrollRuns).omit({ 
  id: true, 
  createdAt: true, 
  totalGross: true, 
  totalPaye: true, 
  totalNapsa: true, 
  totalNhima: true, 
  totalDeductions: true, 
  totalNet: true, 
  employeeCount: true,
  approvedBy: true,
  approvedAt: true,
});

export const insertStatutoryConfigSchema = createInsertSchema(statutoryConfig).omit({ id: true, createdAt: true });

export const insertLeavePolicySchema = createInsertSchema(leavePolicies).omit({ id: true, createdAt: true });

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({ 
  id: true, 
  createdAt: true, 
  reviewedBy: true, 
  reviewedAt: true, 
  reviewComments: true,
});

export const insertAdvanceSchema = createInsertSchema(advances).omit({ 
  id: true, 
  createdAt: true, 
  approvedBy: true, 
  approvedAt: true,
  paidInstallments: true,
  remainingBalance: true,
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
  createdAt: true,
  approvedBy: true,
  approvedAt: true,
}).extend({
  hoursWorked: z.union([z.string(), z.number(), z.null()]).optional().transform(val => 
    val == null ? null : typeof val === 'string' ? val : String(val)
  ),
});

export const insertOvertimeEntrySchema = createInsertSchema(overtimeEntries).omit({
  id: true,
  createdAt: true,
  approvedBy: true,
  approvedAt: true,
}).extend({
  hours: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? val : String(val)
  ),
  rateMultiplier: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? val : String(val)
  ),
});

export const insertPayrollAdjustmentSchema = createInsertSchema(payrollAdjustments).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? val : String(val)
  ),
  hours: z.union([z.string(), z.number(), z.null()]).optional().transform(val => 
    val == null ? null : typeof val === 'string' ? val : String(val)
  ),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertAllowance = z.infer<typeof insertAllowanceSchema>;
export type Allowance = typeof allowances.$inferSelect;

export type InsertDeduction = z.infer<typeof insertDeductionSchema>;
export type Deduction = typeof deductions.$inferSelect;

export type InsertPayrollRun = z.infer<typeof insertPayrollRunSchema>;
export type PayrollRun = typeof payrollRuns.$inferSelect;

export type Payslip = typeof payslips.$inferSelect;

export type InsertStatutoryConfig = z.infer<typeof insertStatutoryConfigSchema>;
export type StatutoryConfig = typeof statutoryConfig.$inferSelect;

export type InsertLeavePolicy = z.infer<typeof insertLeavePolicySchema>;
export type LeavePolicy = typeof leavePolicies.$inferSelect;

export type LeaveBalance = typeof leaveBalances.$inferSelect;

export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;

export type InsertAdvance = z.infer<typeof insertAdvanceSchema>;
export type Advance = typeof advances.$inferSelect;

export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;

export type InsertOvertimeEntry = z.infer<typeof insertOvertimeEntrySchema>;
export type OvertimeEntry = typeof overtimeEntries.$inferSelect;

export type InsertPayrollAdjustment = z.infer<typeof insertPayrollAdjustmentSchema>;
export type PayrollAdjustment = typeof payrollAdjustments.$inferSelect;

export type Report = typeof reports.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
