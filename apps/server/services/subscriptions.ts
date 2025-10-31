import { db } from "@workspace/db";
import { subscribers } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";
import { paginate } from "../utils/pagination";

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
