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
  NEWSLETTER_DOMAIN: z.string().default("newsletter.lettera.dev"),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  PADDLE_API_KEY: z.string(),
  PADDLE_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
  // Required to verify Paddle webhook signatures — from Paddle Dashboard >
  // Developer Tools > Notifications > (your webhook destination) > secret
  // key. Webhooks are rejected outright if this isn't set.
  PADDLE_WEBHOOK_SECRET: z.string().optional(),
  // Paddle price IDs for each paid plan (Dashboard > Catalog > Prices).
  // Checkout for a plan fails with a clear error if its price ID isn't set.
  PADDLE_PRICE_ID_PROFESSIONAL: z.string().optional(),
  PADDLE_PRICE_ID_BUSINESS: z.string().optional(),
});

export const envConfig = envSchema.parse(process.env);
