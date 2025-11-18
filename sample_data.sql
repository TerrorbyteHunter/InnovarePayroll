-- Innovare Payroll System - Sample Data
-- This file contains sample data for testing purposes
-- Run this file using: psql -U your_username -d your_database -f sample_data.sql
-- Or use the TypeScript seed script: tsx server/seed.ts

-- Clear existing data (in correct order)
TRUNCATE TABLE audit_logs, reports, advances, leave_requests, leave_balances, leave_policies,
    statutory_config, payslips, payroll_runs, deductions, allowances, employees, users CASCADE;

-- Insert sample users
INSERT INTO users (id, username, password, full_name, email, role, is_active) VALUES
('user-admin-1', 'admin', '$2a$10$rNQJYXqZ7h4cJ9VQKz0j7O8zV7mCXHzKxGxZQYtYZQHzKxGxZQYtY', 'System Administrator', 'admin@innovare.zm', 'Admin', true),
('user-payroll-1', 'payroll', '$2a$10$rNQJYXqZ7h4cJ9VQKz0j7O8zV7mCXHzKxGxZQYtYZQHzKxGxZQYtY', 'Grace Tembo', 'grace.tembo@innovare.zm', 'PayrollOfficer', true),
('user-hr-1', 'hrofficer', '$2a$10$rNQJYXqZ7h4cJ9VQKz0j7O8zV7mCXHzKxGxZQYtYZQHzKxGxZQYtY', 'Peter Sakala', 'peter.sakala@innovare.zm', 'HROfficer', true),
('user-auditor-1', 'auditor', '$2a$10$rNQJYXqZ7h4cJ9VQKz0j7O8zV7mCXHzKxGxZQYtYZQHzKxGxZQYtY', 'Mary Phiri', 'mary.phiri@innovare.zm', 'Auditor', true);

-- Insert statutory configuration
INSERT INTO statutory_config (id, effective_date, paye_bands, paye_reliefs, napsa_rate, napsa_cap, nhima_rate, sdl_enabled, sdl_rate, is_active) VALUES
('config-2024-1', '2024-01-01', 
'[
  {"min": 0, "max": 5100, "rate": 0, "fixedAmount": 0},
  {"min": 5100.01, "max": 7100, "rate": 0.25, "fixedAmount": 0},
  {"min": 7100.01, "max": 9200, "rate": 0.30, "fixedAmount": 500},
  {"min": 9200.01, "max": 999999999, "rate": 0.37, "fixedAmount": 1130}
]'::jsonb,
'{"personal": 4500}'::jsonb,
0.05, 2940.00, 0.01, false, 0, true);

-- Insert leave policies
INSERT INTO leave_policies (id, name, description, days_per_year, is_active) VALUES
('policy-annual-1', 'Annual Leave', 'Standard annual leave entitlement', 24, true),
('policy-sick-1', 'Sick Leave', 'Paid sick leave', 12, true),
('policy-maternity-1', 'Maternity Leave', 'Maternity leave for female employees', 84, true),
('policy-compassionate-1', 'Compassionate Leave', 'Leave for family emergencies', 5, true);

