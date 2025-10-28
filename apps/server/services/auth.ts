import { envConfig } from "@/config";
import type {
  NewUser,
  GitHubTokenData,
  GitHubEmail,
  GitHubUser,
  NewRefreshToken,
  Login,
  Signup,
  VerifyResetPassword,
} from "@workspace/types";

import { google } from "googleapis";
import { db } from "@workspace/db";
import { passwordResets, refreshTokens, users } from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";
import { sendForgottenPasswordEmail, sendWelcomeEmail } from "./internal";

const oauth2Client = new google.auth.OAuth2(
  envConfig.GOOGLE_CLIENT_ID,
  envConfig.GOOGLE_CLIENT_SECRET,
  `${envConfig.SERVER_PROD_URL}/api/v1/auth/google/callback`
);

const getGithubUserInfo = async (code: string) => {
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: envConfig.GITHUB_CLIENT_ID!,
      client_secret: envConfig.GITHUB_CLIENT_SECRET!,
      code,
    }),
  });

  const tokenData = (await tokenRes.json()) as GitHubTokenData;
  if (!tokenData.access_token) throw new Error("GitHub token exchange failed");

  const accessToken = tokenData.access_token;

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const user = (await userRes.json()) as GitHubUser;

  const emailRes = await fetch("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const emails = (await emailRes.json()) as GitHubEmail[];

  const primaryEmail =
    emails.find((e) => e.primary && e.verified)?.email ?? null;

  return {
    id: String(user.id),
    email: primaryEmail,
    name: user.name || user.login,
    avatarUrl: user.avatar_url,
  };
};

export const createOauthUser = async (data: NewUser & { code?: string }) => {
  if (data.authMethod === "google") {
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email || !userInfo.id) {
      return {
        message: "Invalid Google user data",
        data: null,
        success: false,
      };
    }

    return await upsertUser({
      providerId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name || "Unknown",
      authMethod: "google",
      avatarUrl: userInfo.picture || null,
    });
  }

  if (data.authMethod === "github") {
    if (!data.code) {
      return {
        message: "Missing GitHub code",
        data: null,
        success: false,
      };
    }

    const userInfo = await getGithubUserInfo(data.code);
    if (!userInfo.email) {
      return {
        message: "GitHub user has no public email",
        data: null,
        success: false,
      };
    }

    return await upsertUser({
      providerId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      authMethod: "github",
      avatarUrl: userInfo.avatarUrl || null,
    });
  }

  return {
    message: "Unsupported auth method",
    data: null,
    success: false,
  };
};

const upsertUser = async (user: {
  providerId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  authMethod: "google" | "github";
}) => {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, user.email))
    .limit(1);

  let currentUserId: string;

  if (existing.length === 0) {
    const [newUser] = await db
      .insert(users)
      .values({
        providerId: user.providerId,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        authMethod: user.authMethod,
        emailVerifiedAt: new Date(),
      })
      .returning({ id: users.id });

    currentUserId = newUser!.id;
  } else {
    currentUserId = existing[0]!.id;
  }

  return {
    message: "OAuth user created or fetched successfully",
    data: { id: currentUserId, email: user.email, name: user.name },
    success: true,
  };
};

export const insertAuthRefreshToken = async (data: NewRefreshToken) => {
  await db.insert(refreshTokens).values({
    token: data.token,
    expiresAt: data.expiresAt,
    revoked: false,
    userAgent: data.userAgent,
  });
};

export const deleteAuthRefreshToken = async (id: string) => {
  await db.delete(refreshTokens).where(eq(refreshTokens.id, id));
};

export const login = async (payload: Login) => {
  const { email, password } = payload;
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const foundUser = rows[0];
  if (!foundUser || !foundUser.password) {
    // Generic message for security
    return { success: false, message: "Invalid email or password", data: null };
  }

  const valid = await Bun.password.verify(password!, foundUser.password);
  if (!valid) {
    // Generic message for security
    return { success: false, message: "Invalid email or password", data: null };
  }
  return {
    success: true,
    message: "Password matched",
    data: foundUser,
  };
};

export const signup = async (payload: Signup) => {
  const { email, password, name } = payload;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      success: false,
      message: "Email already in use",
      data: null,
    };
  }

  const hashedPassword = await Bun.password.hash(password);

  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
    })
    .returning();
  await sendWelcomeEmail(newUser?.name ?? "", newUser!.email);

  return {
    success: true,
    message: "Signup successful",
    data: newUser,
  };
};

export const forgotPassword = async (email: string) => {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const genericResponse = {
    success: true,
    message: "If that email exists, a reset link has been sent to it.",
    data: email,
  };

  if (!existing) return genericResponse;

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await db.insert(passwordResets).values({
    userId: existing.id,
    token,
    expiresAt,
  });

  await sendForgottenPasswordEmail(email, expiresAt, token);

  return genericResponse;
};

export const verifyResetPassword = async (payload: VerifyResetPassword) => {
  const [resetRecord] = await db
    .select()
    .from(passwordResets)
    .where(
      and(
        eq(passwordResets.token, payload.token),
        eq(passwordResets.used, false)
      )
    )
    .limit(1);

  if (!resetRecord) {
    return { success: false, message: "Invalid or used token" };
  }

  if (resetRecord.expiresAt < new Date()) {
    return { success: false, message: "Token expired" };
  }

  const hashedPassword = await Bun.password.hash(payload.password);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, resetRecord.userId));

  await db
    .update(passwordResets)
    .set({ used: true })
    .where(eq(passwordResets.token, payload.token));

  return { success: true, message: "Password reset successfully" };
};
