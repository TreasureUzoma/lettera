import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  serial,
  pgEnum,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
export const emailStatusEnum = pgEnum("email_status", [
  "sent",
  "delivered",
  "failed",
  "opened",
]);
export const subscriberStatusEnum = pgEnum("subscriber_status", [
  "subscribed",
  "unsubscribed",
  "pending",
  "bounced",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
  "cancelled",
]);
export const paymentProviderEnum = pgEnum("payment_provider", [
  "stripe",
  "paypal",
  "flutterwave",
  "paystack",
  "manual",
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

export const projects = pgTable(
  "projects",
  {
    serial: serial("serial").primaryKey(),
    id: uuid("id").defaultRandom().notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    config: jsonb("config").default({}),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdx: index("projects_user_idx").on(table.userId),
  })
);

export const emails = pgTable(
  "emails",
  {
    serial: serial("serial").primaryKey(),
    id: uuid("id").defaultRandom().notNull().unique(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    sentAt: timestamp("sent_at")
      .$defaultFn(() => new Date())
      .notNull(),
    status: emailStatusEnum("status").notNull(),
  },
  (table) => ({
    projectIdx: index("emails_project_idx").on(table.projectId),
    statusIdx: index("emails_status_idx").on(table.status),
  })
);

export const subscribers = pgTable(
  "subscribers",
  {
    serial: serial("serial").primaryKey(),
    id: uuid("id").defaultRandom().notNull().unique(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name"),
    email: text("email").notNull(),
    status: subscriberStatusEnum("status").notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    projectIdx: index("subscribers_project_idx").on(table.projectId),
    statusIdx: index("subscribers_status_idx").on(table.status),
    projectEmailUnique: uniqueIndex("subscribers_project_email_idx").on(
      table.projectId,
      table.email
    ),
  })
);

export const payments = pgTable(
  "payments",
  {
    serial: serial("serial").primaryKey(),
    id: uuid("id").defaultRandom().notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    provider: paymentProviderEnum("provider").notNull().default("stripe"),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("USD"),
    reference: text("reference").notNull().unique(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdx: index("payments_user_idx").on(table.userId),
    projectIdx: index("payments_project_idx").on(table.projectId),
    statusIdx: index("payments_status_idx").on(table.status),
  })
);

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

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    serial: serial("serial").primaryKey(),
    id: uuid("id").defaultRandom().notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    revoked: boolean("revoked").notNull().default(false),
    userAgent: text("user_agent").notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdx: index("refresh_tokens_user_idx").on(table.userId),
  })
);

export const passwordResets = pgTable(
  "password_resets",
  {
    serial: serial("serial").primaryKey(),
    id: uuid("id").defaultRandom().notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    used: boolean("used").notNull().default(false),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdx: index("password_resets_user_idx").on(table.userId),
  })
);

export const userRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  refreshTokens: many(refreshTokens),
  passwordResets: many(passwordResets),
  payments: many(payments),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  emails: many(emails),
  subscribers: many(subscribers),
  payments: many(payments),
}));

export const emailRelations = relations(emails, ({ one }) => ({
  project: one(projects, {
    fields: [emails.projectId],
    references: [projects.id],
  }),
}));

export const subscriberRelations = relations(subscribers, ({ one }) => ({
  project: one(projects, {
    fields: [subscribers.projectId],
    references: [projects.id],
  }),
}));

export const refreshTokenRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const passwordResetRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, {
    fields: [passwordResets.userId],
    references: [users.id],
  }),
}));

export const paymentRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [payments.projectId],
    references: [projects.id],
  }),
}));
