import { DuplicateDecision } from "@prisma/client";

import {
  createDuplicateReview,
  findDuplicateReviewById,
  findDuplicateReviewsForProperty,
  reviewDuplicate,
} from "../repository/duplicateReviewRepository";

import { findPropertyById } from "../repository/propertyRepository";

import type { DuplicateReview } from "../types/duplicateReview";

import {
  calculatePropertySimilarity,
} from "./propertySimilarityService";

/**
 * ============================================================
 * Create Duplicate Review
 * ============================================================
 */

export interface CreateDuplicateReviewInput {
  primaryPropertyId: string;
  candidatePropertyId: string;
}

export const createDuplicateReviewService = async (
  data: CreateDuplicateReviewInput
): Promise<DuplicateReview> => {
  /**
   * ----------------------------------------------------------
   * دریافت ملک اصلی
   * ----------------------------------------------------------
   */

  const primaryProperty = await findPropertyById(
    data.primaryPropertyId
  );

  if (!primaryProperty) {
    throw new Error("ملک اصلی مورد نظر پیدا نشد.");
  }

  /**
   * ----------------------------------------------------------
   * دریافت ملک کاندید
   * ----------------------------------------------------------
   */

  const candidateProperty = await findPropertyById(
    data.candidatePropertyId
  );

  if (!candidateProperty) {
    throw new Error("ملک کاندید مورد نظر پیدا نشد.");
  }

  /**
   * ----------------------------------------------------------
   * یک ملک نمی‌تواند با خودش مقایسه شود.
   * ----------------------------------------------------------
   */

  if (
    data.primaryPropertyId === data.candidatePropertyId
  ) {
    throw new Error(
      "ملک اصلی و ملک کاندید نمی‌توانند یکسان باشند."
    );
  }

  /**
   * ----------------------------------------------------------
   * محاسبه میزان شباهت
   * ----------------------------------------------------------
   */

  const similarityScore =
    calculatePropertySimilarity(
      primaryProperty,
      candidateProperty
    );

  /**
   * ----------------------------------------------------------
   * ایجاد DuplicateReview
   * ----------------------------------------------------------
   */

  return createDuplicateReview(
    data.primaryPropertyId,
    data.candidatePropertyId,
    similarityScore
  );
};

/**
 * ============================================================
 * Get Duplicate Reviews For Property
 * ============================================================
 */

export const getDuplicateReviewsService = async (
  propertyId: string
): Promise<DuplicateReview[]> => {
  const property = await findPropertyById(propertyId);

  if (!property) {
    throw new Error("ملک مورد نظر پیدا نشد.");
  }

  return findDuplicateReviewsForProperty(propertyId);
};

/**
 * ============================================================
 * Review Duplicate
 * ============================================================
 */

export interface ReviewDuplicateInput {
  duplicateReviewId: string;
  decision: DuplicateDecision;
  reviewedBy: string;
  notes: string | null;
}

export const reviewDuplicateService = async (
  data: ReviewDuplicateInput
): Promise<DuplicateReview> => {
  const duplicateReview = await findDuplicateReviewById(
    data.duplicateReviewId
  );

  if (!duplicateReview) {
    throw new Error("بررسی تکراری بودن ملک پیدا نشد.");
  }

  /**
   * بررسی باید فقط یک بار تصمیم‌گیری شود.
   */

  if (duplicateReview.decision !== null) {
    throw new Error("این بررسی قبلاً تصمیم‌گیری شده است.");
  }

  /**
   * فقط دو تصمیم معتبر داریم:
   *
   * SAME_PROPERTY
   * DIFFERENT_PROPERTY
   */

  if (
    data.decision !== DuplicateDecision.SAME_PROPERTY &&
    data.decision !== DuplicateDecision.DIFFERENT_PROPERTY
  ) {
    throw new Error("تصمیم بررسی تکراری بودن ملک معتبر نیست.");
  }

  return reviewDuplicate(
    data.duplicateReviewId,
    data.decision,
    data.reviewedBy,
    data.notes
  );
};