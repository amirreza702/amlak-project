import { prisma } from "../../../lib/prisma";

/**
 * ثبت اولین دسترسی مشاور به اطلاعات تماس یک درخواست مشتری
 */
export const createContactAccessLog = async (
  agentId: string,
  customerId: string,
  searchRequestId: string
) => {
  return prisma.contactAccessLog.create({
    data: {
      agentId,
      customerId,
      searchRequestId,
    },
  });
};

/**
 * بررسی اینکه آیا مشاور قبلاً Contact این درخواست را دیده است یا نه
 */
export const findContactAccessLog = async (
  agentId: string,
  searchRequestId: string
) => {
  return prisma.contactAccessLog.findUnique({
    where: {
      agentId_searchRequestId: {
        agentId,
        searchRequestId,
      },
    },
  });
};

/**
 * دریافت سوابق دسترسی یک مشاور
 */
export const findAgentContactAccessLogs = async (
  agentId: string
) => {
  return prisma.contactAccessLog.findMany({
    where: {
      agentId,
    },
    orderBy: {
      accessedAt: "desc",
    },
  });
};