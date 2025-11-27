import {
  acceptProjectInvite,
  createProject,
  deleteProject,
  getProjectApiKeys,
  getProjectsByUser,
  getUserProjectInvites,
  inviteUserToProject,
  updateProject,
  updateProjectMemberRole,
  getProjectMembers,
} from "@/services/projects";
import type { AppBindings, AuthType } from "@/types";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  acceptProjectInviteSchema,
  createProjectSchema,
  inviteUserToProjectSchema,
  isValidUUID,
  updateProjectMemberRoleSchema,
  updateProjectSchema,
} from "@workspace/validations";
import { routeStatus } from "@/lib/utils";
import { validationErrorResponse } from "@/utils/validation-error-response";
import { getProjectOrFail } from "@/utils/project-access";

const projectsRoute = new Hono<AppBindings>();

// delete a project
projectsRoute.delete(
  "/:id",
  zValidator("param", isValidUUID, (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const project = await getProjectOrFail(c, projectId, ["owner", "admin"]);
    if (!project) return; // helper already sent response

    const deleteService = await deleteProject(projectId);
    return c.json(deleteService, routeStatus(deleteService));
  }
);

// get a project api key
projectsRoute.get(
  "/api/:id",
  zValidator("param", isValidUUID, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const project = await getProjectOrFail(c, projectId, ["owner", "admin"]);
    if (!project) return;

    const serviceData = await getProjectApiKeys(projectId);

    return c.json(serviceData, routeStatus(serviceData));
  }
);

// create a project
projectsRoute.post(
  "/new",
  zValidator("json", createProjectSchema, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const cookieUser = c.get("user") as AuthType;
    const body = c.req.valid("json");
    const serviceData = await createProject(body, cookieUser.id);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// update a project
projectsRoute.patch(
  "/:id",
  zValidator("json", updateProjectSchema, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  zValidator("param", isValidUUID, (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const body = c.req.valid("json");
    const project = await getProjectOrFail(c, projectId, ["owner", "admin"]);
    if (!project) return;
    const serviceData = await updateProject(projectId, body);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// get a project
projectsRoute.get(
  "/:id",
  zValidator("param", isValidUUID, (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const project = await getProjectOrFail(c, projectId);
    if (!project) return;
    return c.json({ project }, 200);
  }
);

// get project members
projectsRoute.get(
  "/:id/members",
  zValidator("param", isValidUUID, (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const project = await getProjectOrFail(c, projectId);
    if (!project) return;

    const serviceData = await getProjectMembers(projectId);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// get all projects
projectsRoute.get("/", async (c) => {
  const { page, limit } = c.req.query();
  const cookieUser = c.get("user") as AuthType;

  const pageNumber = page ? parseInt(page) : undefined;
  const limitNumber = limit ? parseInt(limit) : undefined;

  const project = await getProjectsByUser(
    cookieUser.id,
    pageNumber,
    limitNumber
  );

  return c.json(
    {
      data: project,
      success: true,
      message: "Fetched all projects successfully",
    },
    200
  );
});

// project roles

// update project roles
projectsRoute.patch(
  "/roles/:id",
  zValidator("json", updateProjectMemberRoleSchema, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const body = c.req.valid("json");
    await getProjectOrFail(c, body.projectId, ["owner", "admin"]);

    const serviceData = await updateProjectMemberRole(
      body.projectId,
      body.targetUserId,
      body.role
    );
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// accept role invite
projectsRoute.post(
  "/roles/accept",
  zValidator("json", acceptProjectInviteSchema, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const body = c.req.valid("json");
    const serviceData = await acceptProjectInvite(
      body.inviteId,
      body.acceptingUserId
    );
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// get all user roles
projectsRoute.get("/roles", async (c) => {
  const cookieUser = c.get("user") as AuthType;
  const serviceData = await getUserProjectInvites(cookieUser.id);
  return c.json(serviceData, routeStatus(serviceData));
});

//
projectsRoute.post(
  "/roles/new",
  zValidator("json", inviteUserToProjectSchema, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const body = c.req.valid("json");
    const serviceData = await inviteUserToProject(
      body.projectId,
      body.invitedByUserId,
      body.invitedToUserId,
      body.role
    );
    return c.json(serviceData, routeStatus(serviceData));
  }
);

export default projectsRoute;
