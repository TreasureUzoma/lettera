import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppBindings, AuthType } from "@/types";
import {
  createCheckoutSession,
  handlePaddleWebhook,
  getUserInvoices,
  cancelSubscription,
  getInvoice,
} from "@/services/paddle";
import { validationErrorResponse } from "@/utils/validation-error-response";
import { routeStatus } from "@/lib/utils";

const subscriptionsPaddleRoute = new Hono<AppBindings>();

/**
 * Create checkout session for subscription
 */
subscriptionsPaddleRoute.post(
  "/checkout",
  zValidator(
    "json",
    z.object({
      planSlug: z.enum(["hobby", "professional", "business", "enterprise"]),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    }),
    (result, c) => {
      if (!result.success) {
        return validationErrorResponse(c, result.error);
      }
    }
  ),
  async (c) => {
    try {
      const user = c.get("user") as AuthType;
      const { planSlug, successUrl, cancelUrl } = c.req.valid("json");

      if (!user?.id) {
        return c.json(
          {
            success: false,
            message: "Unauthorized",
          },
          400
        );
      }

      // Plan pricing (in dollars)
      const planPrices: Record<string, number> = {
        hobby: 0,
        professional: 9,
        business: 29,
        enterprise: 0, // Custom pricing
      };

      const result = await createCheckoutSession({
        userId: user.id,
        planSlug,
        planPrice: planPrices[planSlug] || 0,
        successUrl,
        cancelUrl,
      });

      if (!result.success) {
        return c.json(result as any, 400);
      }

      return c.json(
        {
          success: true,
          message: "Checkout session created",
          data: result.data,
        },
        200
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create checkout";

      return c.json(
        {
          success: false,
          message,
        },
        400
      );
    }
  }
);

/**
 * Webhook endpoint for Paddle events
 */
subscriptionsPaddleRoute.post("/webhook", async (c) => {
  try {
    const body = await c.req.json();

    // Verify webhook signature (implement Paddle's signature verification)
    // For now, we'll process all webhooks
    const result = await handlePaddleWebhook(body);

    return c.json(
      {
        success: result.success,
        message: result.message,
      },
      result.success ? 200 : 400
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";

    console.error("Webhook error:", message);

    return c.json(
      {
        success: false,
        message,
      },
      400
    );
  }
});

/**
 * Get user invoices
 */
subscriptionsPaddleRoute.get("/invoices", async (c) => {
  try {
    const user = c.get("user") as AuthType;

    const result = await getUserInvoices(user.id);

    return c.json(
      {
        success: result.success,
        message: result.message,
        data: result.data,
      },
      result.success ? 200 : 400
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch invoices";

    return c.json(
      {
        success: false,
        message,
      },
      400
    );
  }
});

/**
 * Get specific invoice
 */
subscriptionsPaddleRoute.get(
  "/invoices/:transactionId",
  zValidator(
    "param",
    z.object({ transactionId: z.string().min(1) }),
    (result, c) => {
      if (!result.success) {
        return validationErrorResponse(c, result.error);
      }
    }
  ),
  async (c) => {
    try {
      const { transactionId } = c.req.valid("param");

      const result = await getInvoice(transactionId);

      return c.json(
        {
          success: result.success,
          message: result.message,
          data: result.data,
        },
        result.success ? 200 : 400
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch invoice";

      return c.json(
        {
          success: false,
          message,
        },
        400
      );
    }
  }
);

/**
 * Cancel subscription
 */
subscriptionsPaddleRoute.post("/cancel", async (c) => {
  try {
    const user = c.get("user") as AuthType;

    const result = await cancelSubscription(user.id);

    return c.json(
      {
        success: result.success,
        message: result.message,
      },
      result.success ? 200 : 400
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to cancel subscription";

    return c.json(
      {
        success: false,
        message,
      },
      400
    );
  }
});

export default subscriptionsPaddleRoute;
