import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createOauthUserSchema,
  loginSchema,
  createAccountSchema,
  verifyResetPasswordSchema,
} from "@workspace/validations";
import {
  login,
  createOauthUser,
  signup,
  deleteAuthRefreshToken,
  forgotPassword,
  verifyResetPassword,
} from "@/services/auth";
import { getSignedCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { envConfig } from "@/config";
import {
  generateTokens,
  storeRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "@/utils/auth-tokens";
import type { Context } from "hono";
import type { ServiceResponse } from "@workspace/types";
import { z } from "zod";
import { validationErrorResponse } from "@/utils/validation-error-response";

const authRoute = new Hono();

const handleAuth = async (
  c: Context,
  serviceData: ServiceResponse<{ id: string; email: string; name?: string }>
) => {
  if (!serviceData.success || !serviceData.data?.id) {
    return c.json(
      {
        success: false,
        message: serviceData.message || "Authentication failed",
      },
      401
    );
  }

  const { id, email, name } = serviceData.data;
  const userAgent = c.req.header("User-Agent") || "unknown";

  const { accessToken, refreshToken, refreshExpDate } = await generateTokens(
    id,
    email,
    name || "-"
  );

  await storeRefreshToken(id, refreshToken, refreshExpDate, userAgent);
  await setAuthCookies(c, accessToken, refreshToken);

  return c.json(
    {
      message: "Authentication successful",
      data: serviceData.data,
      success: true,
    },
    201
  );
};

// login
authRoute.post(
  "/login",
  zValidator("json", loginSchema, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const body = c.req.valid("json");
    const serviceData = await login(body);
    return handleAuth(c, serviceData);
  }
);

// signup
authRoute.post(
  "/signup",
  zValidator("json", createAccountSchema, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const body = c.req.valid("json");
    const serviceData = await signup(body);
    return handleAuth(c, serviceData);
  }
);

// github oauth
authRoute.post(
  "/github",
  zValidator("json", createOauthUserSchema),
  async (c) => {
    const body = c.req.valid("json");
    const serviceData = await createOauthUser(body);
    return handleAuth(c, serviceData);
  }
);

// google oauth
authRoute.post(
  "/google",
  zValidator("json", createOauthUserSchema),
  async (c) => {
    const body = c.req.valid("json");
    const serviceData = await createOauthUser(body);
    return handleAuth(c, serviceData);
  }
);

// logout
authRoute.post("/logout", async (c) => {
  const refreshToken = await getSignedCookie(
    c,
    envConfig.JWT_REFRESH_SECRET,
    "letteraRefreshToken"
  );

  if (refreshToken) {
    try {
      const decoded = (await verify(
        refreshToken,
        envConfig.JWT_REFRESH_SECRET!
      )) as { id: string };
      if (decoded.id) await deleteAuthRefreshToken(decoded.id);
    } catch {
      console.warn("Invalid or expired refresh token during logout");
    }
  }

  await clearAuthCookies(c);
  return c.json({ message: "Logout successful", success: true }, 200);
});

// forgot pwd
authRoute.post(
  "/forgotten-password",
  zValidator("json", z.string().email(), (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const body = c.req.valid("json");
    const serviceData = await forgotPassword(body);
    return c.json(serviceData, 200);
  }
);

// reset password
authRoute.post(
  "/reset-password",
  zValidator("json", verifyResetPasswordSchema, (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  async (c) => {
    const body = c.req.valid("json");
    const serviceData = await verifyResetPassword(body);

    if (!serviceData.success) {
      return c.json(serviceData, 400);
    }

    return c.json(serviceData, 200);
  }
);

export default authRoute;
