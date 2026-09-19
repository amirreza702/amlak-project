/**
 * ============================================================
 * VerificationDocument Service
 * ============================================================
 *
 * منطق Business مربوط به ثبت مدرک در پرونده تأیید.
 *
 * جریان:
 *
 * دریافت درخواست ثبت مدرک
 *          ↓
 * بررسی وجود VerificationCase
 *          ↓
 * بررسی وضعیت پرونده
 *          ↓
 * اگر PENDING باشد
 *          ↓
 * ایجاد VerificationDocument
 *
 * فایل واقعی در این Service آپلود نمی‌شود.
 * fileUrl از لایه بالاتر دریافت می‌شود.
 */

import { VerificationStatus } from "@prisma/client";



import {
  createVerificationDocument,
} from "../repository/verificationDocumentRepository";

import type { VerificationDocument } from "../types/verificationDocument";

import {
  findVerificationCaseById,
} from "../repository/verificationCaseRepository";

/**
 * ورودی ثبت مدرک
 */
export interface CreateVerificationDocumentInput {
  verificationCaseId: string;
  documentType: string;
  fileUrl: string;
}

/**
 * ایجاد مدرک برای پرونده تأیید
 */
export const createVerificationDocumentService = async (
  data: CreateVerificationDocumentInput
): Promise<VerificationDocument> => {

  /**
   * ابتدا بررسی می‌کنیم پرونده تأیید وجود داشته باشد.
   */
  const verificationCase =
  await findVerificationCaseById(
    data.verificationCaseId
  );

  if (!verificationCase) {
    throw new Error(
      "پرونده تأیید مورد نظر پیدا نشد."
    );
  }

  /**
   * فقط پرونده‌ای که هنوز در حال بررسی است
   * می‌تواند مدرک جدید دریافت کند.
   */
  if (
    verificationCase.status !==
    VerificationStatus.PENDING
  ) {
    throw new Error(
      "این پرونده دیگر در وضعیت دریافت مدارک نیست."
    );
  }

  /**
   * ثبت مدرک از طریق Repository
   */
  return createVerificationDocument(
    data.verificationCaseId,
    data.documentType,
    data.fileUrl
  );
};