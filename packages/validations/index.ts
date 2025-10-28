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
