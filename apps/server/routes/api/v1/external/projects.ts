import { routeStatus } from "@/lib/utils";
import { projectApiKey } from "@/middlewares/project-api-keys";
import { getSubscribers } from "@/services/subscribers";
import { createProjectSubscriber } from "@/services/subscriptions";
import { sendEmailNewsletter } from "@/services/mail/external";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

type ExternalProjectContext = {
  Variables: {
    project: {
      id: string;
      name: string;
      slug: string;
      keyType: "public" | "private";
    };
  };
};

const externalProjectRoutes = new Hono<ExternalProjectContext>().use(
  projectApiKey,
);

externalProjectRoutes.post("/subscriber/new", async (c) => {
  const projectData = c.get("project");
  const { email } = await c.req.json();
  const serviceData = await createProjectSubscriber({
    projectId: projectData.id,
    email,
  });
  return c.json(serviceData, routeStatus(serviceData));
});

externalProjectRoutes.get("/subscribers", async (c) => {
  const projectData = c.get("project");

  if (projectData.keyType !== "private") {
    return c.json(
      { success: false, message: "Unauthorized: Private key required" },
      401,
    );
  }

  const { page, limit } = c.req.query();
  const pageNumber = page ? parseInt(page) : 1;
  const limitNumber = limit ? parseInt(limit) : 10;

  const serviceData = await getSubscribers(
    projectData.id,
    pageNumber,
    limitNumber,
  );
  return c.json(serviceData, routeStatus(serviceData));
});

// Send newsletter via API
externalProjectRoutes.post(
  "/newsletters/send",
  zValidator(
    "json",
    z.object({
      subject: z.string().min(1, "Subject is required"),
      content: z.string().min(1, "Content is required"),
      recipientEmails: z
        .array(z.string().email())
        .min(1, "At least one recipient is required")
        .optional(),
      segmentIds: z.array(z.string()).optional(),
    }),
  ),
  async (c) => {
    try {
      const projectData = c.get("project");

      // Require private key for sending
      if (projectData.keyType !== "private") {
        return c.json(
          { success: false, message: "Unauthorized: Private key required" },
          401,
        );
      }

      const { subject, content, recipientEmails, segmentIds } =
        c.req.valid("json");

      let recipients = recipientEmails || [];

      // If segmentIds provided, fetch subscribers from segments
      if (segmentIds && segmentIds.length > 0) {
        const { getSegmentSubscribers } = await import("@/services/segments");

        const segmentEmails: Set<string> = new Set();

        for (const segmentId of segmentIds) {
          const result = await getSegmentSubscribers(segmentId, projectData.id);
          if (result.success && Array.isArray(result.data)) {
            result.data.forEach((subscriber: { email: string }) =>
              segmentEmails.add(subscriber.email)
            );
          }
        }

        recipients = Array.from(segmentEmails);
      }

      if (recipients.length === 0) {
        return c.json(
          { success: false, message: "No recipients specified" },
          400,
        );
      }

      // Convert markdown content to HTML (basic support)
      // TODO: Add proper markdown to HTML conversion
      const htmlContent = content
        .split("\n")
        .map((line: string) => {
          if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`;
          if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
          if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
          if (line.trim() === "") return "<br/>";
          return `<p>${line}</p>`;
        })
        .join("");

      const result = await sendEmailNewsletter(
        projectData.slug,
        recipients,
        subject,
        htmlContent,
      );

      return c.json(
        {
          success: true,
          message: "Newsletter sent successfully",
          data: result,
        },
        200,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send newsletter";

      return c.json(
        {
          success: false,
          message,
        },
        500,
      );
    }
  },
);

export default externalProjectRoutes;
