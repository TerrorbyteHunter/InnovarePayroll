# Innovare Payroll

Complete HR & Payroll Management System for Zambian Businesses

![Innovare Payroll](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## Overview

Innovare Payroll is a comprehensive, modern HR and payroll management system specifically designed for Zambian businesses. It automates salary calculations, statutory deductions (PAYE, NAPSA, NHIMA), leave management, salary advances, attendance tracking, and compliance reporting.

### Key Features

✅ **Complete Payroll Processing**
- Automated salary calculations with PAYE, NAPSA, and NHIMA
- Support for employee allowances and deductions  
- Attendance and overtime integration
- Salary advance management with repayment tracking
- Multi-step payroll run workflow (Draft → Preview → Approve → Lock)
- Colorful PDF payslip generation

✅ **Employee Management**
- Comprehensive employee profiles
- Bank details and statutory numbers (NRC, NAPSA, NHIMA, PAYE)
- Department and position tracking
- Active/inactive status management

✅ **Leave Management**
- Multiple leave policies (Annual, Sick, Compassionate, Study)
- Leave balance tracking per employee
- Leave request and approval workflow
- Leave history and reports

✅ **Salary Advances**
- Advance request and approval system
- Automatic installment calculation
- Repayment tracking across payroll runs
- Outstanding balance monitoring

✅ **Attendance & Overtime**
- Record absences, lateness, and sick days
- Overtime entry with customizable rate multipliers
- Approval workflows for both attendance and overtime
- Automatic payroll integration

✅ **Statutory Compliance**
- Zambian PAYE tax calculation with bands
- NAPSA employee and employer contributions
- NHIMA contributions
- SDL (Skills Development Levy) support
- Configurable rates and reliefs

✅ **Reports & Analytics**
- PAYE reports with PDF export
- NAPSA reports (Employee & Employer)
- NHIMA compliance reports
- Payroll journal summaries
- Audit trail for all transactions

✅ **User Management**
- Role-based access control (Admin, Payroll Officer, HR Officer, Auditor)
- Secure JWT authentication
- User activity audit logs

## Technology Stack

### Frontend
- **React** 18.3 with TypeScript
- **Vite** for fast development and building
- **TanStack Query** (React Query v5) for data fetching
- **Wouter** for client-side routing
- **React Hook Form** with Zod validation
- **Tailwind CSS** with custom design system
- **shadcn/ui** component library
- **Lucide React** icons

### Backend
- **Node.js** 20 with Express.js
- **TypeScript** for type safety
- **PostgreSQL** (Neon) database
- **Drizzle ORM** for database operations
- **JWT** for authentication
- **bcryptjs** for password hashing
- **PDFKit** for PDF generation

### Development Tools
- **tsx** for TypeScript execution
- **esbuild** for production builds
- **drizzle-kit** for database migrations

## Quick Start

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database (Neon-backed on Replit)

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up the database**
```bash
npm run db:push
```

3. **Seed sample data**
```bash
tsx server/seed.ts
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at the configured port (typically 5000).

### Production Build

```bash
npm run build
npm run start
```

## Demo Credentials

The seeded database includes 4 demo users with different roles:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin` | `password` | Admin | Full system access |
| `payroll` | `password` | Payroll Officer | Payroll processing and reports |
| `hrofficer` | `password` | HR Officer | Employee and leave management |
| `auditor` | `password` | Auditor | Read-only access to all data |

### Sample Data Included

- **10 Employees** with complete profiles, allowances, and deductions
- **1 Payroll Run** (November 2024) with 3 generated payslips
- **4 Leave Policies** (Annual, Sick, Compassionate, Study)
- **4 Leave Requests** in various states (Pending, Approved)
- **3 Salary Advances** for demonstration
- **Statutory Configuration** with current Zambian tax rates
- **Audit Logs** showing system activity

## User Guide

### Running Payroll

1. **Create Payroll Run**
   - Navigate to Payroll section
   - Click "Run Payroll"
   - Enter period name and date range
   - Click "Next: Preview"

2. **Preview Calculations**
   - Review totals for all active employees
   - Verify gross pay, deductions, and net pay
   - Click "Next: Review Details"

3. **Approve & Generate Payslips**
   - Final review of payroll summary
   - Click "Approve & Generate Payslips"
   - Payslips are generated for all employees

4. **Lock Payroll**
   - Once approved, lock the payroll to prevent changes
   - Locked payrolls cannot be modified

### Downloading Payslips

1. Navigate to Payslips section
2. Find the desired payslip
3. Click the download icon
4. Colorful PDF payslip will be downloaded

### Generating Reports

1. Navigate to Reports section
2. Select report type (PAYE, NAPSA, NHIMA, or Payroll Journal)
3. Choose month and year
4. Click "Generate Report"
5. Download as PDF using the download button

### Managing Employees

1. Navigate to Employees section
2. Click "Add Employee" to create new employee
3. Fill in all required fields:
   - Personal details (NRC, DOB, gender)
   - Employment info (department, position, hire date)
   - Bank details
   - Salary and statutory numbers
4. Add allowances and deductions as needed

### Leave Management

1. **Submit Leave Request**
   - Go to Leave section
   - Click "Request Leave"
   - Select employee, leave type, and dates
   - System calculates days automatically
   - Submit for approval

2. **Approve/Reject Leave**
   - Review pending leave requests
   - Check leave balance
   - Approve or reject with comments

### Salary Advances

1. **Request Advance**
   - Navigate to Advances section
   - Click "Request Advance"
   - Enter amount, reason, and installments
   - System calculates installment amount

2. **Approval & Repayment**
   - HR/Admin approves or rejects advance
   - Approved advances are deducted from future payrolls
   - Track remaining balance

### Attendance & Overtime

1. **Record Attendance**
   - Go to Attendance section
   - Add attendance record (absence, lateness, sick)
   - Enter hours worked and reason
   - Submit for approval

2. **Record Overtime**
   - Navigate to Overtime section
   - Add overtime entry with hours and rate multiplier
   - Approved overtime is added to payroll calculations

## System Configuration

### Statutory Rates (Settings)

Configure current Zambian tax rates and statutory deductions:

1. Navigate to Settings
2. Configure PAYE tax bands
3. Set NAPSA rate and cap
4. Set NHIMA rate
5. Enable/disable SDL
6. Save changes

Current default configuration (2024):
- **NAPSA**: 5% (employee), 5% (employer), cap at ZMW 2,940
- **NHIMA**: 1% of gross pay
- **PAYE**: Progressive tax bands with personal relief of ZMW 4,500

### Leave Policies

Manage leave entitlements:

1. Annual Leave: 24 days per year
2. Sick Leave: 12 days per year
3. Compassionate Leave: 5 days per year
4. Study Leave: 10 days per year

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Payroll
- `GET /api/payroll` - Get all payroll runs
- `POST /api/payroll` - Create payroll run
- `GET /api/payroll/:id/preview` - Preview payslips
- `POST /api/payroll/:id/approve` - Approve and generate payslips
- `POST /api/payroll/:id/lock` - Lock payroll run

### Payslips
- `GET /api/payslips` - Get all payslips
- `GET /api/payslips/:id` - Get payslip details
- `GET /api/payslips/:id/download` - Download payslip as PDF

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports/generate` - Generate new report
- `GET /api/reports/:id/download` - Download report as PDF

### Leave
- `GET /api/leave/policies` - Get leave policies
- `GET /api/leave/requests` - Get leave requests
- `POST /api/leave/requests` - Submit leave request
- `POST /api/leave/requests/:id/approve` - Approve leave
- `POST /api/leave/requests/:id/reject` - Reject leave

### Advances
- `GET /api/advances` - Get salary advances
- `POST /api/advances` - Request advance
- `POST /api/advances/:id/approve` - Approve advance
- `POST /api/advances/:id/reject` - Reject advance

### Attendance & Overtime
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Create attendance record
- `POST /api/attendance/:id/approve` - Approve attendance

- `GET /api/overtime` - Get overtime entries
- `POST /api/overtime` - Create overtime entry
- `POST /api/overtime/:id/approve` - Approve overtime

All authenticated endpoints require `Authorization: Bearer <token>` header.

## Database Schema

Key tables:
- `users` - System users with roles
- `employees` - Employee master data
- `allowances` - Employee allowances
- `deductions` - Employee deductions
- `payroll_runs` - Payroll processing records
- `payslips` - Generated payslips
- `statutory_config` - Tax and statutory rates
- `leave_policies` - Leave type definitions
- `leave_balances` - Employee leave balances
- `leave_requests` - Leave applications
- `advances` - Salary advances
- `attendance_records` - Attendance tracking
- `overtime_entries` - Overtime records
- `reports` - Generated reports
- `audit_logs` - System audit trail

## Development

### Project Structure

```
├── client/                # Frontend React application
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page components
│       ├── hooks/        # Custom React hooks
│       └── lib/          # Utilities and helpers
├── server/               # Backend Express application
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database layer
│   ├── calculations.ts   # Payroll calculation engine
│   ├── pdf-generator.ts  # PDF generation
│   ├── seed.ts           # Database seeding
│   └── db.ts             # Database connection
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and Zod validators
└── README.md             # This file
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

### Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string (automatically set on Replit)
- `SESSION_SECRET` - JWT secret key (defaults to development key)

## Deployment

The application is configured for deployment on Replit with autoscale:

```json
{
  "deployment_target": "autoscale",
  "build": ["npm", "run", "build"],
  "run": ["npm", "run", "start"]
}
```

## Security

- All passwords are hashed using bcryptjs
- JWT tokens for authentication with 24-hour expiration
- Role-based access control
- Audit logging for all critical operations
- Input validation using Zod schemas

## Support

For issues or questions:
1. Check the user guide above
2. Review the demo credentials and sample data
3. Ensure database is seeded properly
4. Verify all environment variables are set

## License

MIT License - See LICENSE file for details

## Credits

Developed with modern web technologies:
- React Team for React
- Vercel for TanStack Query
- shadcn for UI components
- Drizzle Team for Drizzle ORM
- And all other open-source contributors

---

**Innovare Payroll** - Simplifying Payroll Management for Zambian Businesses

