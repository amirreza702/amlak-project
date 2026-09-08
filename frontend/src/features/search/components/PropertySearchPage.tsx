"use client";

// ---------------------------------------------------------
// صفحه اصلی جستجوی ملک
// ---------------------------------------------------------

import { useState } from "react";

import { usePropertySearch } from "../hooks/usePropertySearch";

import { PropertyFiltersPanel } from "./PropertyFiltersPanel";
import { SearchBar } from "./SearchBar";
import { SearchMap } from "./SearchMap";
import { SearchTabs } from "./SearchTabs";
import { SmartSearchPanel } from "./SmartSearchPanel";

// ---------------------------------------------------------
// کامپوننت صفحه جستجو
// ---------------------------------------------------------
export function PropertySearchPage() {
  // -------------------------------------------------------
  // تمام State جستجو از Hook گرفته می‌شود.
  // -------------------------------------------------------
  const {
    filters,
    setFilter,
    resetFilters,
    getActiveFilterCount,
    search,
    isSearching,
  } = usePropertySearch();

  // -------------------------------------------------------
  // مشخص می‌کند کدام پنل باز باشد:
  //
  // filters → فیلترهای ساختاری
  // smart   → جستجوی هوشمند
  // null    → هیچ پنلی باز نیست
  // -------------------------------------------------------
  const [activePanel, setActivePanel] =
    useState<"filters" | "smart" | null>(null);

  // -------------------------------------------------------
  // بستن پنل
  // -------------------------------------------------------
  const closePanel = () => {
    setActivePanel(null);
  };

  // -------------------------------------------------------
  // خروجی
  // -------------------------------------------------------
  return (
    <main
      dir="rtl"
      className="
        relative
        h-[100dvh]
        w-full
        overflow-hidden
        bg-slate-100
      "
    >
      {/* -------------------------------------------------
          نقشه
      -------------------------------------------------- */}
      <SearchMap />

      {/* -------------------------------------------------
          لایه کنترل‌های جستجو
      -------------------------------------------------- */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          z-20
          flex
          justify-center
          px-3
          pt-3
          sm:px-5
          sm:pt-5
        "
      >
        <div
          className="
            pointer-events-auto
            w-full
            max-w-4xl
          "
        >
          {/* ------------------------------------------------
              Search Bar
          ------------------------------------------------- */}
          <SearchBar
            district={filters.district}
            setDistrict={(value) =>
              setFilter("district", value)
            }
          />

          {/* ------------------------------------------------
              Tabs
          ------------------------------------------------- */}
          <SearchTabs
            filters={filters}
            setFilter={setFilter}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
          />

          {/* ------------------------------------------------
              پنل فیلترهای ساختاری
          ------------------------------------------------- */}
          <PropertyFiltersPanel
            isOpen={activePanel === "filters"}
            onClose={closePanel}
            filters={filters}
            setFilter={setFilter}
            resetFilters={resetFilters}
            getActiveFilterCount={
              getActiveFilterCount
            }
            search={search}
            isSearching={isSearching}
          />

          {/* ------------------------------------------------
              جستجوی هوشمند
          ------------------------------------------------- */}
          <SmartSearchPanel
            isOpen={activePanel === "smart"}
            onClose={closePanel}
            search={search}
            isSearching={isSearching}
          />
        </div>
      </div>

      {/* ---------------------------------------------------
          کنترل‌های نقشه
      --------------------------------------------------- */}
      <div
        className="
          absolute
          bottom-5
          left-4
          z-10
          flex
          flex-col
          gap-2
        "
      >
        {/* Zoom In */}
        <button
          type="button"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-white
            text-xl
            font-bold
            text-slate-700
            shadow-lg
            transition
            hover:bg-slate-50
          "
        >
          +
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-white
            text-xl
            font-bold
            text-slate-700
            shadow-lg
            transition
            hover:bg-slate-50
          "
        >
          −
        </button>

        {/* Location */}
        <button
          type="button"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-white
            text-lg
            text-slate-700
            shadow-lg
            transition
            hover:bg-slate-50
          "
        >
          ◎
        </button>
      </div>
    </main>
  );
}