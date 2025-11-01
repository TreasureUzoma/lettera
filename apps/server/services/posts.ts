import { db } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { InsertPost } from "@workspace/validations";
import type { ServiceResponse } from "@workspace/types";
import { emails, projectMembers } from "@workspace/db/schema";
import { sendEmailNewsletter } from "./mail/external";

export const createProjectPostDraft = async (
  body: InsertPost
): Promise<ServiceResponse<InsertPost>> => {
  try {
    const [newPost] = await db
      .insert(emails)
      .values({
        ...body,
      })
      .returning();

    if (!newPost) {
      return {
        data: null,
        success: false,
        message: "Failed to create post draft.",
      };
    }

    return {
      data: newPost,
      success: true,
      message: "Post draft created successfully.",
    };
  } catch (err) {
    let errorMessage = "Failed to create post draft due to a server error.";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    return { data: null, success: false, message: errorMessage };
  }
};

export const updateProjectPost = async (
  postId: string,
  body: Partial<InsertPost>
): Promise<ServiceResponse<InsertPost>> => {
  try {
    const fieldsToUpdate: Partial<typeof emails.$inferInsert> = body;

    const [updatedPost] = await db
      .update(emails)
      .set(fieldsToUpdate)
      .where(eq(emails.id, postId))
      .returning();

    if (body.status === "published") {
      await sendEmailNewsletter();
    }

    if (!updatedPost) {
      return {
        data: null,
        success: false,
        message: "Post not found or update failed.",
      };
    }

    return {
      data: updatedPost,
      success: true,
      message: `Post ${updatedPost.status} successfully.`,
    };
  } catch (err) {
    let errorMessage = "Failed to update post due to a server error.";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    return { data: null, success: false, message: errorMessage };
  }
};

export const getAllProjectPosts = async (
  userId: string
): Promise<ServiceResponse<InsertPost[]>> => {
  try {
    const userPosts = await db
      .select({
        serial: emails.serial,
        id: emails.id,
        projectId: emails.projectId,
        subject: emails.subject,
        body: emails.body,
        sentAt: emails.sentAt,
        status: emails.status,
      })
      .from(emails)
      .innerJoin(projectMembers, eq(emails.projectId, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId));
    return {
      data: userPosts,
      success: true,
      message: "User posts fetched successfully.",
    };
  } catch (err) {
    let errorMessage = "Failed to retrieve user posts due to a server error.";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    return { data: null, success: false, message: errorMessage };
  }
};
