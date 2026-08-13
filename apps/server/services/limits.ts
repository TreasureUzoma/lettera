import { db } from "@workspace/db";
import { projectMembers, projects, subscribers, users } from "@workspace/db/schema";
import { and, count, eq } from "drizzle-orm";
import { getPlanBySlug, type Plan } from "@workspace/constants/plans";
import { envConfig } from "@/config";
import { sendSubscriberLimitWarningEmail } from "./mail/internal";

export interface SubscriberUsage {
  projectId: string;
  projectName: string;
  plan: Plan;
  count: number;
  /** Included subscriber cap for the owner's plan. `null` = unlimited. */
  cap: number | null;
  ownerEmail: string;
  ownerName: string;
}

/**
 * Thrown by `assertSubscriberCapacity` when adding subscribers would push a
 * project past its plan's included cap. Routes should catch this and
 * surface `.message` to the caller as a 402/403-style "upgrade to
 * continue" error rather than a generic 500.
 */
export class SubscriberLimitError extends Error {
  usage: SubscriberUsage;

  constructor(usage: SubscriberUsage) {
    super(
      `${usage.projectName} is at its ${usage.plan.name} plan limit of ${usage.cap?.toLocaleString()} subscribers. Upgrade to add more.`
    );
    this.name = "SubscriberLimitError";
    this.usage = usage;
  }
}

/**
 * Looks up the project's owner and their exact plan (`users.plan`, not the
 * coarser `subscriptionType`), plus the project's current subscriber
 * count. Returns `null` if the project has no owner on record, which
 * shouldn't happen for a real project but is handled defensively rather
 * than thrown, since this sits on the hot path for public subscribe forms.
 */
export const getProjectSubscriberUsage = async (
  projectId: string
): Promise<SubscriberUsage | null> => {
  const [row] = await db
    .select({
      projectName: projects.name,
      ownerId: users.id,
      ownerName: users.name,
      ownerEmail: users.email,
      ownerPlan: users.plan,
    })
    .from(projectMembers)
    .innerJoin(users, eq(projectMembers.userId, users.id))
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.role, "owner")
      )
    );

  if (!row) return null;

  const [subscriberStats] = await db
    .select({ value: count() })
    .from(subscribers)
    .where(eq(subscribers.projectId, projectId));
  const subscriberCount = subscriberStats?.value ?? 0;

  const plan = getPlanBySlug(row.ownerPlan);

  return {
    projectId,
    projectName: row.projectName,
    plan,
    count: subscriberCount,
    cap: plan.subscribers,
    ownerEmail: row.ownerEmail,
    ownerName: row.ownerName,
  };
};

const WARNING_THRESHOLD = 0.8;

type LimitWarningState = {
  cap: number;
  warned80: boolean;
  warned100: boolean;
};

const getWarningState = (
  config: Record<string, unknown> | null
): LimitWarningState | null => {
  const state = (config as any)?.subscriberLimitWarnings;
  return state && typeof state.cap === "number" ? state : null;
};

/**
 * Emails the project owner once when usage first crosses 80% of their
 * plan's cap, and once more when it reaches/exceeds the cap. Dedupe state
 * lives in `projects.config.subscriberLimitWarnings` — keyed by the cap
 * itself, so upgrading (which changes the cap) naturally resets it and the
 * owner gets warned again as they approach the *new* limit.
 *
 * Fire-and-forget from the caller's perspective: failures are logged, not
 * thrown, so a flaky email send never blocks a subscriber signup.
 */
export const syncSubscriberLimitWarnings = async (
  usage: SubscriberUsage
): Promise<void> => {
  if (usage.cap === null) return; // unlimited plan, nothing to warn about

  try {
    const [existing] = await db
      .select({ config: projects.config })
      .from(projects)
      .where(eq(projects.id, usage.projectId));

    const config = (existing?.config as Record<string, unknown>) || {};
    const prevState = getWarningState(config);
    const state: LimitWarningState =
      prevState && prevState.cap === usage.cap
        ? prevState
        : { cap: usage.cap, warned80: false, warned100: false };

    const atCap = usage.count >= usage.cap;
    const nearCap = usage.count >= usage.cap * WARNING_THRESHOLD;

    let shouldSend: "reached" | "approaching" | null = null;
    if (atCap && !state.warned100) {
      shouldSend = "reached";
      state.warned100 = true;
      state.warned80 = true; // reaching 100% implies 80% was crossed too
    } else if (nearCap && !state.warned80) {
      shouldSend = "approaching";
      state.warned80 = true;
    }

    if (shouldSend) {
      await db
        .update(projects)
        .set({ config: { ...config, subscriberLimitWarnings: state } })
        .where(eq(projects.id, usage.projectId));

      await sendSubscriberLimitWarningEmail({
        ownerEmail: usage.ownerEmail,
        ownerName: usage.ownerName,
        projectName: usage.projectName,
        planName: usage.plan.name,
        subscriberCount: usage.count,
        subscriberCap: usage.cap,
        upgradeUrl: `${envConfig.DASHBOARD_SITE}/settings/billing`,
        status: shouldSend,
      });
    }
  } catch (error) {
    console.error(
      `Failed to sync subscriber limit warnings for project ${usage.projectId}:`,
      error
    );
  }
};

/**
 * Throws `SubscriberLimitError` if adding `additionalCount` subscribers
 * would push the project past its owner's plan cap. Callers should run
 * this *before* inserting new subscribers (manual add, CSV import, public
 * subscribe form).
 */
export const assertSubscriberCapacity = async (
  projectId: string,
  additionalCount = 1
): Promise<SubscriberUsage> => {
  const usage = await getProjectSubscriberUsage(projectId);

  if (!usage) {
    // Fails closed: a project with no resolvable owner/plan shouldn't be
    // able to silently accept unlimited subscribers.
    console.error(
      `assertSubscriberCapacity: no owner found for project ${projectId}.`
    );
    throw new Error("Could not determine this project's subscriber limit.");
  }

  if (usage.cap !== null && usage.count + additionalCount > usage.cap) {
    // Already-blocked signups still deserve a fresh nudge to the owner.
    void syncSubscriberLimitWarnings(usage);
    throw new SubscriberLimitError(usage);
  }

  return usage;
};
