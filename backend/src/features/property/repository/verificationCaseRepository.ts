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
 * پیدا کردن پرونده تأیید یک Property
 *
 * چون در Schema فعلی برای propertyId محدودیت unique نداریم،
 * ممکن است یک Property چند VerificationCase داشته باشد.
 *
 * بنابراین آخرین پرونده را بر اساس createdAt برمی‌گردانیم.
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
 *
 * وضعیت اولیه طبق Prisma Schema برابر PENDING است.
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