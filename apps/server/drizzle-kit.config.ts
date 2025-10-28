import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { envConfig } from "./config";

const url = envConfig.dbUrl || "";

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/db/schema.ts", "./src/db/auth-schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: url,
  },
});
