import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    host: "0.0.0.0",
    port: 5432,
    database: "farcaster",
    user: "admin",
    password: "password",
    ssl: false,
  },
});
