"use client";

// ---------------------------------------------------------
// نقشه واقعی مشترک پروژه هشتی
// ---------------------------------------------------------
// این کامپوننت برای Home و Search استفاده خواهد شد.
//
// ویژگی‌های فعلی:
// - استفاده از Leaflet
// - استفاده از OpenStreetMap
// - مرکز اولیه روی شاهرود
// - واکنش‌گرا
//
// در مراحل بعد:
// - Marker ملک‌ها
// - انتخاب ملک
// - فیلتر Markerها
// - اتصال به API
// ---------------------------------------------------------

import {
  MapContainer,
  TileLayer,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

// ---------------------------------------------------------
// مختصات مرکز شاهرود
// ---------------------------------------------------------
// این مختصات تقریباً مرکز شهر شاهرود است.
// ---------------------------------------------------------
const SHAHRUD_CENTER: [number, number] = [
  36.4182,
  54.9763,
];

// ---------------------------------------------------------
// کامپوننت نقشه
// ---------------------------------------------------------
export function RealMap() {
  return (
    <div
      className="
        absolute
        inset-0
        h-full
        w-full
        overflow-hidden
      "
    >
      <MapContainer
        center={SHAHRUD_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full"
      >
        {/* -------------------------------------------------
            لایه نقشه OpenStreetMap
        -------------------------------------------------- */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}