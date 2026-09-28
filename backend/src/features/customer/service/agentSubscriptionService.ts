 /**
  * ============================================================
  * Agent Subscription Service
  * ============================================================
  *
  * منطق کسب‌وکار مربوط به Subscription Agent
  *
  * Repository فقط با جدول کار می‌کند.
  * تصمیم‌گیری درباره معتبر بودن اطلاعات Subscription
  * در این Service انجام می‌شود.
  */

import {
  createAgentSubscription,
} from "../repository/agentSubscriptionRepository";

/**
 * ایجاد Subscription برای Agent
 */
export const createAgentSubscriptionService = async (
  agentId: string,
  plan: string,
  monthlyContactLimit: number,
  startsAt: Date,
  expiresAt?: Date
) => {
  /**
   * سقف مصرف نمی‌تواند منفی باشد.
   */
  if (monthlyContactLimit < 0) {
    throw new Error(
      "Monthly contact limit cannot be negative"
    );
  }

  /**
   * تاریخ پایان، اگر وجود داشته باشد،
   * نباید قبل از تاریخ شروع باشد.
   */
  if (
    expiresAt &&
    expiresAt < startsAt
  ) {
    throw new Error(
      "Subscription expiration cannot be before start"
    );
  }

  /**
   * ایجاد Subscription
   */
  return createAgentSubscription(
    agentId,
    plan,
    monthlyContactLimit,
    startsAt,
    expiresAt
  );
};