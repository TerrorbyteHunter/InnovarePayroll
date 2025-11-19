import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-serverless";
import { drizzle as pgDrizzle } from "drizzle-orm/node-postgres";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isLocalConnection =
  databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");

const pool = isLocalConnection
  ? new PgPool({ connectionString: databaseUrl })
  : new NeonPool({ connectionString: databaseUrl });

export const db = isLocalConnection
  ? pgDrizzle(pool as PgPool, { schema })
  : neonDrizzle({ client: pool as NeonPool, schema });

export { pool };
