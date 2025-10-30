import { defineConfig } from "drizzle-kit";

const pgUrl = process.env.DB_URL;
if (!pgUrl) {
  throw new Error("DB_URL is not set in environment variables");
}

export default defineConfig({
  out: "./drizzle",
  schema: ["./schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: pgUrl,
  },
});
