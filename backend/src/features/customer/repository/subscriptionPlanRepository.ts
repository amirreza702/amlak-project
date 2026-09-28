/**
 * ============================================================
 * Subscription Plan Repository
 * ============================================================
 *
 * دسترسی مستقیم به جدول SubscriptionPlan
 */

import { prisma } from "../../../lib/prisma";

/**
 * پیدا کردن Plan با شناسه
 */
export const findSubscriptionPlanById = async (
  planId: string
) => {
  return prisma.subscriptionPlan.findUnique({
    where: {
      id: planId,
    },
  });
};