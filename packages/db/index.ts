import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const pgUrl = process.env.DB_URL;
if (!pgUrl) {
  throw new Error("DB_URL is not set in environment variables");
}

const sql = neon(pgUrl);
export const db = drizzle(sql);
