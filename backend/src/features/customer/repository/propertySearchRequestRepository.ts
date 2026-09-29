/**
 * ============================================================
 * Property Search Request Repository
 * ============================================================
 *
 * این Repository فقط مسئول ارتباط با Prisma و دیتابیس است.
 *
 * عملیات:
 *
 * 1. ایجاد درخواست جستجو
 * 2. دریافت درخواست‌های یک مشتری
 * 3. دریافت یک درخواست
 * 4. تغییر وضعیت درخواست
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

/**
 * تغییر وضعیت درخواست جستجو
 */
export const updatePropertySearchRequestStatus =
  async (
    id: string,
    status: string
  ) => {
    return prisma.propertySearchRequest.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  };

 /**
 * ویرایش اطلاعات درخواست جستجو
 *
 * وضعیت درخواست در این عملیات تغییر نمی‌کند.
 *
 * نوع data مستقیماً از Prisma گرفته می‌شود
 * تا Enumهای transactionType و propertyType
 * دقیقاً با Schema هماهنگ باشند.
 */
export const updatePropertySearchRequest = async (
  id: string,
  data: Parameters<
    typeof prisma.propertySearchRequest.update
  >[0]["data"]
) => {
  return prisma.propertySearchRequest.update({
    where: {
      id,
    },
    data,
  });
};

 /**
  * دریافت درخواست‌های فعال جستجوی ملک
  *
  * این Query برای نمایش درخواست‌های قابل مشاهده
  * به Agent استفاده می‌شود.
  *
  * فقط اطلاعات مورد نیاز Agent برگردانده می‌شود.
  *
  * customerId عمداً در خروجی وجود ندارد.
  */
export const findActivePropertySearchRequests =
  async () => {
    return prisma.propertySearchRequest.findMany({
      where: {
        status: "ACTIVE",
      },

      select: {
        id: true,
        transactionType: true,
        propertyType: true,
        city: true,
        budget: true,
        description: true,
        hashtiVerified: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  };

  