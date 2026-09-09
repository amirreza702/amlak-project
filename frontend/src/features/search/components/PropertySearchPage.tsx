"use client";

/**
 * =========================================================
 * PropertySearchPage
 * =========================================================
 *
 * صفحه اصلی Feature جستجوی ملک
 *
 * وظیفه این صفحه:
 *
 * - مدیریت Layout صفحه Search
 * - نمایش SearchBar
 * - نمایش SearchTabs
 * - نمایش پنل فیلترها
 * - نمایش Smart Search
 * - نمایش نقشه
 *
 * نکته معماری:
 *
 * منطق خود نقشه در RealMap است.
 *
 * بنابراین:
 *
 * Zoom
 * Locate
 * Marker
 * Popup
 *
 * نباید در این فایل پیاده‌سازی شوند.
 * =========================================================
 */

import { useState } from "react";

import { usePropertySearch } from "../hooks/usePropertySearch";

import { PropertyFiltersPanel } from "./PropertyFiltersPanel";
import { SearchBar } from "./SearchBar";
import { SearchMap } from "./SearchMap";
import { SearchTabs } from "./SearchTabs";
import { SmartSearchPanel } from "./SmartSearchPanel";

/**
 * =========================================================
 * PropertySearchPage
 * =========================================================
 */
export function PropertySearchPage() {
  /**
   * -------------------------------------------------------
   * State و منطق Search
   * -------------------------------------------------------
   */
  const {
    filters,
    setFilter,
    resetFilters,
    getActiveFilterCount,
    search,
    isSearching,
  } = usePropertySearch();

  /**
   * -------------------------------------------------------
   * پنل فعال
   *
   * filters = پنل فیلترها
   * smart   = جستجوی هوشمند
   * null    = هیچ پنلی باز نیست
   * -------------------------------------------------------
   */
  const [activePanel, setActivePanel] =
    useState<"filters" | "smart" | null>(null);

  /**
   * -------------------------------------------------------
   * بستن پنل فعال
   * -------------------------------------------------------
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
      {/* ===================================================
          MAP
         =================================================== */}

      <SearchMap />

      {/* ===================================================
          SEARCH UI
          
          این بخش روی نقشه قرار می‌گیرد.
         =================================================== */}

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
          {/* ---------------------------------------------
              Search Bar
             --------------------------------------------- */}

          <SearchBar
            district={filters.district}
            setDistrict={(value) =>
              setFilter("district", value)
            }
          />

          {/* ---------------------------------------------
              Search Tabs
             --------------------------------------------- */}

          <SearchTabs
            filters={filters}
            setFilter={setFilter}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
          />

          {/* ---------------------------------------------
              Advanced Filters
             --------------------------------------------- */}

          <PropertyFiltersPanel
            isOpen={activePanel === "filters"}
            onClose={closePanel}
            filters={filters}
            setFilter={setFilter}
            resetFilters={resetFilters}
            getActiveFilterCount={getActiveFilterCount}
            search={search}
            isSearching={isSearching}
          />

          {/* ---------------------------------------------
              Smart Search
             --------------------------------------------- */}

          <SmartSearchPanel
            isOpen={activePanel === "smart"}
            onClose={closePanel}
            search={search}
            isSearching={isSearching}
          />
        </div>
      </div>
    </main>
  );
}