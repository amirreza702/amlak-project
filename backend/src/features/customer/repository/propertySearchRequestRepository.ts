/**
 * ============================================================
 * Property Search Request Repository
 * ============================================================
 *
 * این Repository فقط مسئول ارتباط با Prisma و دیتابیس است.
 *
 * عملیات فعلی:
 *
 * 1. ایجاد درخواست جستجو
 * 2. دریافت درخواست‌های یک مشتری
 * 3. دریافت یک درخواست
 *
 * منطق Business در Service قرار می‌گیرد.
 * ============================================================
 */

import { prisma } from "../../../lib/prisma";

/**
 * ایجاد درخواست جستجوی ملک
 */
export const createPropertySearchRequest = async (
  data: Parameters<
    typeof prisma.propertySearchRequest.create
  >[0]["data"]
) => {
  return prisma.propertySearchRequest.create({
    data,
  });
};

/**
 * دریافت یک درخواست جستجو
 */
export const findPropertySearchRequestById = async (
  id: string
) => {
  return prisma.propertySearchRequest.findUnique({
    where: {
      id,
    },
  });
};

/**
 * دریافت تمام درخواست‌های جستجوی یک مشتری
 *
 * جدیدترین درخواست ابتدا نمایش داده می‌شود.
 */
export const findPropertySearchRequestsByCustomerId =
  async (
    customerId: string
  ) => {
    return prisma.propertySearchRequest.findMany({
      where: {
        customerId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  };