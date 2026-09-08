
"use client";

/**
 * ============================================================
 * SearchMap
 * ============================================================
 *
 * نقشه پس‌زمینه Search
 *
 * فعلاً از MockMap موجود پروژه استفاده می‌کنیم.
 *
 * بعداً این کامپوننت محل اتصال Map واقعی خواهد بود.
 *
 * مثلاً:
 *
 *     Leaflet
 *     Mapbox
 *     Google Maps
 *     OpenStreetMap
 *
 * ============================================================
 */

import { MockMap } from "@/shared/components/MockMap";

export function SearchMap() {
  return (
    <div
      className="
        absolute
        inset-0
        overflow-hidden
      "
    >
      {/* نقشه */}
      <div className="absolute inset-0">
        <MockMap />
      </div>

      {/* ------------------------------------------------------
          لایه بسیار ملایم برای خوانایی Search Bar
          ------------------------------------------------------ */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-white/5
        "
      />
    </div>
  );
}

