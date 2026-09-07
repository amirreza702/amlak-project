"use client";

// ---------------------------------------------------------
// هوک اختصاصی جستجوی ملک
// تمام State و منطق فرم جستجو در این فایل قرار می‌گیرد.
// UI فقط از این هوک استفاده می‌کند.
// ---------------------------------------------------------

import { useState } from "react";

// ---------------------------------------------------------
// نوع معاملات قابل انتخاب
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
  transactionType: TransactionType | "";

  propertyType: PropertyType | "";

  city: string;

  district: string;

  minPrice: string;

  maxPrice: string;

  minArea: string;

  maxArea: string;

  rooms: string;

  minYearBuilt: string;

  maxYearBuilt: string;

  hasParking: boolean;

  hasElevator: boolean;

  hasStorage: boolean;

  documentsVerified: boolean;

  ownerVerified: boolean;

  propertyInfoVerified: boolean;

  locationVerified: boolean;

  updatedWithinDays: string;

  onlyActive: boolean;
}

// ---------------------------------------------------------
// مقدار اولیه فرم
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

  minYearBuilt: "",

  maxYearBuilt: "",

  hasParking: false,

  hasElevator: false,

  hasStorage: false,

  documentsVerified: false,

  ownerVerified: false,

  propertyInfoVerified: false,

  locationVerified: false,

  updatedWithinDays: "",

  onlyActive: true,
};

// ---------------------------------------------------------
// هوک اصلی
// ---------------------------------------------------------
export function usePropertySearch() {
  // -------------------------------------------------------
  // State تمام فیلترها
  // -------------------------------------------------------
  const [filters, setFilters] =
    useState<PropertySearchState>(INITIAL_SEARCH_STATE);

  // -------------------------------------------------------
  // کنترل باز و بسته بودن فیلتر پیشرفته
  // -------------------------------------------------------
  const [isAdvancedOpen, setIsAdvancedOpen] =
    useState(false);

  // -------------------------------------------------------
  // این State بعداً هنگام اتصال API استفاده می‌شود.
  // فعلاً فقط مشخص می‌کند جستجو انجام شده یا نه.
  // -------------------------------------------------------
  const [isSearching, setIsSearching] = useState(false);

  // -------------------------------------------------------
  // تغییر مقدار یک فیلتر
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
  // پاک کردن تمام فیلترها
  // -------------------------------------------------------
  function resetFilters() {
    setFilters(INITIAL_SEARCH_STATE);
  }

  // -------------------------------------------------------
  // اجرای جستجو
  // فعلاً API نداریم.
  // در مرحله بعد این قسمت به Service متصل می‌شود.
  // -------------------------------------------------------
  async function search() {
    setIsSearching(true);

    // شبیه‌سازی کوتاه عملیات جستجو
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSearching(false);
  }

  // -------------------------------------------------------
  // خروجی هوک
  // -------------------------------------------------------
  return {
    filters,

    setFilter,

    resetFilters,

    search,

    isAdvancedOpen,

    setIsAdvancedOpen,

    isSearching,
  };
}