-- Insert sample employees
INSERT INTO employees (id, employee_number, first_name, last_name, nrc_number, email, phone, date_of_birth, gender, address, department, position, hire_date, bank_name, bank_account, bank_branch, base_salary, paye_number, napsa_number, nhima_number, is_napsa_exempt, is_nhima_exempt, is_active) VALUES
('emp-001', 'EMP001', 'John', 'Mwale', '123456/78/1', 'john.mwale@company.zm', '+260977123456', '1985-05-15', 'Male', 'Plot 123, Kabulonga, Lusaka', 'Finance', 'Chief Financial Officer', '2020-01-15', 'Zanaco', '1234567890', 'Cairo Road', 15000.00, 'PAYE001', 'NAPSA001', 'NHIMA001', false, false, true),
('emp-002', 'EMP002', 'Mary', 'Banda', '234567/89/1', 'mary.banda@company.zm', '+260966234567', '1990-08-22', 'Female', 'Plot 456, Roma, Lusaka', 'Human Resources', 'HR Manager', '2021-03-01', 'First National Bank', '2345678901', 'Soweto Branch', 12000.00, 'PAYE002', 'NAPSA002', 'NHIMA002', false, false, true),
('emp-003', 'EMP003', 'David', 'Phiri', '345678/90/1', 'david.phiri@company.zm', '+260955345678', '1988-11-30', 'Male', 'Plot 789, Chelstone, Lusaka', 'IT', 'Senior Software Developer', '2019-06-10', 'Zanaco', '3456789012', 'Woodlands', 14000.00, 'PAYE003', 'NAPSA003', 'NHIMA003', false, false, true),
('emp-004', 'EMP004', 'Sarah', 'Zulu', '456789/01/1', 'sarah.zulu@company.zm', '+260944456789', '1992-03-18', 'Female', 'Plot 321, Meanwood, Lusaka', 'Marketing', 'Marketing Manager', '2022-01-20', 'Standard Chartered', '4567890123', 'Longacres', 11000.00, 'PAYE004', 'NAPSA004', 'NHIMA004', false, false, true),
('emp-005', 'EMP005', 'James', 'Ngoma', '567890/12/1', 'james.ngoma@company.zm', '+260933567890', '1987-07-25', 'Male', 'Plot 654, Kabwata, Lusaka', 'Operations', 'Operations Manager', '2020-09-15', 'Zanaco', '5678901234', 'Cairo Road', 13000.00, 'PAYE005', 'NAPSA005', 'NHIMA005', false, false, true),
('emp-006', 'EMP006', 'Grace', 'Siame', '678901/23/1', 'grace.siame@company.zm', '+260922678901', '1995-12-10', 'Female', 'Plot 987, Olympia, Lusaka', 'Finance', 'Accountant', '2023-02-01', 'First National Bank', '6789012345', 'Arcades', 9500.00, 'PAYE006', 'NAPSA006', 'NHIMA006', false, false, true),
('emp-007', 'EMP007', 'Patrick', 'Lungu', '789012/34/1', 'patrick.lungu@company.zm', '+260911789012', '1991-04-14', 'Male', 'Plot 147, Woodlands, Lusaka', 'IT', 'Junior Developer', '2023-06-15', 'Zanaco', '7890123456', 'Woodlands', 7500.00, 'PAYE007', 'NAPSA007', 'NHIMA007', false, false, true),
('emp-008', 'EMP008', 'Ruth', 'Kalaba', '890123/45/1', 'ruth.kalaba@company.zm', '+260900890123', '1993-09-28', 'Female', 'Plot 258, Rhodes Park, Lusaka', 'Human Resources', 'HR Officer', '2022-11-01', 'Standard Chartered', '8901234567', 'Longacres', 8000.00, 'PAYE008', 'NAPSA008', 'NHIMA008', false, false, true),
('emp-009', 'EMP009', 'Joseph', 'Mbewe', '901234/56/1', 'joseph.mbewe@company.zm', '+260977901234', '1989-01-05', 'Male', 'Plot 369, Northmead, Lusaka', 'Sales', 'Sales Executive', '2021-08-10', 'Zanaco', '9012345678', 'Cairo Road', 8500.00, 'PAYE009', 'NAPSA009', 'NHIMA009', false, false, true),
('emp-010', 'EMP010', 'Alice', 'Mwanza', '012345/67/1', 'alice.mwanza@company.zm', '+260966012345', '1994-06-20', 'Female', 'Plot 741, Libala, Lusaka', 'Marketing', 'Marketing Officer', '2023-04-01', 'First National Bank', '0123456789', 'Arcades', 7000.00, 'PAYE010', 'NAPSA010', 'NHIMA010', false, false, true);

-- Insert some allowances
INSERT INTO allowances (employee_id, name, amount, is_taxable, is_recurring) VALUES
('emp-001', 'Housing Allowance', 5000.00, true, true),
('emp-001', 'Transport Allowance', 2000.00, true, true),
('emp-002', 'Housing Allowance', 4000.00, true, true),
('emp-002', 'Transport Allowance', 1500.00, true, true),
('emp-003', 'Housing Allowance', 4500.00, true, true),
('emp-003', 'Transport Allowance', 1800.00, true, true),
('emp-004', 'Housing Allowance', 3500.00, true, true),
('emp-005', 'Housing Allowance', 4200.00, true, true),
('emp-006', 'Transport Allowance', 1200.00, true, true),
('emp-007', 'Meal Allowance', 500.00, false, true);

-- Insert some deductions
INSERT INTO deductions (employee_id, name, amount, is_recurring) VALUES
('emp-003', 'Staff Loan', 500.00, true),
('emp-005', 'Union Dues', 100.00, true),
('emp-007', 'Staff Loan', 300.00, true);

-- Insert leave balances for 2024
INSERT INTO leave_balances (employee_id, policy_id, year, total_days, used_days, remaining_days) VALUES
('emp-001', 'policy-annual-1', 2024, 24, 5, 19),
('emp-001', 'policy-sick-1', 2024, 12, 2, 10),
('emp-002', 'policy-annual-1', 2024, 24, 8, 16),
('emp-002', 'policy-sick-1', 2024, 12, 1, 11),
('emp-003', 'policy-annual-1', 2024, 24, 3, 21),
('emp-003', 'policy-sick-1', 2024, 12, 0, 12),
('emp-004', 'policy-annual-1', 2024, 24, 10, 14),
('emp-004', 'policy-sick-1', 2024, 12, 3, 9),
('emp-005', 'policy-annual-1', 2024, 24, 6, 18),
('emp-005', 'policy-sick-1', 2024, 12, 1, 11);

