import { envConfig } from "@/config";
import { decryptDataSubtle, encryptDataSubtle } from "@/lib/encrypt";
import { db } from "@workspace/db";
import { emails } from "@workspace/db/schema";
import type { ServiceResponse } from "@workspace/types";
import { and, desc, eq } from "drizzle-orm";

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

export const createEmail = async (
  projectId: string,
  subject: string,
  body: string
): Promise<ServiceResponse> => {
  try {
    const encryptedBody = await encryptDataSubtle(body, encryptionKey);

    const [newEmail] = await db
      .insert(emails)
      .values({
        projectId,
        subject,
        body: encryptedBody,
        status: "draft", // Default to draft
      })
      .returning();

    if (!newEmail) {
      throw new Error("Failed to create email");
    }

    // Return with decrypted body (which is just the input body)
    newEmail.body = body;

    return {
      success: true,
      message: "Email created successfully",
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
  status?: "published" | "draft"
): Promise<ServiceResponse> => {
  try {
    const updateValues: Record<string, any> = {};
    if (subject !== undefined) updateValues.subject = subject;
    if (body !== undefined) {
      updateValues.body = await encryptDataSubtle(body, encryptionKey);
    }
    if (status !== undefined) updateValues.status = status;

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
      message: "Email updated successfully",
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
