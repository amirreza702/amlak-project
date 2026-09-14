
"use client";

import { useState } from "react";

import { usePropertySearch } from "../hooks/usePropertySearch";

import { PropertyFiltersPanel } from "./PropertyFiltersPanel";
import { SearchBar } from "./SearchBar";
import { SearchMap } from "./SearchMap";
import { SearchTabs } from "./SearchTabs";
import { SmartSearchPanel } from "./SmartSearchPanel";

export function PropertySearchPage() {
  const {
    filters,
    appliedFilters,

    /**
     * نتایج واقعی دریافت‌شده از Backend
     */
    results,

    setFilter,
    setQuickFilter,
    resetFilters,
    getActiveFilterCount,
    search,
    isSearching,
  } = usePropertySearch();

  const [activePanel, setActivePanel] =
    useState<"filters" | "smart" | null>(null);

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

      <div className="absolute bottom-4 left-4 z-[1000] bg-white p-3 text-black">
       نتایج: {results.length}
      </div>

      <SearchMap
        appliedFilters={appliedFilters}
        results={results}
      />

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
          <SearchBar
            district={filters.district}
            setDistrict={(value) =>
              setFilter("district", value)
            }
            search={search}
            isSearching={isSearching}
          />

          <SearchTabs
            filters={filters}
            setFilter={setFilter}
            setQuickFilter={setQuickFilter}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
          />

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
