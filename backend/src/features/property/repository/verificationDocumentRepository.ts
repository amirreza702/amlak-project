/**
 * ============================================================
 * VerificationDocument Repository
 * ============================================================
 *
 * این فایل فقط مسئول ارتباط مستقیم با Prisma برای
 * VerificationDocument است.
 *
 * منطق Business در Service قرار می‌گیرد.
 */

import { prisma } from "../../../lib/prisma";

import type { VerificationDocument } from "../types/verificationDocument";

/**
 * ایجاد یک مدرک برای پرونده تأیید
 *
 * توجه:
 * فایل واقعی در این مرحله آپلود نمی‌شود.
 *
 * fileUrl فقط آدرس فایل ذخیره‌شده را دریافت می‌کند.
 */
export const createVerificationDocument = async (
  verificationCaseId: string,
  documentType: string,
  fileUrl: string
): Promise<VerificationDocument> => {
  return prisma.verificationDocument.create({
    data: {
      verificationCaseId,
      documentType,
      fileUrl,
    },
  });
};