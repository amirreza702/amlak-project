import type { Property } from "@prisma/client";

/**
 * ============================================================
 * Property Similarity
 * ============================================================
 *
 * محاسبه میزان شباهت دو ملک.
 *
 * خروجی همیشه عددی بین 0 و 1 است.
 */

export const calculatePropertySimilarity = (
  primary: Property,
  candidate: Property
): number => {
  let score = 0;
  let totalWeight = 0;

  /**
   * ----------------------------------------------------------
   * نوع ملک
   * ----------------------------------------------------------
   */

  if (primary.propertyType === candidate.propertyType) {
    score += 0.15;
  }

  totalWeight += 0.15;

  /**
   * ----------------------------------------------------------
   * شهر
   * ----------------------------------------------------------
   */

  if (primary.city === candidate.city) {
    score += 0.15;
  }

  totalWeight += 0.15;

  /**
   * ----------------------------------------------------------
   * منطقه
   * ----------------------------------------------------------
   */

  if (primary.district === candidate.district) {
    score += 0.15;
  }

  totalWeight += 0.15;

  /**
   * ----------------------------------------------------------
   * کدپستی
   * ----------------------------------------------------------
   *
   * اگر هر دو ملک کدپستی داشته باشند و برابر باشند،
   * نشانه بسیار قوی برای یکسان بودن ملک است.
   */

  if (
    primary.postalCode &&
    candidate.postalCode &&
    primary.postalCode === candidate.postalCode
  ) {
    score += 0.30;
  }

  totalWeight += 0.30;

  /**
   * ----------------------------------------------------------
   * متراژ
   * ----------------------------------------------------------
   */

  if (
    primary.area !== null &&
    candidate.area !== null
  ) {
    const maxArea = Math.max(primary.area, candidate.area);

    if (maxArea > 0) {
      const difference =
        Math.abs(primary.area - candidate.area) / maxArea;

      score += 0.15 * Math.max(0, 1 - difference);
    }
  }

  totalWeight += 0.15;

  /**
   * ----------------------------------------------------------
   * تعداد اتاق
   * ----------------------------------------------------------
   */

  if (
    primary.rooms !== null &&
    candidate.rooms !== null
  ) {
    if (primary.rooms === candidate.rooms) {
      score += 0.10;
    }
  }

  totalWeight += 0.10;

  /**
   * ----------------------------------------------------------
   * نرمال‌سازی
   * ----------------------------------------------------------
   */

  if (totalWeight === 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, score / totalWeight));
};