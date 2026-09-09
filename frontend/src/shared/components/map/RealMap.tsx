
"use client";

/**
 * =========================================================
 * RealMap
 * =========================================================
 *
 * نقشه واقعی پروژه با استفاده از:
 *
 * - Leaflet
 * - React Leaflet
 * - OpenStreetMap
 *
 * وظایف:
 *
 * 1. نمایش نقشه
 * 2. نمایش Markerهای ملک
 * 3. نمایش کنترل‌های نقشه
 * 4. گزارش محدوده فعلی نقشه
 *
 * =========================================================
 */

import {
  MapContainer,
  TileLayer,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { MapPropertyMarker } from "../MapPropertyMarker";

import { MapControls } from "./MapControls";

import {
  MapViewport,
  type MapBounds,
} from "./MapViewport";

/**
 * =========================================================
 * نوع اطلاعات ملک روی نقشه
 * =========================================================
 */

export interface MapProperty {
  id: string;

  title: string;

  location: string;

  area: number;

  rooms: number;

  price: string;

  latitude: number;

  longitude: number;
}

/**
 * =========================================================
 * Props نقشه
 * =========================================================
 */

interface RealMapProps {
  /**
   * زمانی که محدوده نقشه تغییر کند،
   * این callback اجرا می‌شود.
   *
   * SearchMap این اطلاعات را دریافت می‌کند
   * و در مراحل بعد به Search API خواهد داد.
   */
  onBoundsChange?: (
    bounds: MapBounds
  ) => void;
}

/**
 * =========================================================
 * مرکز پیش‌فرض نقشه
 *
 * شاهرود - میدان امام خمینی
 * =========================================================
 */

const SHAHRUD_CENTER: [number, number] = [
  36.4182,
  54.9763,
];

/**
 * =========================================================
 * داده Mock
 *
 * فعلاً اطلاعات واقعی Backend نداریم.
 *
 * در مرحله Backend این قسمت حذف می‌شود و
 * داده از Search API دریافت خواهد شد.
 * =========================================================
 */

const MOCK_PROPERTIES: MapProperty[] = [
  {
    id: "property-1",
    title: "آپارتمان دو خوابه",
    location: "میدان امام خمینی",
    area: 120,
    rooms: 2,
    price: "۴٫۸ میلیارد",
    latitude: 36.4182,
    longitude: 54.9763,
  },

  {
    id: "property-2",
    title: "آپارتمان سه خوابه",
    location: "بلوار آزادی",
    area: 150,
    rooms: 3,
    price: "۶٫۲ میلیارد",
    latitude: 36.4218,
    longitude: 54.9855,
  },

  {
    id: "property-3",
    title: "خانه ویلایی",
    location: "خیابان مدرس",
    area: 220,
    rooms: 3,
    price: "۷٫۵ میلیارد",
    latitude: 36.4108,
    longitude: 54.9682,
  },

  {
    id: "property-4",
    title: "آپارتمان یک خوابه",
    location: "بلوار امام رضا",
    area: 85,
    rooms: 1,
    price: "۳٫۱ میلیارد",
    latitude: 36.4262,
    longitude: 54.9718,
  },

  {
    id: "property-5",
    title: "آپارتمان دو خوابه",
    location: "خیابان دانشگاه",
    area: 130,
    rooms: 2,
    price: "۵٫۴ میلیارد",
    latitude: 36.4145,
    longitude: 54.9925,
  },
];

/**
 * =========================================================
 * RealMap Component
 * =========================================================
 */

export function RealMap({
  onBoundsChange,
}: RealMapProps) {
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
        {/* =================================================
            OpenStreetMap
           ================================================= */}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* =================================================
            محدوده فعلی نقشه
           =================================================
           
           این کامپوننت UI ندارد.

           فقط محدوده نقشه را بعد از:
           - حرکت
           - Zoom
           - نمایش اولیه
           
           به SearchMap گزارش می‌کند.
           ================================================= */}

        <MapViewport
          onBoundsChange={onBoundsChange}
        />

        {/* =================================================
            Markerهای املاک
           ================================================= */}

        {MOCK_PROPERTIES.map((property) => (
          <MapPropertyMarker
            key={property.id}
            property={property}
          />
        ))}

        {/* =================================================
            کنترل‌های اختصاصی نقشه
           
            این بخش را دست نزده‌ایم.
            
            بنابراین:
            + Zoom In
            - Zoom Out
            GPS
           
            همچنان فعال هستند.
           ================================================= */}

        <MapControls
          properties={MOCK_PROPERTIES}
        />
      </MapContainer>
    </div>
  );
}

