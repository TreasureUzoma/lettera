import { db } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { InsertPost } from "@workspace/validations";
import type { ServiceResponse } from "@workspace/types";
import { emails, projectMembers } from "@workspace/db/schema";
import { sendEmailNewsletter } from "./mail/external";
import { decryptDataSubtle, encryptDataSubtle } from "@/lib/encrypt";
import { envConfig } from "@/config";

export const createProjectPostDraft = async (
  body: InsertPost
): Promise<ServiceResponse<InsertPost>> => {
  try {
    const encryptedBody = await encryptDataSubtle(
      body.body,
      envConfig.ENCRYPTION_KEY || ""
    );
    const [newPost] = await db
      .insert(emails)
      .values({
        ...body,
        body: encryptedBody,
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
    const fieldsToUpdate: Partial<typeof emails.$inferInsert> = { ...body };

    // encrypt body if it exists
    if (body.body) {
      fieldsToUpdate.body = await encryptDataSubtle(
        body.body,
        envConfig.ENCRYPTION_KEY || ""
      );
    }

    const [updatedPost] = await db
      .update(emails)
      .set(fieldsToUpdate)
      .where(eq(emails.id, postId))
      .returning();

    if (updatedPost?.body) {
      updatedPost.body = await decryptDataSubtle(
        updatedPost.body,
        envConfig.ENCRYPTION_KEY || ""
      );
    }

    if (body.status === "published") {
      const scheduledTime = body.sentAt ? new Date(body.sentAt) : new Date();
      if (scheduledTime.getTime() > Date.now()) {
        await start(emailCampaignWorkflow, {
          emailId: postId,
          scheduledTime: scheduledTime,
        });
      } else {
        await sendEmailNewsletter();
      }
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

    // decrypt all post bodies
    const decryptedPosts = await Promise.all(
      userPosts.map(async (post) => ({
        ...post,
        body: await decryptDataSubtle(
          post.body,
          envConfig.ENCRYPTION_KEY || ""
        ),
      }))
    );

    return {
      data: decryptedPosts,
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
