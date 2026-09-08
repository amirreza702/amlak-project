"use client";

/**
 * ============================================================
 * SearchTabs
 * ------------------------------------------------------------
 * تب‌ها و فیلترهای بالای نقشه
 *
 * شامل:
 * 1. نوع معامله
 * 2. نوع ملک
 * 3. فیلترهای دقیق
 * 4. جستجوی هوشمند
 *
 * فیلترهای دقیق و هوشمند کاملاً از هم جدا هستند.
 * ============================================================
 */

import {
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import {
  PropertySearchState,
  PropertyType,
  TransactionType,
} from "../hooks/usePropertySearch";

/**
 * ============================================================
 * Props
 * ============================================================
 */
interface SearchTabsProps {
  filters: PropertySearchState;

  setFilter: <K extends keyof PropertySearchState>(
    key: K,
    value: PropertySearchState[K]
  ) => void;

  activePanel: "filters" | "smart" | null;

  setActivePanel: (
    panel: "filters" | "smart" | null
  ) => void;
}

/**
 * ============================================================
 * انواع معامله
 * ============================================================
 */
const transactionTypes: TransactionType[] = [
  "خرید",
  "رهن",
  "اجاره",
  "رهن و اجاره",
];

/**
 * ============================================================
 * انواع ملک
 * ============================================================
 */
const propertyTypes: PropertyType[] = [
  "آپارتمان",
  "خانه",
  "ویلا",
  "زمین",
  "مغازه",
  "اداری",
  "باغ",
];

/**
 * ============================================================
 * Component
 * ============================================================
 */
export function SearchTabs({
  filters,
  setFilter,
  activePanel,
  setActivePanel,
}: SearchTabsProps) {
  /**
   * باز / بسته کردن فیلترهای دقیق
   */
  const handleFiltersClick = () => {
    if (activePanel === "filters") {
      setActivePanel(null);
    } else {
      setActivePanel("filters");
    }
  };

  /**
   * باز / بسته کردن جستجوی هوشمند
   */
  const handleSmartClick = () => {
    if (activePanel === "smart") {
      setActivePanel(null);
    } else {
      setActivePanel("smart");
    }
  };

  return (
    <div
      className="
        mt-2
        flex
        gap-2
        overflow-x-auto
        pb-1
        scrollbar-none
      "
    >
      {/* =====================================================
          نوع معامله
          ===================================================== */}
      <div className="relative shrink-0">
        <select
          value={filters.transactionType}
          onChange={(event) => {
            setFilter(
              "transactionType",
              event.target.value as TransactionType
            );
          }}
          className="
            h-10
            appearance-none
            rounded-xl
            border
            border-white/80
            bg-white/95
            px-4
            pl-9
            text-sm
            font-semibold
            text-slate-700
            shadow-lg
            outline-none
            backdrop-blur-xl
          "
        >
          {transactionTypes.map((type) => (
            <option
              key={type}
              value={type}
            >
              {type}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="
            pointer-events-none
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-slate-400
          "
        />
      </div>

      {/* =====================================================
          نوع ملک
          ===================================================== */}
      <div className="relative shrink-0">
        <select
          value={filters.propertyType}
          onChange={(event) => {
            setFilter(
              "propertyType",
              event.target.value as PropertyType
            );
          }}
          className="
            h-10
            appearance-none
            rounded-xl
            border
            border-white/80
            bg-white/95
            px-4
            pl-9
            text-sm
            font-semibold
            text-slate-700
            shadow-lg
            outline-none
            backdrop-blur-xl
          "
        >
          {propertyTypes.map((type) => (
            <option
              key={type}
              value={type}
            >
              {type}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="
            pointer-events-none
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-slate-400
          "
        />
      </div>

      {/* =====================================================
          فیلترهای دقیق
          ===================================================== */}
      <button
        type="button"
        onClick={handleFiltersClick}
        className={`
          flex
          h-10
          shrink-0
          items-center
          gap-2
          rounded-xl
          border
          px-4
          text-sm
          font-semibold
          shadow-lg
          backdrop-blur-xl
          transition

          ${
            activePanel === "filters"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-white/80 bg-white/95 text-slate-700 hover:bg-white"
          }
        `}
      >
        <SlidersHorizontal size={16} />

        <span>
          فیلترها
        </span>
      </button>

      {/* =====================================================
          جستجوی هوشمند
          ===================================================== */}
      <button
        type="button"
        onClick={handleSmartClick}
        className={`
          flex
          h-10
          shrink-0
          items-center
          gap-2
          rounded-xl
          border
          px-4
          text-sm
          font-semibold
          shadow-lg
          backdrop-blur-xl
          transition

          ${
            activePanel === "smart"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-white/80 bg-white/95 text-slate-700 hover:bg-white"
          }
        `}
      >
        <Sparkles size={16} />

        <span>
          هوشمند
        </span>
      </button>
    </div>
  );
}