import {
  acceptProjectInvite,
  createProject,
  deleteProject,
  getProjectApiKeys,
  getProjectsByUser,
  getProjectBySlug,
  getUserProjectInvites,
  inviteUserToProject,
  updateProject,
  updateProjectMemberRole,
  getProjectMembers,
  generateAndCreateProjectApiKey,
  deleteProjectApiKey,
} from "@/services/projects";
import {
  getSubscribers,
  createSubscriber,
  deleteSubscriber,
} from "@/services/subscribers";
import {
  getEmails,
  createEmail,
  deleteEmail,
  updateEmail,
} from "@/services/emails";
import { z } from "zod";
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
  zValidator("param", z.object({ id: z.string().min(1) }), (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId, [
      "owner",
      "admin",
    ]);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const deleteService = await deleteProject(project.id);
    return c.json(deleteService, routeStatus(deleteService));
  }
);

// get a project api key
projectsRoute.get(
  "/api/:id",
  zValidator("param", z.object({ id: z.string().min(1) }), (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId, [
      "owner",
      "admin",
    ]);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await getProjectApiKeys(project.id);

    return c.json(serviceData, routeStatus(serviceData));
  }
);

// create a project api key
projectsRoute.post(
  "/api/:id",
  zValidator("param", z.object({ id: z.string().min(1) }), (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId, [
      "owner",
      "admin",
    ]);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await generateAndCreateProjectApiKey(project.id);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// delete a project api key
projectsRoute.delete(
  "/api/:id/:keyId",
  zValidator(
    "param",
    z.object({ id: z.string().min(1), keyId: z.string().uuid() }),
    (result, c) => {
      if (!result.success) return validationErrorResponse(c, result.error);
    }
  ),
  async (c) => {
    const { id: projectId, keyId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId, [
      "owner",
      "admin",
    ]);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await deleteProjectApiKey(project.id, keyId);
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
  zValidator("param", z.object({ id: z.string().min(1) }), (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const body = c.req.valid("json");
    const projectOrRes = await getProjectOrFail(c, projectId, [
      "owner",
      "admin",
    ]);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;
    const serviceData = await updateProject(project.id, body);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// get a project by slug
projectsRoute.get(
  "/slug/:slug",
  zValidator(
    "param",
    z.object({ slug: z.string().min(3).max(30) }),
    (result, c) => {
      if (!result.success) {
        return validationErrorResponse(c, result.error);
      }
    }
  ),
  async (c) => {
    const { slug } = c.req.valid("param");
    const serviceData = await getProjectBySlug(slug);

    if (!serviceData.success) {
      return c.json(serviceData, 404);
    }

    return c.json({ project: serviceData.data }, 200);
  }
);

// get a project
projectsRoute.get(
  "/:id",
  zValidator("param", z.object({ id: z.string().min(1) }), (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;
    return c.json({ project }, 200);
  }
);

// get project members
projectsRoute.get(
  "/:id/members",
  zValidator("param", z.object({ id: z.string().min(1) }), (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await getProjectMembers(project.id);
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
    const projectOrRes = await getProjectOrFail(c, body.projectId, [
      "owner",
      "admin",
    ]);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await updateProjectMemberRole(
      project.id,
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
    const projectOrRes = await getProjectOrFail(c, body.projectId, [
      "owner",
      "admin",
    ]);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await inviteUserToProject(
      project.id,
      body.invitedByUserId,
      body.invitedToUserId,
      body.role
    );
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// get project subscribers
projectsRoute.get(
  "/:id/subscribers",
  zValidator("param", z.object({ id: z.string().min(1) }), (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await getSubscribers(project.id);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// create subscriber
projectsRoute.post(
  "/:id/subscribers",
  zValidator("param", z.object({ id: z.string().min(1) }), (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  zValidator(
    "json",
    z.object({ email: z.string().email(), name: z.string().optional() }),
    (result, c) => {
      if (!result.success) {
        return validationErrorResponse(c, result.error);
      }
    }
  ),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const { email, name } = c.req.valid("json");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await createSubscriber(project.id, email, name);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// delete subscriber
projectsRoute.delete(
  "/:id/subscribers/:subscriberId",
  zValidator(
    "param",
    z.object({ id: z.string().min(1), subscriberId: z.string().uuid() }),
    (result, c) => {
      if (!result.success) {
        return validationErrorResponse(c, result.error);
      }
    }
  ),
  async (c) => {
    const { id: projectId, subscriberId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await deleteSubscriber(project.id, subscriberId);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// get project emails
projectsRoute.get(
  "/:id/emails",
  zValidator("param", z.object({ id: z.string().min(1) }), (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await getEmails(project.id);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// create email
projectsRoute.post(
  "/:id/emails",
  zValidator("param", z.object({ id: z.string().min(1) }), (result, c) => {
    if (!result.success) {
      return validationErrorResponse(c, result.error);
    }
  }),
  zValidator(
    "json",
    z.object({ subject: z.string().min(1), body: z.string().min(1) }),
    (result, c) => {
      if (!result.success) {
        return validationErrorResponse(c, result.error);
      }
    }
  ),
  async (c) => {
    const { id: projectId } = c.req.valid("param");
    const { subject, body } = c.req.valid("json");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await createEmail(project.id, subject, body);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// update email
projectsRoute.patch(
  "/:id/emails/:emailId",
  zValidator(
    "param",
    z.object({ id: z.string().min(1), emailId: z.string().uuid() }),
    (result, c) => {
      if (!result.success) {
        return validationErrorResponse(c, result.error);
      }
    }
  ),
  zValidator(
    "json",
    z.object({
      subject: z.string().min(1).optional(),
      body: z.string().min(1).optional(),
      status: z.enum(["published", "draft"]).optional(),
    }),
    (result, c) => {
      if (!result.success) {
        return validationErrorResponse(c, result.error);
      }
    }
  ),
  async (c) => {
    const { id: projectId, emailId } = c.req.valid("param");
    const { subject, body, status } = c.req.valid("json");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await updateEmail(
      project.id,
      emailId,
      subject,
      body,
      status
    );
    return c.json(serviceData, routeStatus(serviceData));
  }
);

// delete email
projectsRoute.delete(
  "/:id/emails/:emailId",
  zValidator(
    "param",
    z.object({ id: z.string().min(1), emailId: z.string().uuid() }),
    (result, c) => {
      if (!result.success) {
        return validationErrorResponse(c, result.error);
      }
    }
  ),
  async (c) => {
    const { id: projectId, emailId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await deleteEmail(project.id, emailId);
    return c.json(serviceData, routeStatus(serviceData));
  }
);

export default projectsRoute;
