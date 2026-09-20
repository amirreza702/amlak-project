import { prisma } from "../../../lib/prisma";

import {
  createPropertyArchive,
  findPropertyArchive,
} from "../repository/propertyArchiveRepository";

import { findPropertyById } from "../repository/propertyRepository";

import type { PropertyArchive } from "../types/propertyArchive";

/**
 * ============================================================
 * Archive Property Service
 * ============================================================
 */

export interface ArchivePropertyInput {
  propertyId: string;
  archivedReason?: string | null;
}

export const archivePropertyService = async (
  data: ArchivePropertyInput
): Promise<PropertyArchive> => {
  /**
   * ----------------------------------------------------------
   * بررسی وجود ملک
   * ----------------------------------------------------------
   */

  const property = await findPropertyById(data.propertyId);

  if (!property) {
    throw new Error("ملک مورد نظر پیدا نشد.");
  }

  /**
   * ----------------------------------------------------------
   * بررسی آرشیو قبلی
   * ----------------------------------------------------------
   */

  const existingArchive = await findPropertyArchive(
    data.propertyId
  );

  if (existingArchive) {
    throw new Error("این ملک قبلاً آرشیو شده است.");
  }

  /**
   * ----------------------------------------------------------
   * ایجاد رکورد آرشیو
   * ----------------------------------------------------------
   */

  const archive = await prisma.$transaction(async (tx) => {
    const createdArchive = await tx.propertyArchive.create({
      data: {
        propertyId: property.id,
        propertyType: property.propertyType,
        city: property.city,
        district: property.district,
        transactionType: property.listing?.transactionType ?? null,
        archivedReason: data.archivedReason ?? null,
      },
    });

    /**
     * ملک از چرخه فعال خارج می‌شود.
     */

    await tx.property.update({
      where: {
        id: property.id,
      },
      data: {
        isActive: false,
      },
    });

    return createdArchive;
  });

  return archive;
};

/**
 * ============================================================
 * Get Property Archive Service
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