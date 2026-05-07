import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppBindings, AuthType } from "@/types";
import { sendEmailNewsletter } from "@/services/mail/external";
import { getProjectOrFail } from "@/utils/project-access";
import { validationErrorResponse } from "@/utils/validation-error-response";
import { routeStatus } from "@/lib/utils";

const emailsRoute = new Hono<AppBindings>();

// Send newsletter to subscribers
emailsRoute.post(
  "/:projectId/send",
  zValidator(
    "param",
    z.object({ projectId: z.string().min(1) }),
    (result, c) => {
      if (!result.success) {
        return validationErrorResponse(c, result.error);
      }
    }
  ),
  zValidator(
    "json",
    z.object({
      subject: z.string().min(1, "Subject is required"),
      html: z.string().min(1, "Email content is required"),
      recipientEmails: z
        .array(z.string().email())
        .min(1, "At least one recipient is required"),
      replyTo: z.string().email().optional(),
    }),
    (result, c) => {
      if (!result.success) {
        return validationErrorResponse(c, result.error);
      }
    }
  ),
  async (c) => {
    try {
      const auth = c.get("auth") as AuthType;
      const { projectId } = c.req.valid("param");
      const { subject, html, recipientEmails, replyTo } = c.req.valid("json");

      // Verify user has access to this project
      const project = await getProjectOrFail(projectId, auth.userId);

      // Send newsletter
      const result = await sendEmailNewsletter(
        project.slug,
        recipientEmails,
        subject,
        html,
        replyTo
      );

      return c.json(
        {
          success: true,
          message: "Newsletter sent successfully",
          data: result,
        },
        routeStatus.success
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send newsletter";

      return c.json(
        {
          success: false,
          message,
        },
        routeStatus.error
      );
    }
  }
);

// Send test email
emailsRoute.post(
  "/:projectId/test",
  zValidator(
    "param",
    z.object({ projectId: z.string().min(1) }),
    (result, c) => {
      if (!result.success) {
        return validationErrorResponse(c, result.error);
      }
    }
  ),
  zValidator(
    "json",
    z.object({
      testEmail: z.string().email("Invalid email address"),
      subject: z.string().min(1, "Subject is required"),
      html: z.string().min(1, "Email content is required"),
    }),
    (result, c) => {
      if (!result.success) {
        return validationErrorResponse(c, result.error);
      }
    }
  ),
  async (c) => {
    try {
      const auth = c.get("auth") as AuthType;
      const { projectId } = c.req.valid("param");
      const { testEmail, subject, html } = c.req.valid("json");

      // Verify user has access to this project
      const project = await getProjectOrFail(projectId, auth.userId);

      // Send test email
      const result = await sendEmailNewsletter(
        project.slug,
        [testEmail],
        subject,
        html
      );

      return c.json(
        {
          success: true,
          message: "Test email sent successfully",
          data: result,
        },
        routeStatus.success
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send test email";

      return c.json(
        {
          success: false,
          message,
        },
        routeStatus.error
      );
    }
  }
);

export default emailsRoute;
