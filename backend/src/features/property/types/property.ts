/**
 * ============================================================
 * Property Types
 * ============================================================
 *
 * نوع Property مستقیماً از مدل Prisma گرفته می‌شود تا
 * TypeScript و Database دو تعریف جدا و ناسازگار از ملک
 * نداشته باشند.
 *
 * منبع اصلی ساختار ملک:
 *
 * backend/prisma/schema.prisma
 * ============================================================
 */

import type { Property as PrismaProperty } from "@prisma/client";

/**
 * موجودیت اصلی ملک
 *
 * این Type همان مدل Property موجود در Prisma است.
 *
 * بنابراین فیلدهایی مثل:
 *
 * propertyType
 * registrationSource
 * city
 * district
 * postalCode
 * area
 * rooms
 * yearBuilt
 * ...
 *
 * همگی دقیقاً مطابق Schema خواهند بود.
 */
export type Property = PrismaProperty;