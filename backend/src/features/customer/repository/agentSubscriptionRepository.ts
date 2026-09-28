/**
 * ============================================================
 * Agent Subscription Repository
 * ============================================================
 *
 * دسترسی مستقیم به جدول AgentSubscription
 *
 * این فایل فقط مسئول خواندن و ایجاد اطلاعات اشتراک است.
 * منطق کسب‌وکار مربوط به محدودیت Contact در Service قرار می‌گیرد.
 */

import { prisma } from "../../../lib/prisma";

/**
 * پیدا کردن اشتراک فعال و معتبر Agent
 *
 * شرایط معتبر بودن:
 * 1. متعلق به Agent موردنظر باشد.
 * 2. وضعیت آن ACTIVE باشد.
 * 3. تاریخ شروع آن رسیده باشد.
 * 4. تاریخ پایان نداشته باشد یا هنوز منقضی نشده باشد.
 */
export const findActiveAgentSubscription = async (
  agentId: string
) => {
  const now = new Date();

  return prisma.agentSubscription.findFirst({
    where: {
      agentId,

      status: "ACTIVE",

      startsAt: {
        lte: now,
      },

      OR: [
        {
          expiresAt: null,
        },
        {
          expiresAt: {
            gte: now,
          },
        },
      ],
    },

    orderBy: {
      startsAt: "desc",
    },
  });
};

/**
 * ایجاد اشتراک برای Agent
 */
export const createAgentSubscription = async (
  agentId: string,
  plan: string,
  monthlyContactLimit: number,
  startsAt: Date,
  expiresAt?: Date
) => {
  return prisma.agentSubscription.create({
    data: {
      agentId,
      plan,
      monthlyContactLimit,
      startsAt,
      expiresAt,
    },
  });
};