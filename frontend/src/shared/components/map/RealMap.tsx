"use client";

/**
 * ============================================================
 * RealMap
 * ============================================================
 *
 * نقشه واقعی جستجوی ملک
 *
 * وظایف:
 *
 * 1. نمایش نقشه Leaflet
 * 2. نمایش محدوده فعلی نقشه
 * 3. نمایش ملک‌ها روی نقشه
 * 4. دریافت فیلترهای اعمال‌شده
 * 5. حذف ملک‌های نامنطبق با فیلترها
 *
 * ============================================================
 */

import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  TileLayer,
} from "react-leaflet";

import type { PropertySearchState } from "@/features/search/hooks/usePropertySearch";

import { MapPropertyMarker } from "../MapPropertyMarker";
import { MapControls } from "./MapControls";
import {
  MapViewport,
  type MapBounds,
} from "./MapViewport";

/**
 * ============================================================
 * نوع ملک روی نقشه
 * ============================================================
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

  /**
   * اطلاعاتی که در مراحل بعد برای فیلترهای تخصصی
   * استفاده خواهند شد.
   */
  transactionType?: string;

  propertyType?: string;

  priceValue?: number;

  bathrooms?: number;
}

/**
 * ============================================================
 * مرکز اولیه نقشه
 * ============================================================
 */
const SHAHRUD_CENTER: [number, number] = [
  36.4182,
  54.9763,
];

/**
 * ============================================================
 * ملک‌های آزمایشی
 * ============================================================
 *
 * فعلاً داده واقعی از Backend نداریم.
 *
 * بنابراین این داده‌ها برای تست رفتار Search استفاده می‌شوند.
 * بعداً همین ساختار از API دریافت خواهد شد.
 * ============================================================
 */
const MOCK_PROPERTIES: MapProperty[] = [
  {
    id: "property-1",
    title: "آپارتمان دو خوابه",
    location: "میدان امام خمینی",
    area: 120,
    rooms: 2,
    price: "۴٫۸ میلیارد",
    priceValue: 4.8,
    latitude: 36.4182,
    longitude: 54.9763,
    transactionType: "خرید",
    propertyType: "آپارتمان",
  },

  {
    id: "property-2",
    title: "آپارتمان سه خوابه",
    location: "بلوار آزادی",
    area: 150,
    rooms: 3,
    price: "۶٫۲ میلیارد",
    priceValue: 6.2,
    latitude: 36.4218,
    longitude: 54.9855,
    transactionType: "خرید",
    propertyType: "آپارتمان",
  },

  {
    id: "property-3",
    title: "خانه ویلایی",
    location: "خیابان مدرس",
    area: 220,
    rooms: 3,
    price: "۷٫۵ میلیارد",
    priceValue: 7.5,
    latitude: 36.4108,
    longitude: 54.9682,
    transactionType: "خرید",
    propertyType: "خانه",
  },

  {
    id: "property-4",
    title: "آپارتمان یک خوابه",
    location: "بلوار امام رضا",
    area: 85,
    rooms: 1,
    price: "۳٫۱ میلیارد",
    priceValue: 3.1,
    latitude: 36.4262,
    longitude: 54.9718,
    transactionType: "خرید",
    propertyType: "آپارتمان",
  },

  {
    id: "property-5",
    title: "آپارتمان دو خوابه",
    location: "خیابان دانشگاه",
    area: 130,
    rooms: 2,
    price: "۵٫۴ میلیارد",
    priceValue: 5.4,
    latitude: 36.4145,
    longitude: 54.9925,
    transactionType: "خرید",
    propertyType: "آپارتمان",
  },
];

/**
 * ============================================================
 * Props
 * ============================================================
 */
interface RealMapProps {
  /**
   * محدوده فعلی نقشه
   */
  bounds?: MapBounds | null;

  /**
   * فیلترهایی که کاربر با «نمایش نتایج» اعمال کرده است.
   */
  appliedFilters?: PropertySearchState;

  /**
   * اطلاع دادن محدوده جدید نقشه به SearchMap
   */
  onBoundsChange?: (bounds: MapBounds) => void;
}

/**
 * ============================================================
 * RealMap
 * ============================================================
 */
