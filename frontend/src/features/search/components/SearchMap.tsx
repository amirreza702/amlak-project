/**
 * ============================================================
 * SearchMap
 * ============================================================
 *
 * این کامپوننت نقشه واقعی جستجوی ملک را نمایش می‌دهد.
 *
 * وظایف:
 *
 * 1. بارگذاری RealMap در سمت Client
 * 2. دریافت محدوده فعلی نقشه
 * 3. دریافت فیلترهای اعمال‌شده
 * 4. ارسال فیلترها به RealMap
 *
 * نکته:
 *
 * فیلترها مستقیماً از فرم دریافت نمی‌شوند.
 * فقط appliedFilters دریافت می‌شود.
 *
 * بنابراین تغییر فیلترها تا قبل از زدن
 * «نمایش نتایج» روی نقشه اثر ندارد.
 * ============================================================
 */

"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import type { PropertySearchState } from "../hooks/usePropertySearch";

import type { MapBounds } from "@/shared/components/map/MapViewport";

/**
 * بارگذاری RealMap فقط در Client
 *
 * دلیل:
 * Leaflet به window نیاز دارد و نباید در SSR اجرا شود.
 */
const RealMap = dynamic(
  () =>
    import("@/shared/components/map/RealMap").then(
      (mod) => mod.RealMap
    ),
  {
    ssr: false,
  }
);

/**
 * Props مربوط به SearchMap
 */
interface SearchMapProps {
  /**
   * آخرین فیلترهایی که کاربر واقعاً اعمال کرده است.
   */
  appliedFilters: PropertySearchState;
}

export function SearchMap({
  appliedFilters,
}: SearchMapProps) {
  /**
   * محدوده فعلی نقشه
   */
  const [mapBounds, setMapBounds] =
    useState<MapBounds | null>(null);

  /**
   * -------------------------------------------------------
   * handleBoundsChange
   * -------------------------------------------------------
   *
   * دریافت محدوده جدید نقشه
   *
   * مقایسه انجام می‌دهیم تا از Update Loop جلوگیری شود.
   */
  const handleBoundsChange = useCallback(
    (bounds: MapBounds) => {
      setMapBounds((previousBounds) => {
        /**
         * اولین مقدار
         */
        if (!previousBounds) {
          return bounds;
        }

        /**
         * بررسی تغییر واقعی محدوده
         */
        const hasChanged =
          previousBounds.north !== bounds.north ||
          previousBounds.south !== bounds.south ||
          previousBounds.east !== bounds.east ||
          previousBounds.west !== bounds.west;

        /**
         * اگر محدوده تغییر نکرده،
         * همان reference قبلی را برمی‌گردانیم.
         */
        if (!hasChanged) {
          return previousBounds;
        }

        return bounds;
      });
    },
    []
  );

  return (
    <div
      className="
        absolute
        inset-0
        z-0
        overflow-hidden
      "
    >
      <RealMap
        bounds={mapBounds}
        appliedFilters={appliedFilters}
        onBoundsChange={handleBoundsChange}
      />

      {/* لایه بسیار ملایم روی نقشه */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]
          bg-white/5
        "
      />
    </div>
  );
}