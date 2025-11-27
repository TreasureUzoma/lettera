import { db } from "@workspace/db";
import { projects, subscribers } from "@workspace/db/schema";
import { eq, count, and, desc } from "drizzle-orm";
import { paginate } from "../utils/pagination";
import type {
  CreateSubscriber,
  UnsubscribeRequest,
} from "@workspace/validations";
import type { ServiceResponse, SubscriberStatus } from "@workspace/types";

export const getProjectSubscribers = (
  projectId: string,
  page = 1,
  limit = 10,
  status: SubscriberStatus = "subscribed"
) => {
  const offset = (page - 1) * limit;

  const subscribersData = db
    .select()
    .from(subscribers)
    .where(
      and(eq(subscribers.projectId, projectId), eq(subscribers.status, status))
    )
    .limit(limit)
    .offset(offset);

  const countResult = db
    .select({ count: count() })
    .from(subscribers)
    .where(eq(subscribers.projectId, projectId));

  return paginate(subscribersData, countResult, page, limit);
};

export const createProjectSubscriber = async (body: CreateSubscriber) => {
  try {
    const subscriber = await db
      .insert(subscribers)
      .values({
        name: body?.name ?? null,
        email: body.email,
        projectId: body.projectId,
      })
      .returning();

    return {
      success: true,
      data: subscriber,
      message: "Created subscriber successfully.",
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      message:
        err instanceof Error ? err.message : "Failed to create subscriber.",
    };
  }
};

export const removeProjectSubscriber = async (
  projectId: string,
  email: string
) => {
  try {
    await db
      .delete(subscribers)
      .where(
        and(eq(subscribers.projectId, projectId), eq(subscribers.email, email))
      );

    return {
      data: null,
      message: `Removed subscriber (${email}).`,
      success: true,
    };
  } catch (err) {
    return {
      data: null,
      message: "Failed to remove subscriber",
      success: true,
    };
  }
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

export const getRecentSubscribers = async (projectId: string, limit = 5) => {
  try {
    const recentSubscribers = await db
      .select({
        id: subscribers.id,
        email: subscribers.email,
        name: subscribers.name,
        status: subscribers.status,
        createdAt: subscribers.createdAt,
      })
      .from(subscribers)
      .where(eq(subscribers.projectId, projectId))
      .orderBy(desc(subscribers.createdAt))
      .limit(limit);

    return {
      success: true,
      data: recentSubscribers,
      message: "Fetched recent subscribers successfully",
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      message:
        err instanceof Error
          ? err.message
          : "Something went wrong fetching recent subscribers",
    };
  }
};
