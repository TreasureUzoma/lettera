import { routeStatus } from "@/lib/utils";
import { getProjectOrFail } from "@/utils/project-access";
import { validationErrorResponse } from "@/utils/validation-error-response";
import {
  createSegment,
  getSegments,
  getSegment,
  updateSegment,
  deleteSegment,
  getSegmentSubscribers,
  addSubscriberToSegment,
  removeSubscriberFromSegment,
} from "@/services/segments";
import type { AppBindings } from "@/types";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const segmentRoutes = new Hono<AppBindings>();

// Get all segments for a project
segmentRoutes.get(
  "/:projectId",
  zValidator(
    "param",
    z.object({ projectId: z.string().min(1) }),
    (result, c) => {
      if (!result.success) return validationErrorResponse(c, result.error);
    },
  ),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await getSegments(project.id);
    return c.json(serviceData, routeStatus(serviceData));
  },
);

// Create a new segment
segmentRoutes.post(
  "/:projectId",
  zValidator(
    "param",
    z.object({ projectId: z.string().min(1) }),
    (result, c) => {
      if (!result.success) return validationErrorResponse(c, result.error);
    },
  ),
  zValidator(
    "json",
    z.object({
      name: z.string().min(1, "Name is required"),
      description: z.string().optional(),
      criteria: z.record(z.unknown()).optional(),
    }),
    (result, c) => {
      if (!result.success) return validationErrorResponse(c, result.error);
    },
  ),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const { name, description, criteria } = c.req.valid("json");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await createSegment(
      project.id,
      name,
      description,
      criteria,
    );

    return c.json(serviceData, routeStatus(serviceData));
  },
);

// Get a single segment
segmentRoutes.get(
  "/:projectId/:segmentId",
  zValidator(
    "param",
    z.object({
      projectId: z.string().min(1),
      segmentId: z.string().uuid(),
    }),
    (result, c) => {
      if (!result.success) return validationErrorResponse(c, result.error);
    },
  ),
  async (c) => {
    const { projectId, segmentId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await getSegment(segmentId, project.id);
    return c.json(serviceData, routeStatus(serviceData));
  },
);

// Update a segment
segmentRoutes.patch(
  "/:projectId/:segmentId",
  zValidator(
    "param",
    z.object({
      projectId: z.string().min(1),
      segmentId: z.string().uuid(),
    }),
    (result, c) => {
      if (!result.success) return validationErrorResponse(c, result.error);
    },
  ),
  zValidator(
    "json",
    z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      criteria: z.record(z.unknown()).optional(),
    }),
    (result, c) => {
      if (!result.success) return validationErrorResponse(c, result.error);
    },
  ),
  async (c) => {
    const { projectId, segmentId } = c.req.valid("param");
    const updates = c.req.valid("json");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await updateSegment(segmentId, project.id, updates);
    return c.json(serviceData, routeStatus(serviceData));
  },
);

// Delete segment
segmentRoutes.delete(
  "/:projectId/:segmentId",
  zValidator(
    "param",
    z.object({
      projectId: z.string().min(1),
      segmentId: z.string().uuid(),
    }),
    (result, c) => {
      if (!result.success) return validationErrorResponse(c, result.error);
    },
  ),
  async (c) => {
    const { projectId, segmentId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await deleteSegment(segmentId, project.id);
    return c.json(serviceData, routeStatus(serviceData));
  },
);

// Get subscribers in a segment
segmentRoutes.get(
  "/:projectId/:segmentId/subscribers",
  zValidator(
    "param",
    z.object({
      projectId: z.string().min(1),
      segmentId: z.string().uuid(),
    }),
    (result, c) => {
      if (!result.success) return validationErrorResponse(c, result.error);
    },
  ),
  async (c) => {
    const { projectId, segmentId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await getSegmentSubscribers(segmentId, project.id);
    return c.json(serviceData, routeStatus(serviceData));
  },
);

// Add subscriber to segment
segmentRoutes.post(
  "/:projectId/:segmentId/subscribers/:subscriberId",
  zValidator(
    "param",
    z.object({
      projectId: z.string().min(1),
      segmentId: z.string().uuid(),
      subscriberId: z.string().uuid(),
    }),
    (result, c) => {
      if (!result.success) return validationErrorResponse(c, result.error);
    },
  ),
  async (c) => {
    const { projectId, segmentId, subscriberId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await addSubscriberToSegment(
      segmentId,
      subscriberId,
      project.id,
    );

    return c.json(serviceData, routeStatus(serviceData));
  },
);

// Remove subscriber from segment
segmentRoutes.delete(
  "/:projectId/:segmentId/subscribers/:subscriberId",
  zValidator(
    "param",
    z.object({
      projectId: z.string().min(1),
      segmentId: z.string().uuid(),
      subscriberId: z.string().uuid(),
    }),
    (result, c) => {
      if (!result.success) return validationErrorResponse(c, result.error);
    },
  ),
  async (c) => {
    const { projectId, segmentId, subscriberId } = c.req.valid("param");
    const projectOrRes = await getProjectOrFail(c, projectId);
    if (projectOrRes instanceof Response) return projectOrRes;
    const project = projectOrRes;

    const serviceData = await removeSubscriberFromSegment(
      segmentId,
      subscriberId,
      project.id,
    );

    return c.json(serviceData, routeStatus(serviceData));
  },
);

export default segmentRoutes;
