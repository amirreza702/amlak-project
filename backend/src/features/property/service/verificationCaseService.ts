import { VerificationStatus } from "@prisma/client";

import {
  createVerificationCase,
  findLatestVerificationCase,
  findVerificationCaseById,
  reviewVerificationCase,
} from "../repository/verificationCaseRepository";

import { findPropertyById } from "../repository/propertyRepository";
import { createPropertyHistory } from "../repository/propertyHistoryRepository";

import type { VerificationCase } from "../types/verificationCase";

/**
 * ============================================================
 * Create Verification Case
 * ============================================================
 */

export const createVerificationCaseService = async (
  propertyId: string
): Promise<VerificationCase> => {
  const property = await findPropertyById(propertyId);

  if (!property) {
    throw new Error("ملک مورد نظر پیدا نشد.");
  }

  const existingCase = await findLatestVerificationCase(propertyId);

  if (
    existingCase &&
    existingCase.status === VerificationStatus.PENDING
  ) {
    return existingCase;
  }

  return createVerificationCase(propertyId);
};

/**
 * ============================================================
 * Review Verification Case
 * ============================================================
 */

export interface ReviewVerificationCaseInput {
  verificationCaseId: string;
  status: VerificationStatus;
  reviewedBy: string;
  notes: string | null;
}

export const reviewVerificationCaseService = async (
  data: ReviewVerificationCaseInput
): Promise<VerificationCase> => {
  const verificationCase = await findVerificationCaseById(
    data.verificationCaseId
  );

  if (!verificationCase) {
    throw new Error("پرونده تأیید مورد نظر پیدا نشد.");
  }

  if (verificationCase.status !== VerificationStatus.PENDING) {
    throw new Error("این پرونده قبلاً بررسی شده است.");
  }

  if (
  data.status !== VerificationStatus.VERIFIED &&
  data.status !== VerificationStatus.REJECTED
) {
  throw new Error("وضعیت بررسی پرونده معتبر نیست.");
}

  const reviewedCase = await reviewVerificationCase(
    data.verificationCaseId,
    data.status,
    data.reviewedBy,
    data.notes
  );

  await createPropertyHistory({
    propertyId: verificationCase.propertyId,
    action: "VERIFICATION_CHANGED",
    field: "verificationCase.status",
    oldValue: VerificationStatus.PENDING,
    newValue: data.status,
    performedBy: data.reviewedBy,
    reason: data.notes ?? "بررسی پرونده تأیید توسط هشتی",
  });

  return reviewedCase;
};