import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { envConfig } from "@/config";

const sesClient = new SESClient({
  region: envConfig.AWS_REGION,
  credentials: {
    accessKeyId: envConfig.AWS_ACCESS_KEY_ID,
    secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY,
  },
});

export interface SendNewsletterOptions {
  projectSlug: string;
  recipientEmail: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendBulkNewsletterOptions {
  projectSlug: string;
  recipientEmails: string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Send a single newsletter email via AWS SES
 */
export const sendNewsletterEmail = async (
  options: SendNewsletterOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const { projectSlug, recipientEmail, subject, html, replyTo } = options;

    const command = new SendEmailCommand({
      Source: `newsletter@${projectSlug}.${envConfig.NEWSLETTER_DOMAIN}`,
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: html,
            Charset: "UTF-8",
          },
        },
      },
      ReplyToAddresses: replyTo ? [replyTo] : undefined,
    });

    const response = await sesClient.send(command);

    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Failed to send newsletter email:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Send newsletter to multiple recipients
 * Note: AWS SES has rate limits. Consider using SendBulkTemplatedEmail for large lists
 */
export const sendBulkNewsletterEmails = async (
  options: SendBulkNewsletterOptions
): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors?: Array<{ email: string; error: string }>;
}> => {
  const { projectSlug, recipientEmails, subject, html, replyTo } = options;
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as Array<{ email: string; error: string }>,
  };

  // AWS SES has rate limits - add small delay between sends
  const DELAY_MS = 10; // 10ms between emails

  for (const email of recipientEmails) {
    try {
      const result = await sendNewsletterEmail({
        projectSlug,
        recipientEmail: email,
        subject,
        html,
        replyTo,
      });

      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push({
          email,
          error: result.error || "Unknown error",
        });
      }

      // Add delay to respect SES rate limits
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    } catch (error) {
      results.failed++;
      results.errors.push({
        email,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    success: results.failed === 0,
    ...results,
  };
};

/**
 * Verify email address with AWS SES (for testing)
 */
export const verifyEmailAddress = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { VerifyEmailIdentityCommand } = await import(
      "@aws-sdk/client-ses"
    );
    const command = new VerifyEmailIdentityCommand({ EmailAddress: email });
    await sesClient.send(command);

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      error: errorMessage,
    };
  }
};
