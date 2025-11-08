import { z } from "zod";

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  APP_URL: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  NODE_ENV: z.string().default("development"),
  REDIS_URL: z.string(),
  PORT: z.coerce.number().default(3005),
  ENCRYPTION_KEY: z.string(),
  UNSUBSCRIBE_SECRET: z.string(),
});

export const envConfig = envSchema.parse(process.env);
