/**
 * ============================================================
 * VerificationCase Repository
 * ============================================================
 *
 * مسئول ارتباط مستقیم با Prisma برای VerificationCase.
 *
 * Repository فقط عملیات Data Access را انجام می‌دهد
 * و منطق Business در Service قرار دارد.
 */

import { prisma } from "../../../lib/prisma";

import type { VerificationCase } from "../types/verificationCase";

/**
 * پیدا کردن VerificationCase با شناسه
 */
export const findVerificationCaseById = async (
  id: string
): Promise<VerificationCase | null> => {
  return prisma.verificationCase.findUnique({
    where: {
      id,
    },
  });
};

/**
 * پیدا کردن آخرین پرونده تأیید یک Property
 */
export const findLatestVerificationCase = async (
  propertyId: string
): Promise<VerificationCase | null> => {
  return prisma.verificationCase.findFirst({
    where: {
      propertyId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * ایجاد پرونده تأیید برای یک Property
 */
export const createVerificationCase = async (
  propertyId: string
): Promise<VerificationCase> => {
  return prisma.verificationCase.create({
    data: {
      propertyId,
    },
  });
};