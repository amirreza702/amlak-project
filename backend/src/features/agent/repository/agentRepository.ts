/**
 * ============================================================
 * Agent Repository
 * ============================================================
 *
 * این Repository فقط مسئول دسترسی مستقیم به داده‌های Agent است.
 *
 * منطق Business در Service قرار دارد.
 * ============================================================
 */

import { prisma } from "../../../lib/prisma";

/**
 * ------------------------------------------------------------
 * پیدا کردن Agent بر اساس Agent ID
 * ------------------------------------------------------------
 *
 * فقط وجود Agent بررسی می‌شود.
 *
 * اطلاعات Authentication یا Profile در این Use Case
 * مورد نیاز نیست.
 */
export const findAgentById = async (
  agentId: string
) => {
  return prisma.agent.findUnique({
    where: {
      id: agentId,
    },

    select: {
      id: true,
    },
  });
};