import { z } from "zod";

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
