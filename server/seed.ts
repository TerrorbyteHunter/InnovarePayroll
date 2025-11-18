import { db } from "./db";
import { users, statutoryConfig, leavePolicies } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Check if admin user exists
  const existingAdmin = await db.select().from(users).limit(1);
  
  if (existingAdmin.length === 0) {
    // Create default admin user
    const hashedPassword = await bcrypt.hash("password", 10);
    
    await db.insert(users).values({
      username: "admin",
      password: hashedPassword,
      fullName: "Admin User",
      email: "admin@innovare.zm",
      role: "Admin",
      isActive: true,
    });
    
    console.log("✓ Created admin user (username: admin, password: password)");
  }

  // Check if statutory config exists
  const existingConfig = await db.select().from(statutoryConfig).limit(1);
  
  if (existingConfig.length === 0) {
    // Create default statutory configuration
    await db.insert(statutoryConfig).values({
      effectiveDate: new Date().toISOString().split('T')[0],
      payeBands: [
        { min: 0, max: 4500, rate: 0, fixedAmount: 0 },
        { min: 4500, max: 6900, rate: 0.25, fixedAmount: 0 },
        { min: 6900, max: 11700, rate: 0.30, fixedAmount: 600 },
        { min: 11700, max: 999999999, rate: 0.375, fixedAmount: 2040 },
      ],
      payeReliefs: { personal: 0 },
      napsaRate: "0.05",
      napsaCap: "4185.00",
      nhimaRate: "0.01",
      sdlEnabled: false,
      sdlRate: "0",
      isActive: true,
    });
    
    console.log("✓ Created statutory configuration (PAYE, NAPSA, NHIMA rates)");
  }

  // Check if leave policy exists
  const existingPolicy = await db.select().from(leavePolicies).limit(1);
  
  if (existingPolicy.length === 0) {
    // Create default leave policy
    await db.insert(leavePolicies).values({
      name: "Annual Leave",
      description: "Standard annual leave policy - 24 days per year",
      daysPerYear: 24,
      isActive: true,
    });
    
    console.log("✓ Created default leave policy (Annual Leave - 24 days/year)");
  }

  console.log("Database seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
