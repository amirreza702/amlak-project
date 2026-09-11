"use client";

import { useState } from "react";

/**
 * ============================================================
 * انواع فیلترهای جستجو
 * ============================================================
 */

export type TransactionType =
  | "خرید"
  | "رهن"
  | "اجاره"
  | "رهن و اجاره";

export type PropertyType =
  | "آپارتمان"
  | "خانه"
  | "ویلا"
  | "زمین"
  | "مغازه"
  | "اداری"
  | "باغ";

/**
 * ============================================================
 * وضعیت کامل جستجو
 * ============================================================
 */

export interface PropertySearchState {
  transactionType: TransactionType | "";
  propertyType: PropertyType | "";

  city: string;
  district: string;

  minPrice: string;
  maxPrice: string;

  minArea: string;
  maxArea: string;

  rooms: string;
  bathrooms: string;

  minYearBuilt: string;
  maxYearBuilt: string;

  minFloor: string;
  maxFloor: string;

  hasParking: boolean;
  hasElevator: boolean;
  hasStorage: boolean;
  hasBalcony: boolean;
  hasYard: boolean;
  hasPool: boolean;

  singlePageDeed: boolean;
  documentsVerified: boolean;
  transactionAllowed: boolean;
  ownerVerified: boolean;
  propertyInfoVerified: boolean;
  locationVerified: boolean;

  updatedWithinDays: string;

  onlyActive: boolean;
}

/**
 * ============================================================
 * مقدار اولیه فیلترها
 * ============================================================
 */

const INITIAL_SEARCH_STATE: PropertySearchState = {
  transactionType: "",
  propertyType: "",

  city: "شاهرود",
  district: "",

  minPrice: "",
  maxPrice: "",

  minArea: "",
  maxArea: "",

  rooms: "",
  bathrooms: "",

  minYearBuilt: "",
  maxYearBuilt: "",

  minFloor: "",
  maxFloor: "",

  hasParking: false,
  hasElevator: false,
  hasStorage: false,
  hasBalcony: false,
  hasYard: false,
  hasPool: false,

  singlePageDeed: false,
  documentsVerified: false,
  transactionAllowed: false,
  ownerVerified: false,
  propertyInfoVerified: false,
  locationVerified: false,

  updatedWithinDays: "",

  onlyActive: true,
};

/**
 * ============================================================
 * Hook جستجوی ملک
 * ============================================================
 */

export function usePropertySearch() {
  /**
   * ----------------------------------------------------------
   * filters
   * ----------------------------------------------------------
   *
   * فیلترهایی که کاربر در حال تغییر آنهاست.
   *
   * مثلاً:
   *
   * کاربر «آپارتمان» را انتخاب می‌کند.
   * این مقدار ابتدا در filters قرار می‌گیرد.
   */
  const [filters, setFilters] =
    useState<PropertySearchState>(
      INITIAL_SEARCH_STATE
    );

  /**
   * ----------------------------------------------------------
   * appliedFilters
   * ----------------------------------------------------------
   *
   * فیلترهایی که واقعاً روی نتایج و نقشه اعمال شده‌اند.
   */
  const [appliedFilters, setAppliedFilters] =
    useState<PropertySearchState>(
      INITIAL_SEARCH_STATE
    );

  /**
   * ----------------------------------------------------------
   * وضعیت جستجو
   * ----------------------------------------------------------
   */
  const [isSearching, setIsSearching] =
    useState(false);

  /**
   * ----------------------------------------------------------
   * setFilter
   * ----------------------------------------------------------
   *
   * برای فیلترهای داخل پنل پیشرفته.
   *
   * فقط فرم را تغییر می‌دهد.
   *
   * اعمال روی نقشه زمانی انجام می‌شود که
   * search() اجرا شود.
   */
  function setFilter<K extends keyof PropertySearchState>(
    key: K,
    value: PropertySearchState[K]
  ) {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  /**
   * ----------------------------------------------------------
   * setQuickFilter
   * ----------------------------------------------------------
   *
   * مخصوص فیلترهای سریع بالای نقشه:
   *
   * - نوع معامله
   * - نوع ملک
   *
   * این فیلترها باید همان لحظه روی نقشه اعمال شوند.
   */
  function setQuickFilter<K extends keyof PropertySearchState>(
    key: K,
    value: PropertySearchState[K]
  ) {
    setFilters((previous) => {
      const nextFilters: PropertySearchState = {
        ...previous,
        [key]: value,
      };

      /**
       * اعمال فوری فیلتر روی نقشه
       */
      setAppliedFilters(nextFilters);

      return nextFilters;
    });
  }

  /**
   * ----------------------------------------------------------
   * resetFilters
   * ----------------------------------------------------------
   *
   * بازگرداندن همه فیلترها به حالت اولیه.
   */
  function resetFilters() {
    const initialState: PropertySearchState = {
      ...INITIAL_SEARCH_STATE,
    };

    setFilters(initialState);
    setAppliedFilters(initialState);
  }

  /**
   * ----------------------------------------------------------
   * getActiveFilterCount
   * ----------------------------------------------------------
   *
   * تعداد فیلترهای فعال را محاسبه می‌کند.
   */
  function getActiveFilterCount() {
    let count = 0;

    if (filters.transactionType) count++;
    if (filters.propertyType) count++;
    if (filters.district) count++;

    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;

    if (filters.minArea) count++;
    if (filters.maxArea) count++;

    if (filters.rooms) count++;
    if (filters.bathrooms) count++;

    if (filters.minYearBuilt) count++;
    if (filters.maxYearBuilt) count++;

    if (filters.minFloor) count++;
    if (filters.maxFloor) count++;

    if (filters.hasParking) count++;
    if (filters.hasElevator) count++;
    if (filters.hasStorage) count++;
    if (filters.hasBalcony) count++;
    if (filters.hasYard) count++;
    if (filters.hasPool) count++;

    if (filters.singlePageDeed) count++;
    if (filters.documentsVerified) count++;
    if (filters.transactionAllowed) count++;
    if (filters.ownerVerified) count++;
    if (filters.propertyInfoVerified) count++;
    if (filters.locationVerified) count++;

    if (filters.updatedWithinDays) count++;

    return count;
  }

  /**
   * ----------------------------------------------------------
   * search
   * ----------------------------------------------------------
   *
   * جستجوی کامل.
   *
   * در آینده این تابع به API واقعی Backend متصل خواهد شد.
   *
   * فعلاً فقط filters را به appliedFilters منتقل می‌کند.
   */
  async function search() {
    setIsSearching(true);

    /**
     * این تأخیر فعلاً فقط برای شبیه‌سازی عملیات جستجو است.
     *
     * در مرحله اتصال Backend حذف خواهد شد.
     */
    await new Promise((resolve) =>
      setTimeout(resolve, 500)
    );

    /**
     * اعمال فیلترهای فعلی روی نقشه
     */
    setAppliedFilters({
      ...filters,
    });

    console.log(
      "Applied search filters:",
      filters
    );

    setIsSearching(false);
  }

  /**
   * ==========================================================
   * خروجی Hook
   * ==========================================================
   *
   * این قسمت در فایل فعلی تو وجود نداشت.
   *
   * به همین دلیل PropertySearchPage نمی‌توانست
   * filters / search / setQuickFilter و ... را دریافت کند.
   */
  return {
    filters,
    appliedFilters,

    setFilter,
    setQuickFilter,

    resetFilters,

    getActiveFilterCount,

    search,
    isSearching,
  };
}