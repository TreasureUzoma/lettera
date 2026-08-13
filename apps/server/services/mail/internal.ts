import type { ProjectRoles } from "@workspace/types";
import { sendSystemEmail } from "./ses";
import { meta } from "@workspace/constants/meta";

// throw errors on error

export const sendWelcomeEmail = async (name: string, email: string) => {
  // todo: send email
};

export const sendForgottenPasswordEmail = async (
  email: string,
  expiresAt: Date,
  token: string
) => {
  // todo: send forgotten password email
};

export const sendProjectInviteEmail = async (
  teamName: string,
  role: ProjectRoles
) => {
  // todo: send project invite
};

export const sendUnsubscribeCofirmationEmail = async (
  email: string,
  projectName: string,
  confirmUrl: string
) => {
  //todo: send project unsubscribing confirmatiion
};

export interface SubscriberLimitWarningOptions {
  ownerEmail: string;
  ownerName: string;
  projectName: string;
  planName: string;
  subscriberCount: number;
  subscriberCap: number;
  upgradeUrl: string;
  /** "approaching" = crossed 80%, still able to add subscribers.
   *  "reached" = at/over the cap — new subscribers are being blocked. */
  status: "approaching" | "reached";
}

/**
 * Warns a project owner they're near or over their plan's subscriber cap.
 * Called from `services/limits.ts` whenever usage crosses a threshold —
 * see that file for the dedupe logic that keeps this from firing on every
 * single subscriber added.
 */
export const sendSubscriberLimitWarningEmail = async (
  options: SubscriberLimitWarningOptions
) => {
  const {
    ownerEmail,
    ownerName,
    projectName,
    planName,
    subscriberCount,
    subscriberCap,
    upgradeUrl,
    status,
  } = options;

  const subject =
    status === "reached"
      ? `${projectName} has hit its subscriber limit`
      : `${projectName} is approaching its subscriber limit`;

  const bodyLine =
    status === "reached"
      ? `<strong>${projectName}</strong> has reached ${subscriberCount.toLocaleString()} subscribers — the limit included in your <strong>${planName}</strong> plan (${subscriberCap.toLocaleString()}). New subscribers can't be added until you upgrade.`
      : `<strong>${projectName}</strong> is at ${subscriberCount.toLocaleString()} of the ${subscriberCap.toLocaleString()} subscribers included in your <strong>${planName}</strong> plan.`;

  const html = `
    <p>hi ${ownerName},</p>
    <p>${bodyLine}</p>
    <p><a href="${upgradeUrl}">upgrade your plan</a> to keep growing without interruption.</p>
    <p>— ${meta.name}</p>
  `;

  const result = await sendSystemEmail({ to: ownerEmail, subject, html });
  if (!result.success) {
    console.error(
      "Failed to send subscriber limit warning email:",
      result.error
    );
  }
  return result;
};
