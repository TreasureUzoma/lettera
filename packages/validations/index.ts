import { z } from "zod";

const USERNAME_REGEX = /^[a-z0-9_-]+$/;

export const BANNED_USERNAMES = [
  "about",
  "account",
  "admin",
  "api",
  "app",
  "auth",
  "billing",
  "blog",
  "contact",
  "dashboard",
  "developer",
  "developers",
  "docs",
  "email",
  "emails",
  "external",
  "help",
  "legal",
  "login",
  "logout",
  "payments",
  "post",
  "posts",
  "pricing",
  "privacy",
  "profile",
  "register",
  "root",
  "route",
  "safety",
  "security",
  "settings",
  "signup",
  "status",
  "support",
  "terms",
  "user",
  "users",
  "www",
];

const BANNED_SET = new Set(
  BANNED_USERNAMES.map((name) => name.toLowerCase().trim())
);

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z
    .string()
    .trim()
    .min(7, "Password must be at least 7 characters")
    .max(50, "Password must be less than 50 characters"),
});

export type Login = z.infer<typeof loginSchema>;

export const createAccountSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .trim()
    .min(7, "Password must be at least 7 characters")
    .max(50, "Password must be less than 50 characters"),
  name: z.string().min(2).max(30),
});

export type Signup = z.infer<typeof createAccountSchema>;

export const verifyResetPasswordSchema = z.object({
  password: z
    .string()
    .trim()
    .min(7, "Password must be at least 7 characters")
    .max(50, "Password must be less than 50 characters"),
  token: z.string().uuid(),
});

export type VerifyResetPassword = z.infer<typeof verifyResetPasswordSchema>;

export const createOauthUserSchema = z.object({
  provider: z.enum(["google", "github"]),
  providerId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  avatarUrl: z.string().url().optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(35),
  isPublic: z.boolean(),
  fromEmail: z.string().email(),
});

export type NewProject = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(35).optional(),
  isPublic: z.boolean().optional(),
  fromEmail: z.string().email().optional(),
});

export type UpdateProject = z.infer<typeof updateProjectSchema>;

export const isValidUUID = z.object({
  id: z.string().uuid("Invalid UUID format"),
});

export const isValidUsername = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(20, { message: "Username must be 20 characters or less." })
    .trim()
    .toLowerCase()
    .regex(USERNAME_REGEX, {
      message:
        "Username must only contain lowercase letters, numbers, hyphens (-), or underscores (_).",
    })
    .refine(
      (value) => !BANNED_SET.has(value),
      (value) => ({
        message: `The username '${value}' is reserved and cannot be used.`,
      })
    ),
});

export const isValidToken = z.object({
  token: z.string().min(60).max(900),
});

export const newProjectInviteSchema = z.object({
  projectId: z.string().uuid(),
  invitedByUserId: z.string().uuid(),
  invitedToUserId: z.string().uuid(),
});

export const updateProjectMemberRoleSchema = z.object({
  projectId: z.string().uuid(),
  targetUserId: z.string().uuid(),
  role: z.enum(["owner", "admin", "editor", "viewer"]),
});

export type NewProjectInvite = z.infer<typeof newProjectInviteSchema>;

export const acceptProjectInviteSchema = z.object({
  inviteId: z.string().uuid(),
  acceptingUserId: z.string().uuid(),
});

export const inviteUserToProjectSchema = z.object({
  projectId: z.string().uuid(),
  invitedByUserId: z.string().uuid(),
  invitedToUserId: z.string().uuid(),
  role: z.enum(["owner", "admin", "editor", "viewer"]),
});

export const unsubscribeFromProjectSchema = z.object({
  projectId: z.string().uuid(),
  email: z.string().email(),
});

export type UnsubscribeRequest = z.infer<typeof unsubscribeFromProjectSchema>;

export const createProjectSubscriberSchema = z.object({
  name: z.string().min(2).max(40).optional(),
  email: z.string().email(),
  projectId: z.string().uuid(),
});

export type CreateSubscriber = z.infer<typeof createProjectSubscriberSchema>;

export const updateProfileSchema = z
  .object({
    name: z
      .string({
        invalid_type_error: "Name must be a string.",
      })
      .min(1, { message: "Name cannot be empty." })
      .max(50, { message: "Name must be 50 characters or less." })
      .optional(),

    username: z
      .string({
        invalid_type_error: "Username must be a string.",
      })
      .min(3, { message: "Username must be at least 3 characters long." })
      .max(20, { message: "Username must be 20 characters or less." })
      .trim()
      .toLowerCase()
      .regex(USERNAME_REGEX, {
        message:
          "Username must only contain lowercase letters, numbers, hyphens (-), or underscores (_).",
      })
      .refine(
        (value) => !BANNED_SET.has(value),
        (value) => ({
          message: `The username '${value}' is reserved and cannot be used.`,
        })
      )
      .optional(),

    avatarUrl: z
      .string({
        invalid_type_error: "Avatar URL must be a string.",
      })
      .url({ message: "Invalid URL format for avatar." })
      .nullish(),
  })
  .partial();

export type UpdateProfile = z.infer<typeof updateProfileSchema>;
