-- Innovare Payroll System - PostgreSQL Schema
-- This file can be used to set up the database structure for local testing
-- Run this file using: psql -U your_username -d your_database -f database_schema.sql
-- 
-- NOTE: This schema mirrors the Drizzle ORM schema used by the application.
-- Date fields use TEXT type (instead of DATE/TIMESTAMP) for compatibility with the
-- application's Drizzle ORM implementation, which stores dates as text strings.
-- This ensures the SQL schema matches the application's data format exactly.
-- For production use, consider migrating to proper DATE/TIMESTAMP types with
-- appropriate application-level conversion.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables if they exist (in correct order to respect foreign keys)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS advances CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS leave_policies CASCADE;
DROP TABLE IF EXISTS statutory_config CASCADE;
DROP TABLE IF EXISTS payslips CASCADE;
DROP TABLE IF EXISTS payroll_runs CASCADE;
DROP TABLE IF EXISTS deductions CASCADE;
DROP TABLE IF EXISTS allowances CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL, -- Admin, PayrollOfficer, HROfficer, Auditor
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Employees table
CREATE TABLE employees (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_number TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nrc_number TEXT NOT NULL UNIQUE,
    email TEXT,
    phone TEXT,
    date_of_birth TEXT,
    gender TEXT,
    address TEXT,
    department TEXT,
    position TEXT,
    hire_date TEXT NOT NULL,
    bank_name TEXT,
    bank_account TEXT,
    bank_branch TEXT,
    base_salary DECIMAL(12, 2) NOT NULL,
    paye_number TEXT,
    napsa_number TEXT,
    nhima_number TEXT,
    is_napsa_exempt BOOLEAN NOT NULL DEFAULT false,
    is_nhima_exempt BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Allowances table
CREATE TABLE allowances (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    is_taxable BOOLEAN NOT NULL DEFAULT true,
    is_recurring BOOLEAN NOT NULL DEFAULT true
);

-- Deductions table
CREATE TABLE deductions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT true
);

-- Payroll runs table
CREATE TABLE payroll_runs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    period TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT NOT NULL, -- Draft, Processing, Approved, Locked
    total_gross DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_paye DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_napsa DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_nhima DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_deductions DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_net DECIMAL(12, 2) NOT NULL DEFAULT 0,
    employee_count INTEGER NOT NULL DEFAULT 0,
    created_by VARCHAR NOT NULL REFERENCES users(id),
    approved_by VARCHAR REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Payslips table
CREATE TABLE payslips (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id VARCHAR NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id VARCHAR NOT NULL REFERENCES employees(id),
    period TEXT NOT NULL,
    base_salary DECIMAL(12, 2) NOT NULL,
    allowances JSONB NOT NULL DEFAULT '[]',
    deductions JSONB NOT NULL DEFAULT '[]',
    gross_pay DECIMAL(12, 2) NOT NULL,
    taxable_income DECIMAL(12, 2) NOT NULL,
    paye DECIMAL(12, 2) NOT NULL,
    paye_calculation JSONB NOT NULL DEFAULT '{}',
    napsa_employee DECIMAL(12, 2) NOT NULL DEFAULT 0,
    napsa_employer DECIMAL(12, 2) NOT NULL DEFAULT 0,
    nhima DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_statutory DECIMAL(12, 2) NOT NULL,
    total_deductions DECIMAL(12, 2) NOT NULL,
    net_pay DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Statutory configuration table
CREATE TABLE statutory_config (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    effective_date TEXT NOT NULL,
    paye_bands JSONB NOT NULL, -- Array of {min, max, rate, fixedAmount}
    paye_reliefs JSONB NOT NULL, -- {personal: amount}
    napsa_rate DECIMAL(5, 4) NOT NULL, -- 0.05 (5%)
    napsa_cap DECIMAL(12, 2), -- Monthly cap
    nhima_rate DECIMAL(5, 4) NOT NULL, -- 0.01 (1%)
    sdl_enabled BOOLEAN NOT NULL DEFAULT false,
    sdl_rate DECIMAL(5, 4) DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Leave policies table
CREATE TABLE leave_policies (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    days_per_year INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Leave balances table
CREATE TABLE leave_balances (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    policy_id VARCHAR NOT NULL REFERENCES leave_policies(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    total_days INTEGER NOT NULL,
    used_days INTEGER NOT NULL DEFAULT 0,
    remaining_days INTEGER NOT NULL
);

-- Leave requests table
CREATE TABLE leave_requests (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    policy_id VARCHAR NOT NULL REFERENCES leave_policies(id),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    days INTEGER NOT NULL,
    reason TEXT,
    status TEXT NOT NULL, -- Pending, Approved, Rejected
    reviewed_by VARCHAR REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_comments TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Advances table
CREATE TABLE advances (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    reason TEXT,
    installments INTEGER NOT NULL,
    installment_amount DECIMAL(12, 2) NOT NULL,
    remaining_balance DECIMAL(12, 2) NOT NULL,
    paid_installments INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL, -- Pending, Approved, Rejected, Active, Completed
    approved_by VARCHAR REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- PAYE, NAPSA, NHIMA, PayrollJournal
    period TEXT NOT NULL,
    payroll_run_id VARCHAR REFERENCES payroll_runs(id),
    data JSONB NOT NULL,
    generated_by VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id VARCHAR,
    before_snapshot JSONB,
    after_snapshot JSONB,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_employees_employee_number ON employees(employee_number);
CREATE INDEX idx_employees_nrc_number ON employees(nrc_number);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_is_active ON employees(is_active);

CREATE INDEX idx_allowances_employee_id ON allowances(employee_id);
CREATE INDEX idx_deductions_employee_id ON deductions(employee_id);

CREATE INDEX idx_payroll_runs_period ON payroll_runs(period);
CREATE INDEX idx_payroll_runs_status ON payroll_runs(status);
CREATE INDEX idx_payroll_runs_created_at ON payroll_runs(created_at);

CREATE INDEX idx_payslips_payroll_run_id ON payslips(payroll_run_id);
CREATE INDEX idx_payslips_employee_id ON payslips(employee_id);
CREATE INDEX idx_payslips_period ON payslips(period);

CREATE INDEX idx_statutory_config_effective_date ON statutory_config(effective_date);
CREATE INDEX idx_statutory_config_is_active ON statutory_config(is_active);

CREATE INDEX idx_leave_balances_employee_id ON leave_balances(employee_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);

CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);

CREATE INDEX idx_advances_employee_id ON advances(employee_id);
CREATE INDEX idx_advances_status ON advances(status);

CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_period ON reports(period);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Add comments for documentation
COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON TABLE employees IS 'Employee master data including bank details and statutory numbers';
COMMENT ON TABLE allowances IS 'Employee allowances (taxable and non-taxable)';
COMMENT ON TABLE deductions IS 'Employee deductions (loan repayments, etc.)';
COMMENT ON TABLE payroll_runs IS 'Payroll processing batches with status tracking';
COMMENT ON TABLE payslips IS 'Individual employee payslips with detailed calculations';
COMMENT ON TABLE statutory_config IS 'Versioned statutory rates for PAYE, NAPSA, NHIMA, SDL';
COMMENT ON TABLE leave_policies IS 'Leave type definitions (annual, sick, etc.)';
COMMENT ON TABLE leave_balances IS 'Employee leave balances per policy and year';
COMMENT ON TABLE leave_requests IS 'Leave applications with approval workflow';
COMMENT ON TABLE advances IS 'Salary advance requests with installment tracking';
COMMENT ON TABLE reports IS 'Generated compliance and statutory reports';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system actions';
