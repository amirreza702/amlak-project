/**
 * ============================================================
 * Property Repository
 * ============================================================
 *
 * مسئول دسترسی مستقیم به جدول Property در دیتابیس.
 * ============================================================
 */

import { prisma } from "../../../lib/prisma";

import type {
  Property,
  PropertyWithListing,
} from "../types/property";

/**
 * ============================================================
 * پیدا کردن ملک با کد پستی
 * ============================================================
 */
export const findPropertyByPostalCode = async (
  postalCode: string
): Promise<Property | null> => {
  return prisma.property.findFirst({
    where: { postalCode },
  });
};

/**
 * ============================================================
 * پیدا کردن ملک با ID
 * ============================================================
 *
 * در این Use Case، علاوه بر خود Property،
 * Listing فعلی نیز لازم است؛ چون قیمت فعلی
 * در PropertyListing قرار دارد.
 */
export const findPropertyById = async (
  id: string
): Promise<PropertyWithListing | null> => {
  return prisma.property.findUnique({
    where: { id },
    include: {
      listing: true,
    },
  });
};

/**
 * ============================================================
 * ایجاد Property
 * ============================================================
 */
export const createProperty = async (
  data: Parameters<typeof prisma.property.create>[0]["data"]
): Promise<Property> => {
  return prisma.property.create({ data });
};

/**
 * ============================================================
 * دریافت همه Propertyها
 * ============================================================
 */
export const findAllProperties = async (): Promise<Property[]> => {
  return prisma.property.findMany({
    orderBy: { createdAt: "desc" },
  });
};