import "dotenv/config";
import { db } from "./db";
import { 
  users, employees, allowances, deductions, statutoryConfig, 
  leavePolicies, leaveBalances, leaveRequests, advances, 
  payrollRuns, payslips, auditLogs 
} from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Starting comprehensive database seeding...");

  try {
    const hashedPassword = await bcrypt.hash("password", 10);
    const now = new Date();

    console.log("👥 Creating users...");
    await db.insert(users).values([
      {
        id: "user-admin-1",
        username: "admin",
        password: hashedPassword,
        fullName: "System Administrator",
        email: "admin@innovare.zm",
        role: "Admin",
        isActive: true,
      },
      {
        id: "user-payroll-1",
        username: "payroll",
        password: hashedPassword,
        fullName: "Grace Tembo",
        email: "grace.tembo@innovare.zm",
        role: "PayrollOfficer",
        isActive: true,
      },
      {
        id: "user-hr-1",
        username: "hrofficer",
        password: hashedPassword,
        fullName: "Peter Sakala",
        email: "peter.sakala@innovare.zm",
        role: "HROfficer",
        isActive: true,
      },
      {
        id: "user-auditor-1",
        username: "auditor",
        password: hashedPassword,
        fullName: "Mary Phiri",
        email: "mary.phiri@innovare.zm",
        role: "Auditor",
        isActive: true,
      },
    ]).onConflictDoNothing();

    console.log("⚙️  Creating statutory configuration...");
    await db.insert(statutoryConfig).values({
      id: "config-2024-1",
      effectiveDate: "2024-01-01",
      payeBands: [
        { min: 0, max: 5100, rate: 0, fixedAmount: 0 },
        { min: 5100.01, max: 7100, rate: 0.25, fixedAmount: 0 },
        { min: 7100.01, max: 9200, rate: 0.30, fixedAmount: 500 },
        { min: 9200.01, max: 999999999, rate: 0.37, fixedAmount: 1130 },
      ],
      payeReliefs: { personal: 4500 },
      napsaRate: "0.0500",
      napsaCap: "2940.00",
      nhimaRate: "0.0100",
      sdlEnabled: false,
      sdlRate: "0",
      isActive: true,
    }).onConflictDoNothing();

    console.log("🏖️  Creating leave policies...");
    await db.insert(leavePolicies).values([
      {
        id: "policy-annual-1",
        name: "Annual Leave",
        description: "Standard annual leave entitlement",
        daysPerYear: 24,
        isActive: true,
      },
      {
        id: "policy-sick-1",
        name: "Sick Leave",
        description: "Paid sick leave",
        daysPerYear: 12,
        isActive: true,
      },
      {
        id: "policy-maternity-1",
        name: "Maternity Leave",
        description: "Maternity leave for female employees",
        daysPerYear: 84,
        isActive: true,
      },
      {
        id: "policy-compassionate-1",
        name: "Compassionate Leave",
        description: "Leave for family emergencies",
        daysPerYear: 5,
        isActive: true,
      },
    ]).onConflictDoNothing();

    console.log("👨‍💼 Creating employees...");
    await db.insert(employees).values([
      {
        id: "emp-001",
        employeeNumber: "EMP001",
        firstName: "John",
        lastName: "Mwale",
        nrcNumber: "123456/78/1",
        email: "john.mwale@company.zm",
        phone: "+260977123456",
        dateOfBirth: "1985-05-15",
        gender: "Male",
        address: "Plot 123, Kabulonga, Lusaka",
        department: "Finance",
        position: "Chief Financial Officer",
        hireDate: "2020-01-15",
        bankName: "Zanaco",
        bankAccount: "1234567890",
        bankBranch: "Cairo Road",
        baseSalary: "15000.00",
        payeNumber: "PAYE001",
        napsaNumber: "NAPSA001",
        nhimaNumber: "NHIMA001",
        isActive: true,
      },
      {
        id: "emp-002",
        employeeNumber: "EMP002",
        firstName: "Mary",
        lastName: "Banda",
        nrcNumber: "234567/89/1",
        email: "mary.banda@company.zm",
        phone: "+260966234567",
        dateOfBirth: "1990-08-22",
        gender: "Female",
        address: "Plot 456, Roma, Lusaka",
        department: "Human Resources",
        position: "HR Manager",
        hireDate: "2021-03-01",
        bankName: "First National Bank",
        bankAccount: "2345678901",
        bankBranch: "Soweto Branch",
        baseSalary: "12000.00",
        payeNumber: "PAYE002",
        napsaNumber: "NAPSA002",
        nhimaNumber: "NHIMA002",
        isActive: true,
      },
      {
        id: "emp-003",
        employeeNumber: "EMP003",
        firstName: "David",
        lastName: "Phiri",
        nrcNumber: "345678/90/1",
        email: "david.phiri@company.zm",
        phone: "+260955345678",
        dateOfBirth: "1988-11-30",
        gender: "Male",
        address: "Plot 789, Chelstone, Lusaka",
        department: "IT",
        position: "Senior Software Developer",
        hireDate: "2019-06-10",
        bankName: "Zanaco",
        bankAccount: "3456789012",
        bankBranch: "Woodlands",
        baseSalary: "14000.00",
        payeNumber: "PAYE003",
        napsaNumber: "NAPSA003",
        nhimaNumber: "NHIMA003",
        isActive: true,
      },
      {
        id: "emp-004",
        employeeNumber: "EMP004",
        firstName: "Sarah",
        lastName: "Zulu",
        nrcNumber: "456789/01/1",
        email: "sarah.zulu@company.zm",
        phone: "+260944456789",
        dateOfBirth: "1992-03-18",
        gender: "Female",
        address: "Plot 321, Meanwood, Lusaka",
        department: "Marketing",
        position: "Marketing Manager",
        hireDate: "2022-01-20",
        bankName: "Standard Chartered",
        bankAccount: "4567890123",
        bankBranch: "Longacres",
        baseSalary: "11000.00",
        payeNumber: "PAYE004",
        napsaNumber: "NAPSA004",
        nhimaNumber: "NHIMA004",
        isActive: true,
      },
      {
        id: "emp-005",
        employeeNumber: "EMP005",
        firstName: "James",
        lastName: "Ngoma",
        nrcNumber: "567890/12/1",
        email: "james.ngoma@company.zm",
        phone: "+260933567890",
        dateOfBirth: "1987-07-25",
        gender: "Male",
        address: "Plot 654, Kabwata, Lusaka",
        department: "Operations",
        position: "Operations Manager",
        hireDate: "2020-09-15",
        bankName: "Zanaco",
        bankAccount: "5678901234",
        bankBranch: "Cairo Road",
        baseSalary: "13000.00",
        payeNumber: "PAYE005",
        napsaNumber: "NAPSA005",
        nhimaNumber: "NHIMA005",
        isActive: true,
      },
      {
        id: "emp-006",
        employeeNumber: "EMP006",
        firstName: "Grace",
        lastName: "Siame",
        nrcNumber: "678901/23/1",
        email: "grace.siame@company.zm",
        phone: "+260922678901",
        dateOfBirth: "1995-12-10",
        gender: "Female",
        address: "Plot 987, Olympia, Lusaka",
        department: "Finance",
        position: "Accountant",
        hireDate: "2023-02-01",
        bankName: "First National Bank",
        bankAccount: "6789012345",
        bankBranch: "Arcades",
        baseSalary: "9500.00",
        payeNumber: "PAYE006",
        napsaNumber: "NAPSA006",
        nhimaNumber: "NHIMA006",
        isActive: true,
      },
      {
        id: "emp-007",
        employeeNumber: "EMP007",
        firstName: "Patrick",
        lastName: "Lungu",
        nrcNumber: "789012/34/1",
        email: "patrick.lungu@company.zm",
        phone: "+260911789012",
        dateOfBirth: "1991-04-14",
        gender: "Male",
        address: "Plot 147, Woodlands, Lusaka",
        department: "IT",
        position: "Junior Developer",
        hireDate: "2023-06-15",
        bankName: "Zanaco",
        bankAccount: "7890123456",
        bankBranch: "Woodlands",
        baseSalary: "7500.00",
        payeNumber: "PAYE007",
        napsaNumber: "NAPSA007",
        nhimaNumber: "NHIMA007",
        isActive: true,
      },
      {
        id: "emp-008",
        employeeNumber: "EMP008",
        firstName: "Ruth",
        lastName: "Kalaba",
        nrcNumber: "890123/45/1",
        email: "ruth.kalaba@company.zm",
        phone: "+260900890123",
        dateOfBirth: "1993-09-28",
        gender: "Female",
        address: "Plot 258, Rhodes Park, Lusaka",
        department: "Human Resources",
        position: "HR Officer",
        hireDate: "2022-11-01",
        bankName: "Standard Chartered",
        bankAccount: "8901234567",
        bankBranch: "Longacres",
        baseSalary: "8000.00",
        payeNumber: "PAYE008",
        napsaNumber: "NAPSA008",
        nhimaNumber: "NHIMA008",
        isActive: true,
      },
      {
        id: "emp-009",
        employeeNumber: "EMP009",
        firstName: "Joseph",
        lastName: "Mbewe",
        nrcNumber: "901234/56/1",
        email: "joseph.mbewe@company.zm",
        phone: "+260977901234",
        dateOfBirth: "1989-01-05",
        gender: "Male",
        address: "Plot 369, Northmead, Lusaka",
        department: "Sales",
        position: "Sales Executive",
        hireDate: "2021-08-10",
        bankName: "Zanaco",
        bankAccount: "9012345678",
        bankBranch: "Cairo Road",
        baseSalary: "8500.00",
        payeNumber: "PAYE009",
        napsaNumber: "NAPSA009",
        nhimaNumber: "NHIMA009",
        isActive: true,
      },
      {
        id: "emp-010",
        employeeNumber: "EMP010",
        firstName: "Alice",
        lastName: "Mwanza",
        nrcNumber: "012345/67/1",
        email: "alice.mwanza@company.zm",
        phone: "+260966012345",
        dateOfBirth: "1994-06-20",
        gender: "Female",
        address: "Plot 741, Libala, Lusaka",
        department: "Marketing",
        position: "Marketing Officer",
        hireDate: "2023-04-01",
        bankName: "First National Bank",
        bankAccount: "0123456789",
        bankBranch: "Arcades",
        baseSalary: "7000.00",
        payeNumber: "PAYE010",
        napsaNumber: "NAPSA010",
        nhimaNumber: "NHIMA010",
        isActive: true,
      },
    ]).onConflictDoNothing();

    console.log("💰 Adding allowances...");
    await db.insert(allowances).values([
      { employeeId: "emp-001", name: "Housing Allowance", amount: "5000.00", isTaxable: true, isRecurring: true },
      { employeeId: "emp-001", name: "Transport Allowance", amount: "2000.00", isTaxable: true, isRecurring: true },
      { employeeId: "emp-002", name: "Housing Allowance", amount: "4000.00", isTaxable: true, isRecurring: true },
      { employeeId: "emp-002", name: "Transport Allowance", amount: "1500.00", isTaxable: true, isRecurring: true },
      { employeeId: "emp-003", name: "Housing Allowance", amount: "4500.00", isTaxable: true, isRecurring: true },
      { employeeId: "emp-003", name: "Transport Allowance", amount: "1800.00", isTaxable: true, isRecurring: true },
      { employeeId: "emp-004", name: "Housing Allowance", amount: "3500.00", isTaxable: true, isRecurring: true },
      { employeeId: "emp-005", name: "Housing Allowance", amount: "4200.00", isTaxable: true, isRecurring: true },
      { employeeId: "emp-006", name: "Transport Allowance", amount: "1200.00", isTaxable: true, isRecurring: true },
      { employeeId: "emp-007", name: "Meal Allowance", amount: "500.00", isTaxable: false, isRecurring: true },
    ]).onConflictDoNothing();

    console.log("➖ Adding deductions...");
    await db.insert(deductions).values([
      { employeeId: "emp-003", name: "Staff Loan", amount: "500.00", isRecurring: true },
      { employeeId: "emp-005", name: "Union Dues", amount: "100.00", isRecurring: true },
      { employeeId: "emp-007", name: "Staff Loan", amount: "300.00", isRecurring: true },
    ]).onConflictDoNothing();

    console.log("📊 Creating leave balances...");
    await db.insert(leaveBalances).values([
      { employeeId: "emp-001", policyId: "policy-annual-1", year: 2024, totalDays: 24, usedDays: 5, remainingDays: 19 },
      { employeeId: "emp-001", policyId: "policy-sick-1", year: 2024, totalDays: 12, usedDays: 2, remainingDays: 10 },
      { employeeId: "emp-002", policyId: "policy-annual-1", year: 2024, totalDays: 24, usedDays: 8, remainingDays: 16 },
      { employeeId: "emp-002", policyId: "policy-sick-1", year: 2024, totalDays: 12, usedDays: 1, remainingDays: 11 },
      { employeeId: "emp-003", policyId: "policy-annual-1", year: 2024, totalDays: 24, usedDays: 3, remainingDays: 21 },
      { employeeId: "emp-003", policyId: "policy-sick-1", year: 2024, totalDays: 12, usedDays: 0, remainingDays: 12 },
      { employeeId: "emp-004", policyId: "policy-annual-1", year: 2024, totalDays: 24, usedDays: 10, remainingDays: 14 },
      { employeeId: "emp-004", policyId: "policy-sick-1", year: 2024, totalDays: 12, usedDays: 3, remainingDays: 9 },
      { employeeId: "emp-005", policyId: "policy-annual-1", year: 2024, totalDays: 24, usedDays: 6, remainingDays: 18 },
      { employeeId: "emp-005", policyId: "policy-sick-1", year: 2024, totalDays: 12, usedDays: 1, remainingDays: 11 },
    ]).onConflictDoNothing();

    console.log("📝 Creating leave requests...");
    await db.insert(leaveRequests).values([
      {
        employeeId: "emp-001",
        policyId: "policy-annual-1",
        startDate: "2024-12-20",
        endDate: "2024-12-27",
        days: 5,
        reason: "Christmas vacation",
        status: "Approved",
        reviewedBy: "user-hr-1",
        reviewedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        employeeId: "emp-002",
        policyId: "policy-sick-1",
        startDate: "2024-11-15",
        endDate: "2024-11-15",
        days: 1,
        reason: "Medical appointment",
        status: "Approved",
        reviewedBy: "user-hr-1",
        reviewedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        employeeId: "emp-003",
        policyId: "policy-annual-1",
        startDate: "2024-12-15",
        endDate: "2024-12-22",
        days: 5,
        reason: "Family visit",
        status: "Pending",
      },
      {
        employeeId: "emp-004",
        policyId: "policy-annual-1",
        startDate: "2024-11-20",
        endDate: "2024-11-22",
        days: 2,
        reason: "Personal matters",
        status: "Rejected",
        reviewedBy: "user-hr-1",
        reviewedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        reviewComments: "Insufficient leave balance",
      },
    ]).onConflictDoNothing();

    console.log("💵 Creating salary advances...");
    await db.insert(advances).values([
      {
        employeeId: "emp-007",
        amount: "3000.00",
        reason: "Emergency medical expenses",
        installments: 6,
        installmentAmount: "500.00",
        remainingBalance: "3000.00",
        paidInstallments: 0,
        status: "Approved",
        approvedBy: "user-admin-1",
        approvedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        employeeId: "emp-009",
        amount: "2000.00",
        reason: "School fees",
        installments: 4,
        installmentAmount: "500.00",
        remainingBalance: "1000.00",
        paidInstallments: 2,
        status: "Active",
        approvedBy: "user-admin-1",
        approvedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        employeeId: "emp-010",
        amount: "1500.00",
        reason: "Personal emergency",
        installments: 3,
        installmentAmount: "500.00",
        remainingBalance: "1500.00",
        paidInstallments: 0,
        status: "Pending",
      },
    ]).onConflictDoNothing();

    console.log("📑 Creating sample payroll run...");
    await db.insert(payrollRuns).values({
      id: "payroll-2024-11",
      period: "November 2024",
      startDate: "2024-11-01",
      endDate: "2024-11-30",
      status: "Approved",
      totalGross: "125500.00",
      totalPaye: "28450.00",
      totalNapsa: "6275.00",
      totalNhima: "1255.00",
      totalDeductions: "900.00",
      totalNet: "88620.00",
      employeeCount: 10,
      createdBy: "user-payroll-1",
      approvedBy: "user-admin-1",
      approvedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    }).onConflictDoNothing();

    console.log("📄 Creating sample payslips...");
    await db.insert(payslips).values([
      {
        payrollRunId: "payroll-2024-11",
        employeeId: "emp-001",
        period: "November 2024",
        baseSalary: "15000.00",
        allowances: [
          { name: "Housing Allowance", amount: 5000 },
          { name: "Transport Allowance", amount: 2000 },
        ],
        deductions: [],
        grossPay: "22000.00",
        taxableIncome: "17500.00",
        paye: "4465.00",
        payeCalculation: {
          taxableIncome: 17500,
          bands: [
            { min: 5100.01, max: 7100, rate: 0.25, amount: 500 },
            { min: 7100.01, max: 9200, rate: 0.30, amount: 630 },
            { min: 9200.01, max: 17500, rate: 0.37, amount: 3335 },
          ],
        },
        napsaEmployee: "750.00",
        napsaEmployer: "750.00",
        nhima: "220.00",
        totalStatutory: "5435.00",
        totalDeductions: "5435.00",
        netPay: "16565.00",
      },
      {
        payrollRunId: "payroll-2024-11",
        employeeId: "emp-002",
        period: "November 2024",
        baseSalary: "12000.00",
        allowances: [
          { name: "Housing Allowance", amount: 4000 },
          { name: "Transport Allowance", amount: 1500 },
        ],
        deductions: [],
        grossPay: "17500.00",
        taxableIncome: "13000.00",
        paye: "2795.00",
        payeCalculation: {
          taxableIncome: 13000,
          bands: [
            { min: 5100.01, max: 7100, rate: 0.25, amount: 500 },
            { min: 7100.01, max: 9200, rate: 0.30, amount: 630 },
            { min: 9200.01, max: 13000, rate: 0.37, amount: 1665 },
          ],
        },
        napsaEmployee: "600.00",
        napsaEmployer: "600.00",
        nhima: "175.00",
        totalStatutory: "3570.00",
        totalDeductions: "3570.00",
        netPay: "13930.00",
      },
      {
        payrollRunId: "payroll-2024-11",
        employeeId: "emp-003",
        period: "November 2024",
        baseSalary: "14000.00",
        allowances: [
          { name: "Housing Allowance", amount: 4500 },
          { name: "Transport Allowance", amount: 1800 },
        ],
        deductions: [{ name: "Staff Loan", amount: 500 }],
        grossPay: "20300.00",
        taxableIncome: "15800.00",
        paye: "4028.00",
        payeCalculation: {
          taxableIncome: 15800,
          bands: [
            { min: 5100.01, max: 7100, rate: 0.25, amount: 500 },
            { min: 7100.01, max: 9200, rate: 0.30, amount: 630 },
            { min: 9200.01, max: 15800, rate: 0.37, amount: 2898 },
          ],
        },
        napsaEmployee: "700.00",
        napsaEmployer: "700.00",
        nhima: "203.00",
        totalStatutory: "4931.00",
        totalDeductions: "5431.00",
        netPay: "14869.00",
      },
    ]).onConflictDoNothing();

    console.log("📋 Creating audit logs...");
    await db.insert(auditLogs).values([
      {
        userId: "user-admin-1",
        action: "CREATE",
        entity: "payroll_run",
        entityId: "payroll-2024-11",
        metadata: { period: "November 2024" },
      },
      {
        userId: "user-admin-1",
        action: "APPROVE",
        entity: "payroll_run",
        entityId: "payroll-2024-11",
        metadata: { status: "Approved" },
      },
      {
        userId: "user-hr-1",
        action: "APPROVE",
        entity: "leave_request",
        entityId: "emp-001",
        metadata: { days: 5, period: "2024-12-20 to 2024-12-27" },
      },
      {
        userId: "user-admin-1",
        action: "APPROVE",
        entity: "advance",
        entityId: "emp-007",
        metadata: { amount: 3000, installments: 6 },
      },
    ]).onConflictDoNothing();

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log("   - 4 users created (admin, payroll, hrofficer, auditor)");
    console.log("   - 10 employees created");
    console.log("   - 10 allowances added");
    console.log("   - 3 deductions added");
    console.log("   - 4 leave policies created");
    console.log("   - 10 leave balances created");
    console.log("   - 4 leave requests created");
    console.log("   - 3 salary advances created");
    console.log("   - 1 payroll run created (November 2024)");
    console.log("   - 3 payslips generated");
    console.log("   - 4 audit log entries created");
    console.log("\n🔐 Default login credentials:");
    console.log("   Username: admin");
    console.log("   Password: password");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
