# Innovare Payroll System

## Overview

Innovare Payroll is a production-ready payroll management system designed specifically for Zambian businesses. The application automates complex statutory calculations including PAYE (Pay As You Earn), NAPSA (National Pension Scheme Authority), NHIMA (National Health Insurance Management Authority), and SDL (Skills Development Levy). It provides comprehensive employee management, payroll processing, payslip generation, leave tracking, salary advances, and compliance reporting capabilities. The system is built as a full-stack web application with a focus on data accuracy, audit trails, and regulatory compliance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Language**: React 18 with TypeScript, utilizing functional components and hooks for state management.

**Routing**: Wouter - a lightweight routing library chosen for its minimal footprint and simplicity over React Router.

**UI Component Library**: shadcn/ui components built on Radix UI primitives, providing accessible, customizable components that follow the "New York" style variant. Components are installed locally rather than as npm packages, allowing for full customization.

**Styling System**: Tailwind CSS with a custom design system defined in `design_guidelines.md`. The color system uses HSL values with CSS custom properties for theme support, enabling both light and dark modes. Custom spacing primitives (2, 4, 6, 8, 12, 16) ensure visual consistency.

**State Management**: 
- **Server State**: TanStack Query (React Query) v5 for data fetching, caching, and synchronization
- **Local State**: React hooks (useState, useContext) for component-level state
- **Form State**: React Hook Form with Zod validation resolvers for type-safe form handling

**Type Safety**: Full TypeScript coverage with shared types between frontend and backend via a `shared/schema.ts` file, ensuring type consistency across the stack.

**Authentication**: JWT token-based authentication stored in localStorage, with bearer token headers sent on all authenticated API requests. Role-based access control (Admin, PayrollOfficer, HROfficer, Auditor) determines feature availability.

### Backend Architecture

**Runtime & Framework**: Node.js with Express.js, written in TypeScript and compiled with esbuild for production. The development server uses tsx for hot reloading.

**API Design**: RESTful API endpoints organized by domain (auth, employees, payroll, reports, etc.) with consistent response patterns.

**Business Logic**: Centralized payroll calculation engine (`server/calculations.ts`) that implements Zambian tax law:
- Progressive PAYE tax bands with fixed amounts per band
- NAPSA contributions with employer/employee split and salary caps
- NHIMA health insurance calculations
- Optional SDL levy support

**Data Access Layer**: Storage abstraction pattern (`server/storage.ts`) provides an interface-based repository for all database operations, making the data layer swappable and testable.

**Authentication & Security**:
- Password hashing using bcryptjs (10 salt rounds)
- JWT tokens signed with SESSION_SECRET environment variable
- Authentication middleware validates tokens on protected routes
- Session management without express-session (stateless JWT approach)

**Input Validation**: Zod schemas defined in shared schema file validate all incoming requests, ensuring data integrity before database operations.

### Database Architecture

**Database**: PostgreSQL accessed via Neon serverless driver with WebSocket support for serverless environments.

**ORM**: Drizzle ORM chosen for its TypeScript-first approach, zero-runtime overhead, and SQL-like query builder. Schema defined in `shared/schema.ts` with automatic type inference.

**Schema Design**:
- **Users**: Role-based authentication with hashed passwords
- **Employees**: Comprehensive employee records including statutory IDs (NRC, PAYE, NAPSA, NHIMA numbers)
- **Compensation**: Separate tables for allowances and deductions linked to employees
- **Payroll Processing**: PayrollRun entities track batch processing with status workflow (Draft → Approved → Locked)
- **Payslips**: Immutable records generated from payroll runs with detailed breakdowns
- **Statutory Configuration**: Versioned tax rules and rates with effective dates for historical accuracy
- **Leave Management**: Policies, balances, and approval workflow
- **Advances**: Salary advance tracking with repayment schedules
- **Audit Logs**: Immutable trail of all system operations for compliance

**Migration Strategy**: Drizzle Kit handles schema migrations with files stored in `/migrations` directory. The `db:push` script synchronizes schema changes to the database.

**Data Integrity**: UUID primary keys generated via PostgreSQL's `gen_random_uuid()`, foreign key constraints for referential integrity, NOT NULL constraints on critical fields.

### Build & Development

**Module System**: ES Modules (ESM) throughout the application for modern JavaScript support.

**Build Tools**:
- **Frontend**: Vite for development server and production builds with HMR, optimized bundling, and asset handling
- **Backend**: esbuild for fast TypeScript compilation with external package handling

**Development Workflow**:
- Development server runs both backend (Express) and frontend (Vite middleware) in a single process
- Vite serves the frontend in development with HMR
- Production build creates static assets served by Express

**Path Aliases**: TypeScript path mapping for clean imports:
- `@/*` → `client/src/*` (frontend code)
- `@shared/*` → `shared/*` (shared types/schemas)
- `@assets/*` → `attached_assets/*` (static assets)

**Type Checking**: Incremental TypeScript compilation with `tsc --noEmit` for type validation without code generation.

## External Dependencies

### Core Libraries

**UI & Styling**:
- Radix UI component primitives (accordion, dialog, dropdown, select, etc.) for accessible, unstyled components
- class-variance-authority for type-safe component variants
- tailwindcss + autoprefixer for utility-first styling
- Lucide React for consistent iconography

**Data Fetching & Forms**:
- @tanstack/react-query for server state management with intelligent caching
- react-hook-form for performant form handling with minimal re-renders
- @hookform/resolvers/zod for schema-based form validation

**Validation & Schema**:
- Zod for runtime type validation and schema definition
- drizzle-zod for automatic Zod schema generation from Drizzle tables

**Database**:
- @neondatabase/serverless for PostgreSQL connectivity via WebSockets (Neon-compatible)
- drizzle-orm for type-safe database queries
- ws (WebSocket library) required by Neon serverless driver

**Authentication**:
- jsonwebtoken for JWT creation and verification
- bcryptjs for password hashing (no native dependencies)

**Date Handling**:
- date-fns for date manipulation and formatting

**Development Tools**:
- @replit/vite-plugin-runtime-error-modal for better error visibility in Replit
- @replit/vite-plugin-cartographer for Replit-specific integrations
- tsx for TypeScript execution in development

### Database Provisioning

The application requires a PostgreSQL database accessible via the `DATABASE_URL` environment variable. The connection string must be compatible with the Neon serverless driver format (supports WebSocket connections). If PostgreSQL is not yet provisioned, it should be added with Drizzle ORM configuration already in place.

### Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string (must be set or application throws error)
- `SESSION_SECRET`: JWT signing secret (defaults to "innovare-payroll-secret-key" if not set)
- `NODE_ENV`: Environment indicator (development/production)

### Font Loading

The application uses Google Fonts CDN to load multiple font families referenced in the HTML but not fully configured in the provided snippets (Inter for primary UI, Geist Mono, DM Sans, Fira Code, Architects Daughter based on index.html).

### Compliance & Reporting

The system is designed to generate export files for Zambian statutory bodies (ZRA, NAPSA, NHIMA) in CSV/Excel/XML formats, though the specific export implementations are referenced in requirements but not fully visible in the codebase snapshot.