import { routeStatus } from "@/lib/utils";
import {
  createProjectPostDraft,
  getAllProjectPosts,
  updateProjectPost,
} from "@/services/posts";
import { getProjectOrFail } from "@/utils/project-access";
import { validationErrorResponse } from "@/utils/validation-error-response";
import { zValidator } from "@hono/zod-validator";
import { insertPostSchema, isValidUUID } from "@workspace/validations";
import { Hono } from "hono";

const postRoutes = new Hono();

// create project as draft
postRoutes.post(
  "/",
  zValidator("json", insertPostSchema, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const body = c.req.valid("json");

    const project = await getProjectOrFail(c, body.projectId, [
      "admin",
      "owner",
    ]);
    if (!project) return;

    const serviceData = await createProjectPostDraft(body);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// update project status, if status published, it sends
postRoutes.patch(
  "/:id",
  zValidator("param", isValidUUID, (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  zValidator("json", insertPostSchema, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const body = c.req.valid("json");
    const { id: postId } = c.req.valid("param");

    const project = await getProjectOrFail(c, body.projectId, [
      "admin",
      "owner",
      "editor",
    ]);
    if (!project) return;

    const serviceData = await updateProjectPost(postId, body);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// get all posts in  a projct
postRoutes.get(
  "/id",
  zValidator("param", isValidUUID, (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");

    await getProjectOrFail(c, projectId, [
      "admin",
      "owner",
      "viewer",
      "editor",
    ]);

    const serviceData = await getAllProjectPosts(projectId);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

export default postRoutes;
