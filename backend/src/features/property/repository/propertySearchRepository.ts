import { prisma } from "../../../lib/prisma";
import {
  ListingStatus,
  PropertyType,
  TransactionType,
} from "@prisma/client";

/**
 * ============================================================
 * Search Property Repository
 * ============================================================
 *
 * این لایه فقط مسئول ارتباط Search با Prisma است.
 *
 * نکته مهم:
 * - فقط آگهی‌های منتشرشده جستجو می‌شوند.
 * - ملک باید هنوز در بازه تأیید یک‌ماهه باشد.
 * - مختصات عمومی برگردانده می‌شود، نه مختصات دقیق.
 */

export interface PropertySearchFilters {
  transactionType?: TransactionType;
  propertyType?: PropertyType;

  city?: string;
  district?: string;

  minPrice?: number;
  maxPrice?: number;

  minArea?: number;
  maxArea?: number;

  rooms?: number;

  yearFrom?: number;
  yearTo?: number;
}

export async function searchProperties(
  filters: PropertySearchFilters
) {
  const now = new Date();

  /**
   * فیلترهای مربوط به خود Property
   */
  const propertyWhere: any = {};

  if (filters.propertyType) {
    propertyWhere.propertyType = filters.propertyType;
  }

  if (filters.city) {
    propertyWhere.city = {
      contains: filters.city,
      mode: "insensitive",
    };
  }

  if (filters.district) {
    propertyWhere.district = {
      contains: filters.district,
      mode: "insensitive",
    };
  }

  if (filters.minArea !== undefined || filters.maxArea !== undefined) {
    propertyWhere.area = {};

    if (filters.minArea !== undefined) {
      propertyWhere.area.gte = filters.minArea;
    }

    if (filters.maxArea !== undefined) {
      propertyWhere.area.lte = filters.maxArea;
    }
  }

  if (filters.rooms !== undefined) {
    propertyWhere.rooms = filters.rooms;
  }

  if (filters.yearFrom !== undefined || filters.yearTo !== undefined) {
    propertyWhere.yearBuilt = {};

    if (filters.yearFrom !== undefined) {
      propertyWhere.yearBuilt.gte = filters.yearFrom;
    }

    if (filters.yearTo !== undefined) {
      propertyWhere.yearBuilt.lte = filters.yearTo;
    }
  }

  /**
   * فیلترهای مربوط به Listing
   */
  const listingWhere: any = {
    status: ListingStatus.PUBLISHED,
  };

  if (filters.transactionType) {
    listingWhere.transactionType = filters.transactionType;
  }

  /**
   * فیلتر قیمت
   *
   * قیمت بسته به نوع معامله در فیلد متفاوتی ذخیره می‌شود:
   *
   * SALE
   *   → salePrice
   *
   * FULL_DEPOSIT
   *   → depositAmount
   *
   * RENT
   *   → depositAmount + rentAmount
   */
  if (
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined
  ) {
    const priceConditions: any[] = [];

    const createRange = (field: string) => {
      const range: any = {};

      if (filters.minPrice !== undefined) {
        range.gte = filters.minPrice;
      }

      if (filters.maxPrice !== undefined) {
        range.lte = filters.maxPrice;
      }

      return {
        [field]: range,
      };
    };

    /**
     * اگر نوع معامله مشخص شده باشد،
     * فقط همان نوع قیمت بررسی می‌شود.
     */
    if (filters.transactionType === TransactionType.SALE) {
      priceConditions.push(createRange("salePrice"));
    }

    if (filters.transactionType === TransactionType.FULL_DEPOSIT) {
      priceConditions.push(createRange("depositAmount"));
    }

    /**
     * برای RENT فعلاً بر اساس depositAmount جستجو می‌کنیم.
     *
     * rentAmount نیز در آینده می‌تواند فیلتر مستقل داشته باشد.
     */
    if (filters.transactionType === TransactionType.RENT) {
      priceConditions.push(createRange("depositAmount"));
    }

    /**
     * اگر نوع معامله مشخص نشده باشد،
     * هر سه نوع معامله قابل جستجو هستند.
     */
    if (!filters.transactionType) {
      priceConditions.push(createRange("salePrice"));
      priceConditions.push(createRange("depositAmount"));
    }

    if (priceConditions.length > 0) {
      listingWhere.OR = priceConditions;
    }
  }

  /**
   * confirmUntil برای کنترل اعتبار یک‌ماهه آگهی است.
   *
   * فقط ملک‌هایی که هنوز تأییدشان معتبر است نمایش داده می‌شوند.
   */
  propertyWhere.confirmUntil = {
    gte: now,
  };

  const properties = await prisma.property.findMany({
    where: {
      ...propertyWhere,

      listing: listingWhere,
    },

    include: {
      listing: true,
      media: {
        where: {
          isActive: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },
  });

  /**
   * خروجی Search عمداً فقط اطلاعات عمومی را برمی‌گرداند.
   *
   * latitudeExact / longitudeExact
   * هرگز از این Repository خارج نمی‌شوند.
   */
  return properties.map((property) => ({
    id: property.id,

    propertyType: property.propertyType,

    transactionType: property.listing?.transactionType ?? null,

    city: property.city,
    district: property.district,

    area: property.area,
    rooms: property.rooms,
    yearBuilt: property.yearBuilt,
    floor: property.floor,

    latitudePublic: property.latitudePublic,
    longitudePublic: property.longitudePublic,

    salePrice: property.listing?.salePrice ?? null,
    depositAmount: property.listing?.depositAmount ?? null,
    rentAmount: property.listing?.rentAmount ?? null,

    mainImage:
      property.media.find(
        (media) => media.type === "MAIN_IMAGE"
      )?.url ?? null,

    updatedAt: property.updatedAt,
  }));
}