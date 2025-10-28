import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userAuthMethodEnum = pgEnum("user_auth_method", [
  "email",
  "google",
  "github",
]);
export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "read-only",
]);
export const userRoleEnum = pgEnum("user_role", [
  "user",
  "admin",
  "superadmin",
]);
export const userSubscriptionEnum = pgEnum("user_subscription", [
  "free",
  "pro",
  "enterprise",
]);

export const users = pgTable("users", {
  serial: serial("serial").primaryKey(),
  id: uuid("id").defaultRandom().notNull().unique(),
  providerId: text("provider_id"),
  name: text("name").notNull(),
  username: text("username").unique(),
  email: text("email").notNull().unique(),
  password: text("password"),
  emailVerifiedAt: timestamp("email_verified_at"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
  authMethod: userAuthMethodEnum("auth_method").default("email"),
  status: userStatusEnum("status").default("active"),
  role: userRoleEnum("role").default("user"),
  subscriptionType: userSubscriptionEnum("subscription_type").default("free"),
});

export const verification = pgTable("verification", {
  serial: serial("serial").primaryKey(),
  id: uuid("id").defaultRandom().notNull().unique(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  type: text("type").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

export const refreshTokens = pgTable("refresh_tokens", {
  serial: serial("serial").primaryKey(),
  id: uuid("id").defaultRandom().notNull().unique(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revoked: boolean("revoked").notNull().default(false),
  userAgent: text("user_agent").notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

export const passwordResets = pgTable("password_resets", {
  serial: serial("serial").primaryKey(),
  id: uuid("id").defaultRandom().notNull().unique(),
  userId: uuid("user_id").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});
