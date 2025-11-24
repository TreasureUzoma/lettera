import { db } from "@workspace/db";
import {
  emails,
  payments,
  projectMembers,
  projects,
  subscribers,
} from "@workspace/db/schema";
import type { ServiceResponse } from "@workspace/types";
import type { DashboardOverview } from "@workspace/validations";
import { paginate } from "@/utils/pagination";
import { and, asc, count, desc, eq, inArray, sql, sum } from "drizzle-orm";

export const getDashboardOverview = async (
  userId: string,
  page = 1,
  limit = 10,
  sort: DashboardOverview["sort"] = "newest"
): Promise<ServiceResponse> => {
  try {
    // 1. Get all project IDs for the user to aggregate stats
    const userProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId));

    const projectIds = userProjects.map((p) => p.id);

    // 2. Calculate Stats
    let totalProjects = projectIds.length;
    let totalSubscribers = 0;
    let totalRevenue = 0;
    let totalPosts = 0;

    if (projectIds.length > 0) {
      const [subStats] = await db
        .select({ count: count() })
        .from(subscribers)
        .where(inArray(subscribers.projectId, projectIds));
      totalSubscribers = subStats?.count ?? 0;

      const [revStats] = await db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .where(inArray(payments.projectId, projectIds));
      totalRevenue = revStats?.total ? parseInt(revStats.total) : 0;

      const [postStats] = await db
        .select({ count: count() })
        .from(emails)
        .where(inArray(emails.projectId, projectIds));
      totalPosts = postStats?.count ?? 0;
    }

    // 3. Fetch Projects with Sorting
    const offset = (page - 1) * limit;

    let orderBy;
    switch (sort) {
      case "name":
        orderBy = asc(projects.name);
        break;
      case "oldest":
        orderBy = asc(projects.createdAt);
        break;
      case "newest":
      case "activity": // Assuming activity means recently updated/created for now
      default:
        orderBy = desc(projects.createdAt);
        break;
      // Note: Sorting by revenue or subscribers would require complex joins/subqueries
      // For now, we'll fallback to createdAt for these complex sorts or implement them if strictly needed
      // implementing simple ones first.
    }

    const dbQuery = db
      .select({
        id: projects.id,
        name: projects.name,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        role: projectMembers.role,
        // We could join to get counts per project here if needed for the list
      })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ count: count() })
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId));

    const projectsData = await paginate(dbQuery, countQuery, page, limit);

    return {
      success: true,
      message: "Dashboard overview fetched successfully",
      data: {
        stats: {
          totalProjects,
          totalSubscribers,
          totalRevenue,
          totalPosts,
        },
        projects: projectsData,
      },
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Something went wrong fetching dashboard overview",
      data: null,
    };
  }
};
