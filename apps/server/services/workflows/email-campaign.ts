import { sleep } from "workflow";
import { sendScheduledEmail } from "./steps";

interface EmailCampaignProps {
  emailId: string;
  scheduledTime: string; // ISO string, kept serialization-safe across the workflow boundary
}

export async function emailCampaignWorkflow({
  emailId,
  scheduledTime,
}: EmailCampaignProps) {
  "use workflow";

  const scheduledDate = new Date(scheduledTime);

  if (scheduledDate.getTime() > Date.now()) {
    await sleep(scheduledDate);
  }

  return await sendScheduledEmail(emailId);
}
