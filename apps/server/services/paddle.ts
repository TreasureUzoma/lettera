import { Paddle } from "@paddle/paddle-node-sdk";
import { envConfig } from "@/config";
import { db } from "@workspace/db";
import { payments, users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { ServiceResponse } from "@workspace/types";

// Initialize Paddle client
const paddle = new Paddle(envConfig.PADDLE_API_KEY);

export interface CreateCheckoutSessionOptions {
  userId: string;
  planSlug: string;
  planPrice: number;
  successUrl: string;
  cancelUrl: string;
}

export interface WebhookPayload {
  event_id: string;
  event_type: string;
  occurred_at: string;
  data: Record<string, any>;
}

/**
 * Create a Paddle checkout session
 */
export const createCheckoutSession = async (
  options: CreateCheckoutSessionOptions
): Promise<ServiceResponse> => {
  try {
    const { userId, planSlug, planPrice, successUrl, cancelUrl } = options;

    // Get user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return {
        success: false,
        message: "User not found",
        data: null,
      };
    }

    // For now, return a placeholder checkout URL
    // In production, you would create an actual Paddle checkout
    const checkoutUrl = `https://checkout.paddle.com/checkout/create?items[0][price_id]=price_${planSlug}&customer_email=${user.email}`;

    return {
      success: true,
      message: "Checkout session created",
      data: {
        sessionId: `session_${Date.now()}`,
        url: checkoutUrl,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create checkout";
    console.error("Paddle checkout error:", errorMessage);

    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * Handle Paddle webhook events
 */
export const handlePaddleWebhook = async (
  payload: WebhookPayload
): Promise<ServiceResponse> => {
  try {
    const { event_type, data } = payload;

    switch (event_type) {
      case "transaction.completed":
        return await handleTransactionCompleted(data);

      case "transaction.updated":
        return await handleTransactionUpdated(data);

      case "subscription.created":
        return await handleSubscriptionCreated(data);

      case "subscription.updated":
        return await handleSubscriptionUpdated(data);

      case "subscription.canceled":
        return await handleSubscriptionCanceled(data);

      default:
        return {
          success: true,
          message: `Event ${event_type} received but not processed`,
          data: null,
        };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Webhook processing failed";
    console.error("Paddle webhook error:", errorMessage);

    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * Handle transaction completed event
 */
const handleTransactionCompleted = async (data: any): Promise<ServiceResponse> => {
  try {
    const { id, customer_id, total, currency, status, custom_data } = data;

    if (!custom_data?.userId) {
      return {
        success: false,
        message: "Missing userId in custom data",
        data: null,
      };
    }

    // Store payment record
    await db.insert(payments).values({
      userId: custom_data.userId,
      provider: "paddle",
      amount: Math.round(total * 100), // Convert to cents
      currency: currency || "USD",
      reference: id,
      status: status === "completed" ? "completed" : "pending",
      metadata: {
        customerId: customer_id,
        planSlug: custom_data.planSlug,
      },
    });

    // Update user subscription
    if (custom_data.planSlug) {
      await db
        .update(users)
        .set({ subscriptionType: custom_data.planSlug })
        .where(eq(users.id, custom_data.userId));
    }

    return {
      success: true,
      message: "Transaction processed",
      data: { transactionId: id },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process transaction";
    console.error("Transaction processing error:", errorMessage);

    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * Handle transaction updated event
 */
const handleTransactionUpdated = async (data: any): Promise<ServiceResponse> => {
  try {
    const { id, status, custom_data } = data;

    if (!custom_data?.userId) {
      return {
        success: false,
        message: "Missing userId in custom data",
        data: null,
      };
    }

    // Update payment status
    const [existingPayment] = await db
      .select()
      .from(payments)
      .where(eq(payments.reference, id));

    if (existingPayment) {
      await db
        .update(payments)
        .set({
          status: status === "completed" ? "completed" : "pending",
        })
        .where(eq(payments.reference, id));
    }

    return {
      success: true,
      message: "Transaction updated",
      data: { transactionId: id },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update transaction";
    console.error("Transaction update error:", errorMessage);

    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * Handle subscription created event
 */
const handleSubscriptionCreated = async (
  data: any
): Promise<ServiceResponse> => {
  try {
    const { id, customer_id, custom_data } = data;

    if (!custom_data?.userId) {
      return {
        success: false,
        message: "Missing userId in custom data",
        data: null,
      };
    }

    // Update user with subscription info
    await db
      .update(users)
      .set({
        subscriptionType: custom_data.planSlug || "professional",
      })
      .where(eq(users.id, custom_data.userId));

    return {
      success: true,
      message: "Subscription created",
      data: { subscriptionId: id },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create subscription";
    console.error("Subscription creation error:", errorMessage);

    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * Handle subscription updated event
 */
const handleSubscriptionUpdated = async (
  data: any
): Promise<ServiceResponse> => {
  try {
    const { id, custom_data, status } = data;

    if (!custom_data?.userId) {
      return {
        success: false,
        message: "Missing userId in custom data",
        data: null,
      };
    }

    // Update subscription status
    if (status === "active" && custom_data.planSlug) {
      await db
        .update(users)
        .set({ subscriptionType: custom_data.planSlug })
        .where(eq(users.id, custom_data.userId));
    }

    return {
      success: true,
      message: "Subscription updated",
      data: { subscriptionId: id },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update subscription";
    console.error("Subscription update error:", errorMessage);

    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * Handle subscription canceled event
 */
const handleSubscriptionCanceled = async (
  data: any
): Promise<ServiceResponse> => {
  try {
    const { id, custom_data } = data;

    if (!custom_data?.userId) {
      return {
        success: false,
        message: "Missing userId in custom data",
        data: null,
      };
    }

    // Downgrade to free plan
    await db
      .update(users)
      .set({ subscriptionType: "free" })
      .where(eq(users.id, custom_data.userId));

    return {
      success: true,
      message: "Subscription canceled",
      data: { subscriptionId: id },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to cancel subscription";
    console.error("Subscription cancellation error:", errorMessage);

    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * Get invoice from Paddle
 */
export const getInvoice = async (
  transactionId: string
): Promise<ServiceResponse> => {
  try {
    // For now, retrieve from database
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.reference, transactionId));

    if (!payment) {
      return {
        success: false,
        message: "Transaction not found",
        data: null,
      };
    }

    return {
      success: true,
      message: "Invoice retrieved",
      data: {
        id: payment.serial,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        createdAt: payment.createdAt,
        reference: payment.reference,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to retrieve invoice";
    console.error("Invoice retrieval error:", errorMessage);

    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * List user invoices/transactions
 */
export const getUserInvoices = async (
  userId: string
): Promise<ServiceResponse> => {
  try {
    const userPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId));

    return {
      success: true,
      message: "Invoices retrieved",
      data: userPayments,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to retrieve invoices";
    console.error("Invoices retrieval error:", errorMessage);

    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (
  userId: string
): Promise<ServiceResponse> => {
  try {
    // Downgrade user to free plan
    await db
      .update(users)
      .set({ subscriptionType: "free" })
      .where(eq(users.id, userId));

    return {
      success: true,
      message: "Subscription canceled",
      data: null,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to cancel subscription";
    console.error("Subscription cancellation error:", errorMessage);

    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};
