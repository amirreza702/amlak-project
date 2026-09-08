"use client";

/**
 * ============================================================
 * PropertySearchPage
 * ------------------------------------------------------------
 * صفحه اصلی جستجوی ملک
 *
 * ساختار:
 *
 *                 نقشه تمام صفحه
 *
 *          ┌─────────────────────────┐
 *          │      نوار جستجو         │
 *          └─────────────────────────┘
 *
 *       خرید | آپارتمان | فیلترها | هوشمند
 *
 *              ┌─────────────────┐
 *              │ پنل فعال        │
 *              └─────────────────┘
 *
 * نقشه در تمام صفحه باقی می‌ماند.
 * ============================================================
 */

import { useState } from "react";

import { usePropertySearch } from "../hooks/usePropertySearch";

import { SearchBar } from "./SearchBar";
import { SearchMap } from "./SearchMap";
import { SearchTabs } from "./SearchTabs";
import { SmartSearchPanel } from "./SmartSearchPanel";
import { PropertyFiltersPanel } from "./PropertyFiltersPanel";

export function PropertySearchPage() {
  /**
   * ==========================================================
   * منطق جستجوی فعلی
   * ==========================================================
   */
  const {
    filters,
    setFilter,
    search,
    isSearching,
  } = usePropertySearch();

  /**
   * ==========================================================
   * پنل باز فعلی
   *
   * فقط یکی از این دو پنل می‌تواند باز باشد:
   *
   * filters
   * smart
   * null
   * ==========================================================
   */
  const [activePanel, setActivePanel] = useState<
    "filters" | "smart" | null
  >(null);

  /**
   * ==========================================================
   * خروج از پنل
   * ==========================================================
   */
  const closePanel = () => {
    setActivePanel(null);
  };

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
      {/* =====================================================
          نقشه
          ===================================================== */}
      <SearchMap />

      {/* =====================================================
          لایه بالایی
          ===================================================== */}
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
        <div className="pointer-events-auto w-full max-w-4xl">

          {/* =================================================
              نوار اصلی جستجو
              ================================================= */}
          <SearchBar
            district={filters.district}
            setDistrict={(value) =>
              setFilter("district", value)
            }
          />

          {/* =================================================
              تب‌ها
              ================================================= */}
          <SearchTabs
            filters={filters}
            setFilter={setFilter}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
          />

          {/* =================================================
              پنل فیلترهای دقیق
              ================================================= */}
          <PropertyFiltersPanel
            isOpen={activePanel === "filters"}
            onClose={closePanel}
          />

          {/* =================================================
              پنل جستجوی هوشمند
              ================================================= */}
          <SmartSearchPanel
            isOpen={activePanel === "smart"}
            onClose={closePanel}
            search={search}
            isSearching={isSearching}
          />
        </div>
      </div>

      {/* =====================================================
          کنترل‌های نقشه
          ===================================================== */}
      <div
        className="
          absolute
          bottom-5
          left-4
          z-10
          flex
          flex-col
          gap-2
          sm:bottom-6
          sm:left-6
        "
      >
        {/* بزرگنمایی */}
        <button
          type="button"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-white/80
            bg-white/90
            text-xl
            font-semibold
            text-slate-700
            shadow-lg
            backdrop-blur
            transition
            hover:bg-white
          "
          aria-label="بزرگنمایی"
        >
          +
        </button>

        {/* کوچکنمایی */}
        <button
          type="button"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-white/80
            bg-white/90
            text-xl
            font-semibold
            text-slate-700
            shadow-lg
            backdrop-blur
            transition
            hover:bg-white
          "
          aria-label="کوچکنمایی"
        >
          −
        </button>

        {/* موقعیت فعلی */}
        <button
          type="button"
          className="
            mt-1
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-white/80
            bg-white/90
            text-slate-700
            shadow-lg
            backdrop-blur
            transition
            hover:bg-white
          "
          aria-label="موقعیت فعلی"
        >
          ◎
        </button>
      </div>
    </main>
  );
}