export function RealMap({
  bounds,
  appliedFilters,
  onBoundsChange,
}: RealMapProps) {
  /**
   * ----------------------------------------------------------
   * فیلتر کردن ملک‌ها
   * ----------------------------------------------------------
   */
  const filteredProperties = MOCK_PROPERTIES.filter(
    (property) => {
      /**
       * -----------------------------------------------
       * جستجوی محله / آدرس
       * -----------------------------------------------
       *
       * مقدار واردشده در نوار جستجو در district قرار می‌گیرد.
       *
       * اگر district خالی باشد:
       *   هیچ فیلتری اعمال نمی‌شود.
       *
       * اگر district مقدار داشته باشد:
       *   فقط ملک‌هایی نمایش داده می‌شوند که location
       *   شامل عبارت جستجو باشد.
       */
      if (
        appliedFilters?.district?.trim() &&
        !property.location.includes(
          appliedFilters.district.trim()
        )
      ) {
        return false;
      }

      /**
       * -----------------------------------------------
       * نوع معامله
       * -----------------------------------------------
       */
      if (
        appliedFilters?.transactionType &&
        property.transactionType !==
          appliedFilters.transactionType
      ) {
        return false;
      }

      /**
       * -----------------------------------------------
       * نوع ملک
       * -----------------------------------------------
       */
      if (
        appliedFilters?.propertyType &&
        property.propertyType !==
          appliedFilters.propertyType
      ) {
        return false;
      }

      /**
       * -----------------------------------------------
       * حداقل متراژ
       * -----------------------------------------------
       */
      if (
        appliedFilters?.minArea &&
        property.area <
          Number(appliedFilters.minArea)
      ) {
        return false;
      }

      /**
       * -----------------------------------------------
       * حداکثر متراژ
       * -----------------------------------------------
       */
      if (
        appliedFilters?.maxArea &&
        property.area >
          Number(appliedFilters.maxArea)
      ) {
        return false;
      }

      /**
       * -----------------------------------------------
       * تعداد اتاق
       * -----------------------------------------------
       *
       * اگر کاربر مثلاً 3+ انتخاب کند،
       * ملک‌های سه اتاقه و بیشتر نمایش داده می‌شوند.
       */
      if (appliedFilters?.rooms) {
        const roomsFilter =
          appliedFilters.rooms;

        if (
          roomsFilter.endsWith("+")
        ) {
          const minimumRooms = Number(
            roomsFilter.replace("+", "")
          );

          if (property.rooms < minimumRooms) {
            return false;
          }
        } else {
          if (
            property.rooms !==
            Number(roomsFilter)
          ) {
            return false;
          }
        }
      }

      /**
       * -----------------------------------------------
       * حداقل قیمت
       * -----------------------------------------------
       */
      if (
        appliedFilters?.minPrice &&
        property.priceValue !== undefined &&
        property.priceValue <
          Number(appliedFilters.minPrice)
      ) {
        return false;
      }

      /**
       * -----------------------------------------------
       * حداکثر قیمت
       * -----------------------------------------------
       */
      if (
        appliedFilters?.maxPrice &&
        property.priceValue !== undefined &&
        property.priceValue >
          Number(appliedFilters.maxPrice)
      ) {
        return false;
      }

      /**
       * اگر هیچ‌کدام از فیلترها ملک را حذف نکردند،
       * این ملک معتبر است.
       */
      return true;
    }
  );

  /**
   * ----------------------------------------------------------
   * فیلتر محدوده نقشه
   * ----------------------------------------------------------
   *
   * بعد از فیلترهای Search، فقط ملک‌هایی که در محدوده
   * فعلی نقشه هستند نمایش داده می‌شوند.
   */
  const visibleProperties =
    bounds
      ? filteredProperties.filter((property) => {
          return (
            property.latitude >= bounds.south &&
            property.latitude <= bounds.north &&
            property.longitude >= bounds.west &&
            property.longitude <= bounds.east
          );
        })
      : filteredProperties;

  return (
    <MapContainer
      center={SHAHRUD_CENTER}
      zoom={13}
      scrollWheelZoom={true}
      zoomControl={false}
      className="h-full w-full"
    >
      {/* نقشه OpenStreetMap */}
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* محدوده فعلی نقشه */}
      <MapViewport
        onBoundsChange={onBoundsChange}
      />

      {/* کنترل‌های نقشه */}
      <MapControls
        properties={visibleProperties}
      />

      {/* ======================================================
          مارکرهای ملک

          فقط ملک‌هایی که هم:
          1. فیلترهای Search را پاس کرده‌اند
          2. داخل محدوده فعلی نقشه هستند

          نمایش داده می‌شوند.
          ====================================================== */}
      {visibleProperties.map((property) => (
        <MapPropertyMarker
          key={property.id}
          property={property}
        />
      ))}
    </MapContainer>
  );
}