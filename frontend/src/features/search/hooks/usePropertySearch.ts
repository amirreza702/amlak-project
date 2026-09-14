
"use client";

import { useEffect, useState } from "react";

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
 * ------------------------------------------------------------
 * نتیجه‌ای که Backend برای هر ملک برمی‌گرداند
 * ------------------------------------------------------------
 */
export interface PropertySearchResult {
  id: string;

  propertyType: string;
  transactionType: string | null;

  city: string;
  district: string;

  area: number | null;
  rooms: number | null;
  yearBuilt: number | null;
  floor: number | null;

  latitudePublic: number | null;
  longitudePublic: number | null;

  salePrice: string | null;
  depositAmount: string | null;
  rentAmount: string | null;

  mainImage: string | null;
  updatedAt: string;
}

/**
 * ------------------------------------------------------------
 * پاسخ کامل API جستجو
 * ------------------------------------------------------------
 */
interface PropertySearchResponse {
  count: number;
  items: PropertySearchResult[];
}

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

export function usePropertySearch() {
  const [filters, setFilters] =
    useState<PropertySearchState>(INITIAL_SEARCH_STATE);

  const [appliedFilters, setAppliedFilters] =
    useState<PropertySearchState>(INITIAL_SEARCH_STATE);

  /**
   * ----------------------------------------------------------
   * نتایج واقعی Backend
   * ----------------------------------------------------------
   */
  const [results, setResults] =
    useState<PropertySearchResult[]>([]);

  const [isSearching, setIsSearching] =
    useState(false);

  /**
   * ----------------------------------------------------------
   * تغییر یک فیلتر
   * ----------------------------------------------------------
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
   * فیلترهای سریع
   *
   * این فیلترها همان لحظه روی نقشه اعمال می‌شوند.
   * ----------------------------------------------------------
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

      setAppliedFilters(nextFilters);

      return nextFilters;
    });
  }

  /**
   * ----------------------------------------------------------
   * پاک کردن فیلترها
   * ----------------------------------------------------------
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
   * تعداد فیلترهای فعال
   * ----------------------------------------------------------
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
   * تبدیل مقدار فارسی UI به مقدار مورد انتظار Backend
   * ----------------------------------------------------------
   */
  function mapTransactionType(
    value: TransactionType | ""
  ): string | undefined {
    switch (value) {
      case "خرید":
        return "SALE";

      case "رهن":
        return "FULL_DEPOSIT";

      case "اجاره":
        return "RENT";

      case "رهن و اجاره":
        /*
         * Backend فعلاً TransactionType جداگانه‌ای
         * برای رهن و اجاره ندارد.
         *
         * در این مرحله ارسال نمی‌کنیم.
         */
        return undefined;

      default:
        return undefined;
    }
  }

  /**
   * ----------------------------------------------------------
   * تبدیل نوع ملک فارسی به Enum دیتابیس
   * ----------------------------------------------------------
   */
  function mapPropertyType(
    value: PropertyType | ""
  ): string | undefined {
    switch (value) {
      case "آپارتمان":
        return "APARTMENT";

      case "خانه":
        return "HOUSE";

      case "ویلا":
        return "VILLA";

      case "زمین":
        return "LAND";

      case "مغازه":
        return "SHOP";

      case "اداری":
        return "OFFICE";

      case "باغ":
        return "GARDEN";

      default:
        return undefined;
    }
  }

  /**
   * ----------------------------------------------------------
   * جستجوی واقعی در Backend
   * ----------------------------------------------------------
   */
  async function search() {
    setIsSearching(true);

    try {
      const params = new URLSearchParams();

      /**
       * شهر
       */
      if (filters.city.trim()) {
        params.set("city", filters.city.trim());
      }

      /**
       * منطقه
       */
      if (filters.district.trim()) {
        params.set("district", filters.district.trim());
      }

      /**
       * نوع معامله
       */
      const transactionType = mapTransactionType(
        filters.transactionType
      );

      if (transactionType) {
        params.set("transactionType", transactionType);
      }

      /**
       * نوع ملک
       */
      const propertyType = mapPropertyType(
        filters.propertyType
      );

      if (propertyType) {
        params.set("propertyType", propertyType);
      }

      /**
       * قیمت
       */
      if (filters.minPrice.trim()) {
        params.set("minPrice", filters.minPrice.trim());
      }

      if (filters.maxPrice.trim()) {
        params.set("maxPrice", filters.maxPrice.trim());
      }

      /**
       * متراژ
       */
      if (filters.minArea.trim()) {
        params.set("minArea", filters.minArea.trim());
      }

      if (filters.maxArea.trim()) {
        params.set("maxArea", filters.maxArea.trim());
      }

      /**
       * تعداد اتاق
       */
      if (filters.rooms.trim()) {
        params.set("rooms", filters.rooms.trim());
      }

      /**
       * سال ساخت
       */
      if (filters.minYearBuilt.trim()) {
        params.set(
          "yearFrom",
          filters.minYearBuilt.trim()
        );
      }

      if (filters.maxYearBuilt.trim()) {
        params.set(
          "yearTo",
          filters.maxYearBuilt.trim()
        );
      }

      /**
       * ------------------------------------------------------
       * درخواست واقعی به Backend
       * ------------------------------------------------------
       */
      const queryString = params.toString();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/properties/search${
          queryString ? `?${queryString}` : ""
        }`
      );

      if (!response.ok) {
        throw new Error(
          `خطا در جستجوی ملک: ${response.status}`
        );
      }

      const data: PropertySearchResponse =
        await response.json();

      /**
       * ذخیره نتایج واقعی
       */
      setResults(data.items);

      /**
       * فیلترهای اعمال‌شده
       */
      setAppliedFilters({
        ...filters,
      });
    } catch (error) {
      console.error(
        "Property search failed:",
        error
      );

      /**
       * در صورت خطا، نتیجه قبلی را پاک نمی‌کنیم.
       * این کار باعث نمی‌شود نقشه ناگهان خالی شود.
       */
    } finally {
      setIsSearching(false);
    }
  }

  /**
   * ----------------------------------------------------------
   * جستجوی اولیه
   *
   * هنگام ورود به صفحه Search، یک بار اطلاعات واقعی
   * Backend دریافت می‌شود تا املاک روی نقشه نمایش داده شوند.
   *
   * این Effect فقط در Mount اولیه اجرا می‌شود و با تغییر
   * فیلترها دوباره اجرا نخواهد شد.
   * ----------------------------------------------------------
   */
  useEffect(() => {
    void search();

    // عمداً فقط یک بار در زمان Mount اجرا می‌شود.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    filters,
    appliedFilters,

    /**
     * نتایج واقعی جستجو
     */
    results,

    setFilter,
    setQuickFilter,
    resetFilters,
    getActiveFilterCount,

    /**
     * جستجوی واقعی Backend
     */
    search,

    isSearching,
  };
}
