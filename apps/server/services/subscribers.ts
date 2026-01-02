import { db } from "@workspace/db";
import { subscribers } from "@workspace/db/schema";
import type { ServiceResponse } from "@workspace/types";
import { and, count, desc, eq } from "drizzle-orm";
import { paginate } from "@/utils/pagination";

export const getSubscribers = async (
  projectId: string,
  page = 1,
  limit = 10
): Promise<ServiceResponse> => {
  try {
    const offset = (page - 1) * limit;

    const dbQuery = db
      .select()
      .from(subscribers)
      .where(eq(subscribers.projectId, projectId))
      .orderBy(desc(subscribers.createdAt))
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ count: count() })
      .from(subscribers)
      .where(eq(subscribers.projectId, projectId));

    const paginatedData = await paginate(dbQuery, countQuery, page, limit);

    return {
      success: true,
      message: "Fetched subscribers successfully",
      data: paginatedData,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Something went wrong fetching subscribers",
      data: null,
    };
  }
};

export const createSubscriber = async (
  projectId: string,
  email: string,
  name?: string
): Promise<ServiceResponse> => {
  try {
    const [existingSubscriber] = await db
      .select()
      .from(subscribers)
      .where(
        and(eq(subscribers.projectId, projectId), eq(subscribers.email, email))
      );

    if (existingSubscriber) {
      return {
        success: false,
        message: "Subscriber with this email already exists in the project",
        data: null,
      };
    }

    const [newSubscriber] = await db
      .insert(subscribers)
      .values({
        projectId,
        email,
        name,
        status: "subscribed",
      })
      .returning();

    return {
      success: true,
      message: "Subscriber created successfully",
      data: newSubscriber,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Something went wrong creating subscriber",
      data: null,
    };
  }
};

export const deleteSubscriber = async (
  projectId: string,
  subscriberId: string
): Promise<ServiceResponse> => {
  try {
    const [deletedSubscriber] = await db
      .delete(subscribers)
      .where(
        and(
          eq(subscribers.projectId, projectId),
          eq(subscribers.id, subscriberId)
        )
      )
      .returning();

    if (!deletedSubscriber) {
      return {
        success: false,
        message: "Subscriber not found",
        data: null,
      };
    }

    return {
      success: true,
      message: "Subscriber deleted successfully",
      data: deletedSubscriber,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Something went wrong deleting subscriber",
      data: null,
    };
  }
};
