import { db } from "@workspace/db";
import { projects, subscribers } from "@workspace/db/schema";
import { eq, count, and } from "drizzle-orm";
import { paginate } from "../utils/pagination";
import type { UnsubscribeRequest } from "@workspace/validations";
import type { ServiceResponse } from "@workspace/types";
import { success } from "zod/v4";

export const getProjectSubscribers = (
  projectId: string,
  page = 1,
  limit = 10
) => {
  const offset = (page - 1) * limit;

  const subscribersData = db
    .select()
    .from(subscribers)
    .where(eq(subscribers.projectId, projectId))
    .limit(limit)
    .offset(offset);

  const countResult = db
    .select({ count: count() })
    .from(subscribers)
    .where(eq(subscribers.projectId, projectId));

  return paginate(subscribersData, countResult, page, limit);
};

export const getProjectSubscriberExistence = async (
  body: UnsubscribeRequest
): Promise<ServiceResponse> => {
  const { projectId, email } = body;
  const [subscriber] = await db
    .select()
    .from(subscribers)
    .where(
      and(eq(subscribers.projectId, projectId), eq(subscribers.email, email))
    );

  if (!subscriber)
    return {
      message: "Subscriber not found",
      success: true,
      data: null,
    };

  const [project] = await db
    .select({ name: projects.name })
    .from(projects)
    .where(eq(projects.id, projectId));

  return {
    message: "Subscriber found",
    success: true,
    data: {
      projectName: project?.name ?? null,
    },
  };
};

export const confirmUnsubscribe = async (body: UnsubscribeRequest) => {
  try {
    const unsubscribe = await db
      .update(subscribers)
      .set({ status: "unsubscribed" })
      .where(
        and(
          eq(subscribers.projectId, body.projectId),
          eq(subscribers.email, body.email)
        )
      );

    const [project] = await db
      .select({ name: projects.name })
      .from(projects)
      .where(eq(projects.id, body.projectId));

    return {
      success: true,
      data: {
        projectName: project?.name ?? null,
      },
      message: "Subscribed sucessfully",
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      message:
        err instanceof Error
          ? err.message
          : "Failed to unsubscribe from project.",
    };
  }
};