-- Insert some leave requests
INSERT INTO leave_requests (employee_id, policy_id, start_date, end_date, days, reason, status, reviewed_by, reviewed_at) VALUES
('emp-001', 'policy-annual-1', '2024-12-20', '2024-12-27', 5, 'Christmas vacation', 'Approved', 'user-hr-1', NOW() - INTERVAL '2 days'),
('emp-002', 'policy-sick-1', '2024-11-15', '2024-11-15', 1, 'Medical appointment', 'Approved', 'user-hr-1', NOW() - INTERVAL '10 days'),
('emp-003', 'policy-annual-1', '2024-12-15', '2024-12-22', 5, 'Family visit', 'Pending', NULL, NULL),
('emp-004', 'policy-annual-1', '2024-11-20', '2024-11-22', 2, 'Personal matters', 'Rejected', 'user-hr-1', NOW() - INTERVAL '5 days');

-- Insert some salary advances
INSERT INTO advances (employee_id, amount, reason, installments, installment_amount, remaining_balance, paid_installments, status, approved_by, approved_at) VALUES
('emp-007', 3000.00, 'Emergency medical expenses', 6, 500.00, 3000.00, 0, 'Approved', 'user-admin-1', NOW() - INTERVAL '3 days'),
('emp-009', 2000.00, 'School fees', 4, 500.00, 1000.00, 2, 'Active', 'user-admin-1', NOW() - INTERVAL '60 days'),
('emp-010', 1500.00, 'Personal emergency', 3, 500.00, 1500.00, 0, 'Pending', NULL, NULL);

-- Sample payroll run (November 2024)
INSERT INTO payroll_runs (id, period, start_date, end_date, status, total_gross, total_paye, total_napsa, total_nhima, total_deductions, total_net, employee_count, created_by, approved_by, approved_at) VALUES
('payroll-2024-11', 'November 2024', '2024-11-01', '2024-11-30', 'Approved', 125500.00, 28450.00, 6275.00, 1255.00, 900.00, 88620.00, 10, 'user-payroll-1', 'user-admin-1', NOW() - INTERVAL '5 days');

-- Sample payslips for November 2024
INSERT INTO payslips (payroll_run_id, employee_id, period, base_salary, allowances, deductions, gross_pay, taxable_income, paye, paye_calculation, napsa_employee, napsa_employer, nhima, total_statutory, total_deductions, net_pay) VALUES
('payroll-2024-11', 'emp-001', 'November 2024', 15000.00, '[{"name":"Housing Allowance","amount":5000},{"name":"Transport Allowance","amount":2000}]'::jsonb, '[]'::jsonb, 22000.00, 17500.00, 4465.00, '{"taxableIncome": 17500, "bands": [{"min": 5100.01, "max": 7100, "rate": 0.25, "amount": 500}, {"min": 7100.01, "max": 9200, "rate": 0.30, "amount": 630}, {"min": 9200.01, "max": 17500, "rate": 0.37, "amount": 3335}]}'::jsonb, 750.00, 750.00, 220.00, 5435.00, 5435.00, 16565.00),
('payroll-2024-11', 'emp-002', 'November 2024', 12000.00, '[{"name":"Housing Allowance","amount":4000},{"name":"Transport Allowance","amount":1500}]'::jsonb, '[]'::jsonb, 17500.00, 13000.00, 2795.00, '{"taxableIncome": 13000, "bands": [{"min": 5100.01, "max": 7100, "rate": 0.25, "amount": 500}, {"min": 7100.01, "max": 9200, "rate": 0.30, "amount": 630}, {"min": 9200.01, "max": 13000, "rate": 0.37, "amount": 1665}]}'::jsonb, 600.00, 600.00, 175.00, 3570.00, 3570.00, 13930.00),
('payroll-2024-11', 'emp-003', 'November 2024', 14000.00, '[{"name":"Housing Allowance","amount":4500},{"name":"Transport Allowance","amount":1800}]'::jsonb, '[{"name":"Staff Loan","amount":500}]'::jsonb, 20300.00, 15800.00, 4028.00, '{"taxableIncome": 15800, "bands": [{"min": 5100.01, "max": 7100, "rate": 0.25, "amount": 500}, {"min": 7100.01, "max": 9200, "rate": 0.30, "amount": 630}, {"min": 9200.01, "max": 15800, "rate": 0.37, "amount": 2898}]}'::jsonb, 700.00, 700.00, 203.00, 4931.00, 5431.00, 14869.00);

-- Add some audit logs
INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata) VALUES
('user-admin-1', 'CREATE', 'payroll_run', 'payroll-2024-11', '{"period": "November 2024"}'::jsonb),
('user-admin-1', 'APPROVE', 'payroll_run', 'payroll-2024-11', '{"status": "Approved"}'::jsonb),
('user-hr-1', 'APPROVE', 'leave_request', 'emp-001', '{"days": 5, "period": "2024-12-20 to 2024-12-27"}'::jsonb),
('user-admin-1', 'APPROVE', 'advance', 'emp-007', '{"amount": 3000, "installments": 6}'::jsonb);

-- Success message
SELECT 'Sample data inserted successfully!' AS status;
