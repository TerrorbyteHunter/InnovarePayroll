import "dotenv/config";
import { Pool } from "pg";

async function resetSchema() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL must be set before resetting the database.");
  }

  const pool = new Pool({ connectionString });

  try {
    console.log("⚠️  Dropping public schema (this removes all tables)...");
    await pool.query("DROP SCHEMA IF EXISTS public CASCADE;");

    console.log("🆕 Recreating public schema...");
    await pool.query("CREATE SCHEMA public;");
    await pool.query("GRANT ALL ON SCHEMA public TO postgres;");
    await pool.query("GRANT ALL ON SCHEMA public TO public;");

    console.log("✅ Schema reset complete.");
  } finally {
    await pool.end();
  }
}

resetSchema().catch((err) => {
  console.error("❌ Failed to reset schema:", err);
  process.exit(1);
});

