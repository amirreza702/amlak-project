"use client";

// ---------------------------------------------------------
// Hook اختصاصی جستجوی ملک
// ---------------------------------------------------------
// تمام State و منطق جستجو در این فایل قرار دارد.
// کامپوننت‌های UI فقط مقدارها را نمایش می‌دهند
// و تغییرات را از طریق setFilter به این Hook می‌فرستند.
// ---------------------------------------------------------

import { useState } from "react";

// ---------------------------------------------------------
// نوع معاملات
// ---------------------------------------------------------
export type TransactionType =
  | "خرید"
  | "رهن"
  | "اجاره"
  | "رهن و اجاره";

// ---------------------------------------------------------
// نوع ملک
// ---------------------------------------------------------
export type PropertyType =
  | "آپارتمان"
  | "خانه"
  | "ویلا"
  | "زمین"
  | "مغازه"
  | "اداری"
  | "باغ";

// ---------------------------------------------------------
// State اصلی جستجو
// ---------------------------------------------------------
export interface PropertySearchState {
  // معامله
  transactionType: TransactionType | "";

  // نوع ملک
  propertyType: PropertyType | "";

  // موقعیت
  city: string;
  district: string;

  // قیمت
  minPrice: string;
  maxPrice: string;

  // متراژ
  minArea: string;
  maxArea: string;

  // اتاق
  rooms: string;

  // حمام
  bathrooms: string;

  // سن بنا
  minYearBuilt: string;
  maxYearBuilt: string;

  // طبقه
  minFloor: string;
  maxFloor: string;

  // امکانات
  hasParking: boolean;
  hasElevator: boolean;
  hasStorage: boolean;
  hasBalcony: boolean;
  hasYard: boolean;
  hasPool: boolean;

  // وضعیت حقوقی
  singlePageDeed: boolean;
  documentsVerified: boolean;
  transactionAllowed: boolean;

  // وضعیت تأیید اطلاعات
  ownerVerified: boolean;
  propertyInfoVerified: boolean;
  locationVerified: boolean;

  // تازگی آگهی
  updatedWithinDays: string;

  // فقط ملک‌های فعال
  onlyActive: boolean;
}

// ---------------------------------------------------------
// مقدار اولیه State
// ---------------------------------------------------------
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

  // به صورت پیش‌فرض فقط آگهی‌های فعال نمایش داده می‌شوند.
  onlyActive: true,
};

// ---------------------------------------------------------
// Hook
// ---------------------------------------------------------
export function usePropertySearch() {
  // -------------------------------------------------------
  // State فیلترها
  // -------------------------------------------------------
  const [filters, setFilters] =
    useState<PropertySearchState>(INITIAL_SEARCH_STATE);

  // -------------------------------------------------------
  // وضعیت جستجو
  // -------------------------------------------------------
  const [isSearching, setIsSearching] =
    useState(false);

  // -------------------------------------------------------
  // تغییر یک فیلتر
  // -------------------------------------------------------
  // این تابع Generic است تا TypeScript مطمئن شود
  // مقدار ارسال‌شده با نوع همان فیلد سازگار است.
  // -------------------------------------------------------
  function setFilter<K extends keyof PropertySearchState>(
    key: K,
    value: PropertySearchState[K]
  ) {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  // -------------------------------------------------------
  // بازگرداندن همه فیلترها به حالت اولیه
  // -------------------------------------------------------
  function resetFilters() {
    setFilters({
      ...INITIAL_SEARCH_STATE,
    });
  }

  // -------------------------------------------------------
  // محاسبه تعداد فیلترهای فعال
  // -------------------------------------------------------
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

  // -------------------------------------------------------
  // اجرای جستجو
  // -------------------------------------------------------
  // فعلاً API واقعی نداریم.
  // بنابراین فقط برای تست، نیم ثانیه تأخیر ایجاد می‌کنیم.
  // در مرحله بعد این قسمت به Backend وصل می‌شود.
  // -------------------------------------------------------
  async function search() {
    setIsSearching(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 500)
    );

    // برای تست State فعلی در Console نمایش داده می‌شود.
    console.log("Search filters:", filters);

    setIsSearching(false);
  }

  // -------------------------------------------------------
  // خروجی Hook
  // -------------------------------------------------------
  return {
    filters,
    setFilter,
    resetFilters,
    getActiveFilterCount,
    search,
    isSearching,
  };
}