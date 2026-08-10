import { and, eq } from "drizzle-orm";
import { sendEmailNewsletter } from "../mail/external";
import { decryptDataSubtle } from "@/lib/encrypt";
import { envConfig } from "@/config";
import { dbLite, schema } from "./db-lite";

export type SendScheduledEmailResult =
  | { status: "completed"; sentTo: number }
  | { status: "cancelled" | "skipped" | "failed"; reason: string };

/**
 * Sends (or cancels) a scheduled/immediate email campaign for a given
 * `emails` row. Marked `"use step"` so it gets full Node.js/DB access when
 * called from inside a `"use workflow"` function; calling it directly
 * outside a workflow (immediate sends) just runs it as a normal function.
 *
 * Deliberately uses `./db-lite` (a local, duplicated schema) instead of
 * `@workspace/db` — see `./local-schema.ts` for why.
 */
export async function sendScheduledEmail(
  emailId: string
): Promise<SendScheduledEmailResult> {
  "use step";

  const [email] = await dbLite
    .select()
    .from(schema.emails)
    .where(eq(schema.emails.id, emailId));

  if (!email || email.status !== "published") {
    return {
      status: "cancelled",
      reason: `Email is no longer eligible for sending (status: ${email?.status ?? "not found"})`,
    };
  }

  const [project] = await dbLite
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, email.projectId));

  if (!project) {
    return { status: "failed", reason: "Project not found" };
  }

  const subscriberRows = await dbLite
    .select({ email: schema.subscribers.email })
    .from(schema.subscribers)
    .where(
      and(
        eq(schema.subscribers.projectId, email.projectId),
        eq(schema.subscribers.status, "subscribed")
      )
    );
  const recipientEmails = subscriberRows.map((r) => r.email);

  if (recipientEmails.length === 0) {
    return { status: "skipped", reason: "No subscribed subscribers" };
  }

  const decryptedBody = await decryptDataSubtle(
    email.body,
    envConfig.ENCRYPTION_KEY || ""
  );

  const [owner] = await dbLite
    .select({ subscriptionType: schema.users.subscriptionType })
    .from(schema.projectMembers)
    .innerJoin(schema.users, eq(schema.projectMembers.userId, schema.users.id))
    .where(
      and(
        eq(schema.projectMembers.projectId, email.projectId),
        eq(schema.projectMembers.role, "owner")
      )
    );
  const removeBranding = !!owner && owner.subscriptionType !== "free";

  await sendEmailNewsletter(
    project.slug,
    recipientEmails,
    email.subject,
    decryptedBody,
    undefined,
    removeBranding
  );

  return { status: "completed", sentTo: recipientEmails.length };
}
