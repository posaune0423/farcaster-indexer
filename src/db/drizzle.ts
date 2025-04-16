import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!Deno.env.get("DATABASE_URL")) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: Deno.env.get("DATABASE_URL"),
  max: 10,
});

export const db = drizzle(pool);
