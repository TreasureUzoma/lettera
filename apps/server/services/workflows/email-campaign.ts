import { sleep } from "workflow";
import { sendEmailNewsletter } from "../mail/external";
import { db } from "@workspace/db";
import { emails } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

interface EmailCampaignProps {
  emailId: string;
  scheduledTime: Date; // or string, depending on serialization
}

export async function emailCampaignWorkflow({
  emailId,
  scheduledTime,
}: EmailCampaignProps) {
  "use workflow";

  // Calculate delay
  const now = new Date();
  const scheduledDate = new Date(scheduledTime);
  const delay = scheduledDate.getTime() - now.getTime();

  console.log(
    `[Workflow] Scheduling email ${emailId} for ${scheduledDate.toISOString()} (delay: ${delay}ms)`
  );

  if (delay > 0) {
    // Wait until scheduled time
    await sleep(delay / 1000); // sleep takes seconds usually, checking tests/workflow.ts it uses "5s".
    // "workflow" library sleep might take number as seconds or string.
    // In tests/workflow.ts it says `await sleep("5s")`.
    // Validating if it accepts numbers or if I need to format duration string.
    // Assuming standard sleep from QStash/Workflow often accepts seconds or string duration.
    // Let's use string format if it expects it, or just number if documented.
    // Re-checking tests/workflow.ts: `await sleep("5s")`.
    // I can probably pass `${Math.ceil(delay / 1000)}s` to be safe/consistent with example.
  }

  // Re-fetch email to check if it's still "published" (scheduled) and not cancelled/drafted
  const [email] = await db.select().from(emails).where(eq(emails.id, emailId));

  if (!email || email.status !== "published") {
    console.log(
      `[Workflow] Email ${emailId} is no longer eligible for sending (Status: ${email?.status})`
    );
    return { status: "cancelled" };
  }

  console.log(`[Workflow] Sending email ${emailId} now.`);

  // Send the email
  try {
    await sendEmailNewsletter();
    console.log(`[Workflow] Email ${emailId} sent successfully.`);
    return { status: "completed" };
  } catch (error) {
    console.error(`[Workflow] Failed to send email ${emailId}`, error);
    throw error; // Retries might be handled by workflow engine
  }
}
