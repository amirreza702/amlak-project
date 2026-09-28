/**
 * ============================================================
 * Agent Subscription Service
 * ============================================================
 *
 * منطق کسب‌وکار مربوط به Subscription Agent
 */

import {
  createAgentSubscription,
  findActiveAgentSubscription,
  upgradeAgentSubscription,
} from "../repository/agentSubscriptionRepository";

import {
  findSubscriptionPlanById,
} from "../repository/subscriptionPlanRepository";

/**
 * ایجاد Subscription جدید
 *
 * فقط زمانی مجاز است که Agent
 * Subscription فعال نداشته باشد.
 */
export const createAgentSubscriptionService = async (
  agentId: string,
  planId: string,
  startsAt: Date,
  expiresAt?: Date
) => {
  const activeSubscription =
    await findActiveAgentSubscription(agentId);

  if (activeSubscription) {
    throw new Error(
      "Agent already has an active subscription"
    );
  }

  const plan =
    await findSubscriptionPlanById(planId);

  if (!plan) {
    throw new Error(
      "Subscription plan not found"
    );
  }

  if (plan.status !== "ACTIVE") {
    throw new Error(
      "Subscription plan is not active"
    );
  }

  if (
    expiresAt &&
    expiresAt < startsAt
  ) {
    throw new Error(
      "Subscription expiration cannot be before start"
    );
  }

  return createAgentSubscription(
    agentId,
    planId,
    startsAt,
    expiresAt
  );
};

/**
 * ارتقای Subscription فعال
 *
 * فقط زمانی مجاز است که:
 *
 * level پلن جدید
 * >
 * level پلن فعلی
 *
 * باشد.
 */
export const upgradeAgentSubscriptionService = async (
  agentId: string,
  planId: string
) => {
  const activeSubscription =
    await findActiveAgentSubscription(agentId);

  if (!activeSubscription) {
    throw new Error(
      "Active subscription not found"
    );
  }

  const newPlan =
    await findSubscriptionPlanById(planId);

  if (!newPlan) {
    throw new Error(
      "Subscription plan not found"
    );
  }

  if (newPlan.status !== "ACTIVE") {
    throw new Error(
      "Subscription plan is not active"
    );
  }

  const currentPlanLevel =
    activeSubscription.subscriptionPlan.level;

  if (
    newPlan.level <= currentPlanLevel
  ) {
    throw new Error(
      "New subscription plan must be higher than current plan"
    );
  }

  return upgradeAgentSubscription(
    activeSubscription.id,
    planId
  );
};