/**
 * ============================================================
 * Contact Access Usage Repository
 * ============================================================
 */

import { prisma } from "../../../lib/prisma";

/**
 * پیدا کردن مصرف Agent در یک دوره
 */
export const findContactAccessUsage = async (
  agentId: string,
  periodStart: Date
) => {
  return prisma.contactAccessUsage.findUnique({
    where: {
      agentId_periodStart: {
        agentId,
        periodStart,
      },
    },
  });
};

/**
 * ایجاد رکورد مصرف برای یک دوره
 */
export const createContactAccessUsage = async (
  agentId: string,
  periodStart: Date
) => {
  return prisma.contactAccessUsage.create({
    data: {
      agentId,
      periodStart,
      usedCount: 0,
    },
  });
};

/**
 * افزایش تعداد Contactهای مصرف‌شده
 */
export const incrementContactAccessUsage = async (
  agentId: string,
  periodStart: Date
) => {
  return prisma.contactAccessUsage.update({
    where: {
      agentId_periodStart: {
        agentId,
        periodStart,
      },
    },
    data: {
      usedCount: {
        increment: 1,
      },
    },
  });
};