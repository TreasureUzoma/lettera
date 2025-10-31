import { getProjectSubscribers } from "@/services/subscriptions";
import { getProjectOrFail } from "@/utils/project-access";
import { validationErrorResponse } from "@/utils/validation-error-response";
import { zValidator } from "@hono/zod-validator";
import { isValidUUID } from "@workspace/validations";
import { Hono } from "hono";

const subscriptionRoutes = new Hono();

// get all subscribers from a project
subscriptionRoutes.get(
  "/:id",
  zValidator("param", isValidUUID, (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");

    const { page, limit } = c.req.query();
    const pageNumber = page ? parseInt(page) : undefined;
    const limitNumber = limit ? parseInt(limit) : undefined;

    const project = await getProjectOrFail(c, projectId);
    if (!project) return;

    const subscribers = await getProjectSubscribers(
      projectId,
      pageNumber,
      limitNumber
    );

    return c.json(
      {
        data: subscribers,
        success: true,
        message: "Fetched project subscribers successfully",
      },
      200
    );
  }
);

export default subscriptionRoutes;
