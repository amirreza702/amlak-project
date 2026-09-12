/**
 * ============================================================
 * Property Repository
 * ============================================================
 *
 * مسئول دسترسی مستقیم به جدول Property در دیتابیس.
 * ============================================================
 */

import { prisma } from "../../../lib/prisma";
import type { Property } from "../types/property";

/**
 * پیدا کردن ملک با کد پستی
 *
 * postalCode در Schema جدید:
 * - nullable است
 * - unique نیست
 *
 * بنابراین findUnique قابل استفاده نیست.
 */
export const findPropertyByPostalCode = async (
  postalCode: string
): Promise<Property | null> => {
  return prisma.property.findFirst({
    where: {
      postalCode,
    },
  });
};

/**
 * پیدا کردن ملک با شناسه یکتا
 */
export const findPropertyById = async (
  id: string
): Promise<Property | null> => {
  return prisma.property.findUnique({
    where: {
      id,
    },
  });
};

/**
 * ایجاد ملک
 *
 * Property در Prisma دارای فیلدهای اجباری جدید است؛
 * بنابراین نوع ورودی را مستقیماً از Prisma می‌گیریم.
 */
export const createProperty = async (
  data: Parameters<typeof prisma.property.create>[0]["data"]
): Promise<Property> => {
  return prisma.property.create({
    data,
  });
};

/**
 * دریافت همه ملک‌ها
 */
export const findAllProperties = async (): Promise<Property[]> => {
  return prisma.property.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};