"use client";

import { PropertySearchPanel } from "./PropertySearchPanel";
import { usePropertySearch } from "../../hooks/usePropertySearch";

export function PropertySearchPage() {
  const {
    filters,
    setFilter,
    isAdvancedOpen,
    setIsAdvancedOpen,
    search,
    isSearching,
  } = usePropertySearch();

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-y-auto bg-gray-100"
    >
      {/* هدر صفحه */}
      <header className="border-b bg-white px-5 py-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-xl font-bold text-gray-900">
            جستجوی ملک
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            محدوده، محله یا خیابان موردنظر را انتخاب کن
          </p>
        </div>
      </header>

      {/* پنل جستجو */}
      <section className="mx-auto flex max-w-7xl justify-center px-4 py-6">
        <PropertySearchPanel
          filters={filters}
          setFilter={setFilter}
          isAdvancedOpen={isAdvancedOpen}
          setIsAdvancedOpen={setIsAdvancedOpen}
          search={search}
          isSearching={isSearching}
        />
      </section>
    </main>
  );
}