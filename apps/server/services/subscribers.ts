import { db } from "@workspace/db";
import { subscribers } from "@workspace/db/schema";
import type { ServiceResponse } from "@workspace/types";
import { and, count, desc, eq } from "drizzle-orm";
import { paginate } from "@/utils/pagination";
import { parse } from "csv-parse/sync";

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_IMPORT_ROWS = 10_000;

export const importSubscribersFromCsv = async (
  projectId: string,
  csvContent: string
): Promise<ServiceResponse> => {
  try {
    let rows: Record<string, string>[];
    try {
      rows = parse(csvContent, {
        columns: (header: string[]) =>
          header.map((h) => h.trim().toLowerCase()),
        skip_empty_lines: true,
        trim: true,
      });
    } catch (parseErr) {
      return {
        success: false,
        message:
          parseErr instanceof Error
            ? `Failed to parse CSV: ${parseErr.message}`
            : "Failed to parse CSV.",
        data: null,
      };
    }

    if (rows.length > MAX_IMPORT_ROWS) {
      return {
        success: false,
        message: `CSV has too many rows (${rows.length}). Max ${MAX_IMPORT_ROWS} per import.`,
        data: null,
      };
    }

    const seen = new Set<string>();
    const validRows: { email: string; name: string | null }[] = [];
    let invalidCount = 0;
    let duplicatesInFile = 0;

    for (const row of rows) {
      const email = row.email?.trim().toLowerCase();
      const name = row.name?.trim() || null;

      if (!email || !EMAIL_REGEX.test(email)) {
        invalidCount++;
        continue;
      }

      if (seen.has(email)) {
        duplicatesInFile++;
        continue;
      }

      seen.add(email);
      validRows.push({ email, name });
    }

    if (validRows.length === 0) {
      return {
        success: false,
        message:
          "No valid subscribers found in CSV. Make sure it has an 'email' column.",
        data: null,
      };
    }

    const inserted = await db
      .insert(subscribers)
      .values(
        validRows.map((row) => ({
          projectId,
          email: row.email,
          name: row.name,
          status: "subscribed" as const,
        }))
      )
      .onConflictDoNothing({
        target: [subscribers.projectId, subscribers.email],
      })
      .returning();

    return {
      success: true,
      message: `Imported ${inserted.length} subscriber${inserted.length === 1 ? "" : "s"}.`,
      data: {
        imported: inserted.length,
        skippedDuplicates:
          validRows.length - inserted.length + duplicatesInFile,
        invalidRows: invalidCount,
        totalRows: rows.length,
      },
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Something went wrong importing subscribers",
      data: null,
    };
  }
};

/**
 * All actively-subscribed emails for a project, unpaginated — for actual
 * sends, not UI listing.
 */
export const getSubscribedEmails = async (
  projectId: string
): Promise<string[]> => {
  const rows = await db
    .select({ email: subscribers.email })
    .from(subscribers)
    .where(
      and(
        eq(subscribers.projectId, projectId),
        eq(subscribers.status, "subscribed")
      )
    );

  return rows.map((r) => r.email);
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
