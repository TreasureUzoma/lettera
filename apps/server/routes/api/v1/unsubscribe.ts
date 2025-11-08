import { envConfig } from "@/config";
import { routeStatus } from "@/lib/utils";
import { sendUnsubscribeCofirmationEmail } from "@/services/mail/internal";
import {
  confirmUnsubscribe,
  getProjectSubscriberExistence,
} from "@/services/subscriptions";
import { validationErrorResponse } from "@/utils/validation-error-response";
import { zValidator } from "@hono/zod-validator";
import {
  isValidToken,
  unsubscribeFromProjectSchema,
} from "@workspace/validations";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";

const unsubscribeRoutes = new Hono();

// unsubsribe req
unsubscribeRoutes.post(
  zValidator("json", unsubscribeFromProjectSchema, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const body = c.req.valid("json");
    const existence = await getProjectSubscriberExistence(body);

    if (existence.success == false) {
      return c.json(existence, 404);
    }

    const token = await sign(
      { projectId: body.projectId, email: body.email, exp: 15 * 60 }, // 15m
      envConfig.UNSUBSCRIBE_SECRET!
    );

    const confirmUrl = `${envConfig.APP_URL}/unsubscribe/confirm?token=${token}`;

    await sendUnsubscribeCofirmationEmail(
      body.email,
      existence.data.projectName,
      confirmUrl
    );

    return c.json({
      success: true,
      message: "Confirmation email sent",
      data: body.email,
    });
  }
);

// confirm unsubscribe
unsubscribeRoutes.get(
  "/unsubscribe/:token",
  zValidator("param", isValidToken, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const { token } = c.req.valid("param");

    const validToken = await verify(token, envConfig.UNSUBSCRIBE_SECRET || "");

    if (!validToken) {
      return c.json(
        {
          data: null,
          message: "Invalid or tampered token",
          success: false,
        },
        401
      );
    }

    const { projectId, email } = validToken as {
      projectId: string;
      email: string;
    };

    if (!projectId || !email) {
      return c.json({ success: false, message: "Invalid token payload" }, 400);
    }

    const serviceData = await confirmUnsubscribe({ projectId, email });
    return c.json(serviceData, routeStatus(serviceData));
  }
);

export default unsubscribeRoutes;
