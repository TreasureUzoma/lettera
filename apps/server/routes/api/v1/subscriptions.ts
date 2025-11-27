import { routeStatus } from "@/lib/utils";
import {
  createProjectSubscriber,
  getProjectSubscribers,
  getRecentSubscribers,
  removeProjectSubscriber,
} from "@/services/subscriptions";
import { getProjectOrFail } from "@/utils/project-access";
import { validationErrorResponse } from "@/utils/validation-error-response";
import { zValidator } from "@hono/zod-validator";
import {
  createProjectSubscriberSchema,
  isValidUUID,
} from "@workspace/validations";
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

    const project = await getProjectOrFail(c, projectId, [
      "owner",
      "admin",
      "editor",
      "viewer",
    ]);
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

subscriptionRoutes.get(
  "/:id/recent",
  zValidator("param", isValidUUID, (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");


    const project = await getProjectOrFail(c, projectId, [
      "owner",
      "admin",
      "editor",
      "viewer",
    ]);
    if (!project) return;

    const subscribers = await getRecentSubscribers(projectId);

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

// create subscriber (internal)
subscriptionRoutes.post(
  "/",
  zValidator("json", createProjectSubscriberSchema, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const body = c.req.valid("json");
    const project = await getProjectOrFail(c, body.projectId, [
      "owner",
      "admin",
    ]);
    if (!project) return;
    const serviceData = await createProjectSubscriber(body);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

subscriptionRoutes.post(
  "/delete",
  zValidator("json", createProjectSubscriberSchema, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const body = c.req.valid("json");
    const project = await getProjectOrFail(c, body.projectId, [
      "owner",
      "admin",
    ]);
    if (!project) return;
    const serviceData = await removeProjectSubscriber(
      body.projectId,
      body.email
    );

    if (serviceData.success == false) {
      return c.json(serviceData, 400);
    }
    return c.json(serviceData, 200);
  }
);

export default subscriptionRoutes;
