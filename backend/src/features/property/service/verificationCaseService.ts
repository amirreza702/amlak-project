/**
 * ============================================================
 * VerificationCase Service
 * ============================================================
 *
 * منطق Business مربوط به پرونده تأیید Property.
 *
 * جریان:
 *
 * درخواست ایجاد پرونده
 *        ↓
 * بررسی وجود Property
 *        ↓
 * بررسی پرونده قبلی
 *        ↓
 * اگر پرونده PENDING وجود داشته باشد → همان پرونده
 *        ↓
 * در غیر این صورت → ایجاد پرونده جدید
 */

import { findPropertyById } from "../repository/propertyRepository";

import {
  createVerificationCase,
  findLatestVerificationCase,
} from "../repository/verificationCaseRepository";

import type { VerificationCase } from "../types/verificationCase";

import { VerificationStatus } from "@prisma/client";

/**
 * ایجاد یا بازگرداندن پرونده تأیید Property
 */
export const createVerificationCaseService = async (
  propertyId: string
): Promise<VerificationCase> => {

  /**
   * ابتدا بررسی می‌کنیم Property وجود داشته باشد.
   */
  const property = await findPropertyById(propertyId);

  if (!property) {
    throw new Error("ملک مورد نظر پیدا نشد.");
  }

  /**
   * آخرین پرونده تأیید ملک را پیدا می‌کنیم.
   */
  const existingCase =
    await findLatestVerificationCase(propertyId);

  /**
   * اگر پرونده هنوز در حال بررسی باشد،
   * پرونده جدید ایجاد نمی‌کنیم.
   */
  if (
    existingCase &&
    existingCase.status === VerificationStatus.PENDING
  ) {
    return existingCase;
  }

  /**
   * اگر پرونده قبلی VERIFIED یا REJECTED باشد،
   * فعلاً امکان ایجاد پرونده جدید وجود دارد.
   */
  return createVerificationCase(propertyId);
};