"use client";

/**
 * =========================================================
 * RealMap
 * =========================================================
 *
 * نقشه واقعی و مشترک پروژه هشتی
 *
 * استفاده در:
 * - Home
 * - Search
 * - Property
 * - سایر بخش‌های دارای نقشه
 *
 * ---------------------------------------------------------
 * قابلیت‌های فعلی:
 * - نمایش OpenStreetMap
 * - مرکز اولیه روی شاهرود
 * - نمایش Marker ملک‌ها
 * - انتخاب ملک با کلیک روی Marker
 *
 * ---------------------------------------------------------
 * قابلیت‌های آینده:
 * - دریافت ملک‌ها از API
 * - اتصال به دیتابیس
 * - فیلتر Markerها
 * - Cluster کردن Markerها
 * - نمایش موقعیت کاربر
 * - کنترل Zoom
 * - هماهنگی Map و List
 * =========================================================
 */

import {
  MapContainer,
  TileLayer,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { MapPropertyMarker } from "../MapPropertyMarker";

/**
 * =========================================================
 * نوع اطلاعات ملک روی نقشه
 * =========================================================
 *
 * فعلاً یک Type ساده برای Mock داریم.
 *
 * بعداً می‌توانیم آن را به Type اصلی Property متصل کنیم.
 * =========================================================
 */

export interface MapProperty {
  /**
   * شناسه یکتا
   */
  id: string;

  /**
   * عنوان ملک
   */
  title: string;

  /**
   * محل / محله
   */
  location: string;

  /**
   * متراژ
   */
  area: number;

  /**
   * تعداد اتاق خواب
   */
  rooms: number;

  /**
   * قیمت به صورت متن
   *
   * فعلاً برای نمایش UI است.
   */
  price: string;

  /**
   * عرض جغرافیایی
   */
  latitude: number;

  /**
   * طول جغرافیایی
   */
  longitude: number;
}

/**
 * =========================================================
 * Props نقشه
 * =========================================================
 */

interface RealMapProps {
  /**
   * زمانی که کاربر روی Marker یک ملک کلیک می‌کند،
   * این تابع اجرا می‌شود.
   *
   * اختیاری است تا RealMap بتواند در Home هم بدون
   * نیاز به مدیریت انتخاب ملک استفاده شود.
   */
  onPropertySelect?: (
    property: MapProperty
  ) => void;
}

/**
 * =========================================================
 * مرکز اولیه نقشه
 * =========================================================
 *
 * شاهرود
 * میدان امام خمینی / مرکز شهر
 * =========================================================
 */

const SHAHRUD_CENTER: [number, number] = [
  36.4182,
  54.9763,
];

/**
 * =========================================================
 * Mock Properties
 * =========================================================
 *
 * فعلاً برای تست Marker و کارت ملک استفاده می‌شوند.
 *
 * در مرحله اتصال به Backend این قسمت حذف خواهد شد
 * و اطلاعات از API دریافت می‌شود.
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
  onPropertySelect,
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
      {/* ===================================================
          Leaflet Map
          =================================================== */}

      <MapContainer
        center={SHAHRUD_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full"
      >
        {/* =================================================
            OpenStreetMap Tiles
            ================================================= */}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* =================================================
            Property Markers
            =================================================
            
            فعلاً از Mock Properties استفاده می‌کنیم.
            
            بعداً:
            
            properties.map(...)
            
            از API دریافت خواهد شد.
        ================================================= */}

        {MOCK_PROPERTIES.map((property) => (
          <MapPropertyMarker
            key={property.id}
            property={property}
            onSelect={onPropertySelect}
          />
        ))}
      </MapContainer>
    </div>
  );
}