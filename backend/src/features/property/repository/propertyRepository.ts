
import { prisma } from "../../../lib/prisma";

import type {
  Property,
  PropertyWithListing,
} from "../types/property";

import type { Prisma } from "@prisma/client";

/**
 * ============================================================
 * DatabaseClient
 * ============================================================
 *
 * نوع Client دیتابیس.
 *
 * می‌تواند:
 *
 * 1. Prisma Client معمولی باشد
 * 2. Transaction Client باشد
 *
 * این امکان باعث می‌شود Repository
 * هم به‌صورت مستقل و هم داخل Transaction
 * قابل استفاده باشد.
 */
type DatabaseClient =
  | typeof prisma
  | Prisma.TransactionClient;

/**
 * ============================================================
 * findPropertyByPostalCode
 * ============================================================
 *
 * پیدا کردن ملک بر اساس کد پستی.
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
 * ============================================================
 * findPropertyById
 * ============================================================
 *
 * پیدا کردن ملک بر اساس شناسه.
 *
 * اطلاعات Listing نیز همراه ملک دریافت می‌شود.
 */
export const findPropertyById = async (
  id: string
): Promise<PropertyWithListing | null> => {
  return prisma.property.findUnique({
    where: {
      id,
    },
    include: {
      listing: true,
    },
  });
};

/**
 * ============================================================
 * createProperty
 * ============================================================
 *
 * ایجاد ملک.
 *
 * پارامتر db به‌صورت پیش‌فرض Prisma Client است،
 * اما در صورت نیاز می‌توان Transaction Client
 * را به آن ارسال کرد.
 *
 * بنابراین:
 *
 * createProperty(data)
 *
 * یا:
 *
 * createProperty(data, tx)
 *
 * هر دو امکان‌پذیر هستند.
 */
export const createProperty = async (
  data: Parameters<
    typeof prisma.property.create
  >[0]["data"],
  db: DatabaseClient = prisma
): Promise<Property> => {
  return db.property.create({
    data,
  });
};

/**
 * ============================================================
 * findAllProperties
 * ============================================================
 *
 * دریافت تمام ملک‌ها.
 *
 * جدیدترین ملک‌ها ابتدا برگردانده می‌شوند.
 */
export const findAllProperties = async (): Promise<
  Property[]
> => {
  return prisma.property.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * ============================================================
 * updateProperty
 * ============================================================
 *
 * به‌روزرسانی اطلاعات ملک.
 *
 * پارامتر db به‌صورت پیش‌فرض Prisma Client است،
 * اما در صورت نیاز می‌توان Transaction Client
 * را به آن ارسال کرد.
 */
export const updateProperty = async (
  id: string,
  data: Parameters<
    typeof prisma.property.update
  >[0]["data"],
  db: DatabaseClient = prisma
): Promise<Property> => {
  return db.property.update({
    where: {
      id,
    },
    data,
  });
};

/**
 * ============================================================
 * findExpiredProperties
 * ============================================================
 *
 * پیدا کردن ملک‌هایی که مهلت تأیید آنها گذشته است.
 *
 * شرایط:
 *
 * confirmUntil <= now
 *
 * و:
 *
 * Listing باید هنوز PUBLISHED باشد.
 *
 * این تابع بعداً توسط سرویس انقضا و Job
 * برای پیدا کردن ملک‌های منقضی‌شده استفاده می‌شود.
 */
export const findExpiredProperties = async (
  now: Date = new Date()
): Promise<PropertyWithListing[]> => {
  return prisma.property.findMany({
    where: {
      confirmUntil: {
        lte: now,
      },

      listing: {
        status: "PUBLISHED",
      },
    },

    include: {
      listing: true,
    },

    orderBy: {
      confirmUntil: "asc",
    },
  });
};
