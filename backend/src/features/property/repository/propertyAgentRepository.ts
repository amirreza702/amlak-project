import { prisma } from "../../../lib/prisma";
import type { PropertyAgent } from "../types/propertyAgent";

/**
 * پیدا کردن ارتباط یک مشاور با یک ملک
 */
export const findPropertyAgent = async (
  propertyId: string,
  agentId: string
): Promise<PropertyAgent | null> => {
  return prisma.propertyAgent.findUnique({
    where: {
      propertyId_agentId: {
        propertyId,
        agentId,
      },
    },
  });
};

/**
 * بررسی اینکه آیا ملک قبلاً مشاور دارد یا خیر
 */
export const hasPropertyAgents = async (
  propertyId: string
): Promise<boolean> => {
  const count = await prisma.propertyAgent.count({
    where: {
      propertyId,
    },
  });

  return count > 0;
};

/**
 * ایجاد ارتباط ملک و مشاور
 *
 * اولین مشاوری که ملک را ثبت می‌کند،
 * isFirstRegistrant = true خواهد داشت.
 */
export const createPropertyAgent = async (
  propertyId: string,
  agentId: string
): Promise<PropertyAgent> => {
  const isFirstRegistrant =
    !(await hasPropertyAgents(propertyId));

  return prisma.propertyAgent.create({
    data: {
      propertyId,
      agentId,
      isFirstRegistrant,
    },
  });
};

/**
 * تأیید مشاور توسط مالک
 */
export const approvePropertyAgentByOwner = async (
  propertyId: string,
  agentId: string
): Promise<PropertyAgent> => {
  return prisma.propertyAgent.update({
    where: {
      propertyId_agentId: {
        propertyId,
        agentId,
      },
    },
    data: {
      approvedByOwner: true,
      approvedAt: new Date(),
    },
  });
};

/**
 * فعال‌سازی مجدد ارتباط Agent با Property
 *
 * این تابع فقط برای رکوردی استفاده می‌شود
 * که قبلاً REVOKED شده است.
 */
export const reactivatePropertyAgent = async (
  propertyId: string,
  agentId: string
): Promise<PropertyAgent> => {
  return prisma.propertyAgent.update({
    where: {
      propertyId_agentId: {
        propertyId,
        agentId,
      },
    },
    data: {
      status: "ACTIVE",
      approvedByOwner: false,
      approvedAt: null,
    },
  });
};