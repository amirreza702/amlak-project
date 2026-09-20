import { prisma } from "../../../lib/prisma";

import {
  findPropertyArchive,
} from "../repository/propertyArchiveRepository";

import { findPropertyById } from "../repository/propertyRepository";

import type { PropertyArchive } from "../types/propertyArchive";

import { PropertyHistoryAction } from "@prisma/client";

/**
 * ============================================================
 * Archive Property Service
 * ============================================================
 *
 * جریان آرشیو:
 *
 * Property
 *   ↓
 * ایجاد PropertyArchive
 *   ↓
 * غیرفعال کردن Property
 *   ↓
 * ثبت PropertyHistory با action = ARCHIVED
 *
 * هر سه عملیات داخل یک Transaction انجام می‌شوند.
 */
export interface ArchivePropertyInput {
  propertyId: string;
  archivedReason?: string | null;
}

export const archivePropertyService = async (
  data: ArchivePropertyInput
): Promise<PropertyArchive> => {
  /**
   * ابتدا وجود ملک را بررسی می‌کنیم.
   */
  const property = await findPropertyById(data.propertyId);

  if (!property) {
    throw new Error("ملک مورد نظر پیدا نشد.");
  }

  /**
   * اگر قبلاً آرشیو شده باشد، دوباره آرشیو نمی‌کنیم.
   */
  const existingArchive = await findPropertyArchive(
    data.propertyId
  );

  if (existingArchive) {
    throw new Error("این ملک قبلاً آرشیو شده است.");
  }

  /**
   * آرشیو، غیرفعال‌سازی ملک و ثبت تاریخچه
   * باید یک عملیات اتمیک باشند.
   */
  const archive = await prisma.$transaction(async (tx) => {
    /**
     * ایجاد Snapshot آرشیو
     */
    const createdArchive = await tx.propertyArchive.create({
      data: {
        propertyId: property.id,
        propertyType: property.propertyType,
        city: property.city,
        district: property.district,
        transactionType:
          property.listing?.transactionType ?? null,
        archivedReason:
          data.archivedReason ?? null,
      },
    });

    /**
     * غیرفعال کردن ملک
     */
    await tx.property.update({
      where: {
        id: property.id,
      },
      data: {
        isActive: false,
      },
    });

    /**
     * ثبت رویداد آرشیو در تاریخچه ملک
     */
    await tx.propertyHistory.create({
      data: {
        propertyId: property.id,
        action: PropertyHistoryAction.ARCHIVED,
        field: "isActive",
        oldValue: "true",
        newValue: "false",
        reason:
          data.archivedReason ??
          "آرشیو ملک",
      },
    });

    return createdArchive;
  });

  return archive;
};

/**
 * ============================================================
 * Get Property Archive
 * ============================================================
 */
export const getPropertyArchiveService = async (
  propertyId: string
): Promise<PropertyArchive> => {
  const archive = await findPropertyArchive(propertyId);

  if (!archive) {
    throw new Error("آرشیو این ملک پیدا نشد.");
  }

  return archive;
};