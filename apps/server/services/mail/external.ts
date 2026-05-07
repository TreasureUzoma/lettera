import { sendNewsletterEmail, sendBulkNewsletterEmails } from "./ses";

export const sendEmailNewsletter = async (
  projectSlug: string,
  recipientEmails: string[],
  subject: string,
  html: string,
  replyTo?: string
) => {
  if (recipientEmails.length === 0) {
    throw new Error("No recipient emails provided");
  }

  if (recipientEmails.length === 1) {
    const result = await sendNewsletterEmail({
      projectSlug,
      recipientEmail: recipientEmails[0],
      subject,
      html,
      replyTo,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to send newsletter");
    }

    return result;
  }

  // Send to multiple recipients
  const result = await sendBulkNewsletterEmails({
    projectSlug,
    recipientEmails,
    subject,
    html,
    replyTo,
  });

  if (!result.success && result.failed === recipientEmails.length) {
    throw new Error("Failed to send newsletter to all recipients");
  }

  return result;
};

