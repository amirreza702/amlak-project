"use client";

/**
 * =========================================================
 * SearchMap
 * =========================================================
 *
 * مسئولیت:
 * - نگهداری Bounds فعلی نقشه
 * - دریافت Bounds از RealMap
 * - ارسال Bounds به RealMap
 *
 * جریان:
 *
 * RealMap
 *    ↓
 * MapViewport
 *    ↓
 * onBoundsChange
 *    ↓
 * SearchMap State
 *    ↓
 * RealMap
 *    ↓
 * فیلتر Markerها
 * =========================================================
 */

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import type { MapBounds } from "@/shared/components/map/MapViewport";


/*
 * =========================================================
 * RealMap
 * =========================================================
 *
 * Leaflet فقط باید در Browser اجرا شود.
 *
 * بنابراین SSR را برای RealMap خاموش می‌کنیم.
 * =========================================================
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


/*
 * =========================================================
 * SearchMap
 * =========================================================
 */

export function SearchMap() {

  /*
   * Bounds فعلی نقشه
   *
   * ابتدا null است؛ چون هنوز نقشه Render نشده
   * و Bounds آن را نمی‌دانیم.
   */
  const [mapBounds, setMapBounds] =
    useState<MapBounds | null>(null);


  /*
   * =======================================================
   * دریافت Bounds از RealMap
   * =======================================================
   *
   * این تابع زمانی اجرا می‌شود که:
   *
   * - نقشه جابه‌جا شود
   * - Zoom تغییر کند
   *
   * MapViewport این اطلاعات را برای ما می‌فرستد.
   */

  const handleBoundsChange = useCallback(
    (bounds: MapBounds) => {
      setMapBounds(bounds);
    },
    []
  );


  /*
   * =======================================================
   * Render
   * =======================================================
   */

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
        onBoundsChange={handleBoundsChange}
      />

      {/*

        لایه بسیار ظریف روی نقشه

        pointer-events-none:
        باعث می‌شود این لایه جلوی کلیک روی
        کنترل‌ها و Markerهای نقشه را نگیرد.

      */}

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