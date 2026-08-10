import { envConfig } from "@/config";
import { decryptDataSubtle, encryptDataSubtle } from "@/lib/encrypt";
import { db } from "@workspace/db";
import { emails } from "@workspace/db/schema";
import type { ServiceResponse } from "@workspace/types";
import { and, desc, eq } from "drizzle-orm";
import { start } from "workflow/api";
import { emailCampaignWorkflow } from "./workflows/email-campaign";

/**
 * Always hands the actual send off to the durable workflow, whether it's
 * scheduled for later or "now" — never sends synchronously in the request
 * handler. A publish action can fan out to an arbitrarily large subscriber
 * list, and a serverless function (this API route, if deployed to Vercel or
 * similar) has a hard execution time limit; the workflow has none, and
 * `start()` itself returns almost immediately regardless of list size.
 */
const triggerSendIfPublished = async (
  emailId: string,
  status: "published" | "draft" | undefined,
  scheduledFor: Date | undefined
) => {
  if (status !== "published") return;

  const sendAt = scheduledFor ?? new Date();
  await start(emailCampaignWorkflow, [
    { emailId, scheduledTime: sendAt.toISOString() },
  ]);
};

const encryptionKey = envConfig.ENCRYPTION_KEY!;

export const getEmails = async (
  projectId: string
): Promise<ServiceResponse> => {
  try {
    const data = await db
      .select()
      .from(emails)
      .where(eq(emails.projectId, projectId))
      .orderBy(desc(emails.sentAt));

    // Decrypt bodies
    for (const email of data) {
      try {
        email.body = await decryptDataSubtle(email.body, encryptionKey);
      } catch (e) {
        console.error(`Failed to decrypt email body for ${email.id}`, e);
        email.body = "Failed to decrypt content";
      }
    }

    return {
      success: true,
      message: "Fetched emails successfully",
      data,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Something went wrong fetching emails",
      data: null,
    };
  }
};

export const getEmail = async (
  projectId: string,
  emailId: string
): Promise<ServiceResponse> => {
  try {
    const [email] = await db
      .select()
      .from(emails)
      .where(and(eq(emails.projectId, projectId), eq(emails.id, emailId)));

    if (!email) {
      return {
        success: false,
        message: "Email not found",
        data: null,
      };
    }

    try {
      email.body = await decryptDataSubtle(email.body, encryptionKey);
    } catch (e) {
      console.error(`Failed to decrypt email body for ${email.id}`, e);
      email.body = "Failed to decrypt content";
    }

    return {
      success: true,
      message: "Fetched email successfully",
      data: email,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Something went wrong fetching email",
      data: null,
    };
  }
};

export const createEmail = async (
  projectId: string,
  subject: string,
  body: string,
  status: "published" | "draft" = "draft",
  sentAt?: Date
): Promise<ServiceResponse> => {
  try {
    const encryptedBody = await encryptDataSubtle(body, encryptionKey);

    const [newEmail] = await db
      .insert(emails)
      .values({
        projectId,
        subject,
        body: encryptedBody,
        status,
        ...(sentAt ? { sentAt } : {}),
      })
      .returning();

    if (!newEmail) {
      throw new Error("Failed to create email");
    }

    await triggerSendIfPublished(newEmail.id, newEmail.status, sentAt);

    // Return with decrypted body (which is just the input body)
    newEmail.body = body;

    return {
      success: true,
      message:
        status === "published"
          ? sentAt && sentAt.getTime() > Date.now()
            ? "Email scheduled successfully"
            : "Email queued for sending"
          : "Email created successfully",
      data: newEmail,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Something went wrong creating email",
      data: null,
    };
  }
};

export const deleteEmail = async (
  projectId: string,
  emailId: string
): Promise<ServiceResponse> => {
  try {
    const [deletedEmail] = await db
      .delete(emails)
      .where(and(eq(emails.projectId, projectId), eq(emails.id, emailId)))
      .returning();

    if (!deletedEmail) {
      return {
        success: false,
        message: "Email not found",
        data: null,
      };
    }

    return {
      success: true,
      message: "Email deleted successfully",
      data: deletedEmail,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Something went wrong deleting email",
      data: null,
    };
  }
};

export const updateEmail = async (
  projectId: string,
  emailId: string,
  subject?: string,
  body?: string,
  status?: "published" | "draft",
  sentAt?: Date
): Promise<ServiceResponse> => {
  try {
    const updateValues: Record<string, any> = {};
    if (subject !== undefined) updateValues.subject = subject;
    if (body !== undefined) {
      updateValues.body = await encryptDataSubtle(body, encryptionKey);
    }
    if (status !== undefined) updateValues.status = status;
    if (sentAt !== undefined) updateValues.sentAt = sentAt;

    if (Object.keys(updateValues).length === 0) {
      return {
        success: false,
        message: "No fields to update",
        data: null,
      };
    }

    const [updatedEmail] = await db
      .update(emails)
      .set(updateValues)
      .where(and(eq(emails.projectId, projectId), eq(emails.id, emailId)))
      .returning();

    if (!updatedEmail) {
      return {
        success: false,
        message: "Email not found",
        data: null,
      };
    }

    if (status !== undefined) {
      await triggerSendIfPublished(updatedEmail.id, status, sentAt);
    }

    // Decrypt content (or return what was passed if body updated)
    if (body) {
      updatedEmail.body = body;
    } else {
      try {
        updatedEmail.body = await decryptDataSubtle(
          updatedEmail.body,
          encryptionKey
        );
      } catch (e) {
        console.error(`Failed to decrypt email body for ${updatedEmail.id}`, e);
        updatedEmail.body = "Failed to decrypt content";
      }
    }

    return {
      success: true,
      message:
        status === "published"
          ? sentAt && sentAt.getTime() > Date.now()
            ? "Email scheduled successfully"
            : "Email sent successfully"
          : "Email updated successfully",
      data: updatedEmail,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Something went wrong updating email",
      data: null,
    };
  }
};
