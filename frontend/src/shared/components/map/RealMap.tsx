"use client";

/**
 * =========================================================
 * RealMap
 * =========================================================
 *
 * نقشه واقعی پروژه هشتی
 *
 * مسئولیت‌ها:
 * 1. ساخت نقشه Leaflet
 * 2. نمایش OpenStreetMap
 * 3. نمایش Markerهای ملک
 * 4. دریافت Bounds نقشه
 * 5. فیلتر کردن ملک‌ها بر اساس Bounds
 * 6. نمایش کنترل‌های نقشه
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


/*
 * =========================================================
 * مدل ملک
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


/*
 * =========================================================
 * Props
 * =========================================================
 */

interface RealMapProps {

  /*
   * Bounds فعلی که SearchMap نگهداری می‌کند.
   */
  bounds?: MapBounds | null;

  /*
   * وقتی Bounds نقشه تغییر کرد،
   * آن را به SearchMap اعلام می‌کنیم.
   */
  onBoundsChange?: (
    bounds: MapBounds
  ) => void;
}


/*
 * =========================================================
 * مرکز اولیه شاهرود
 * =========================================================
 */

const SHAHRUD_CENTER: [
  number,
  number
] = [
  36.4182,
  54.9763,
];


/*
 * =========================================================
 * داده آزمایشی ملک‌ها
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


/*
 * =========================================================
 * RealMap
 * =========================================================
 */

export function RealMap({
  bounds,
  onBoundsChange,
}: RealMapProps) {


  /*
   * =======================================================
   * فیلتر ملک‌ها
   * =======================================================
   *
   * اگر هنوز Bounds دریافت نشده:
   *
   * همه ملک‌ها را نمایش می‌دهیم.
   *
   * بعد از دریافت Bounds:
   *
   * فقط ملک‌هایی که داخل محدوده هستند
   * باقی می‌مانند.
   */

  const visibleProperties =
    bounds === null || bounds === undefined
      ? MOCK_PROPERTIES
      : MOCK_PROPERTIES.filter(
          (property) => {

            /*
             * محدوده شمالی
             */
            const insideNorth =
              property.latitude <= bounds.north;

            /*
             * محدوده جنوبی
             */
            const insideSouth =
              property.latitude >= bounds.south;

            /*
             * محدوده شرقی
             */
            const insideEast =
              property.longitude <= bounds.east;

            /*
             * محدوده غربی
             */
            const insideWest =
              property.longitude >= bounds.west;


            /*
             * ملک زمانی داخل محدوده است که
             * هر چهار شرط برقرار باشند.
             */

            return (
              insideNorth &&
              insideSouth &&
              insideEast &&
              insideWest
            );
          }
        );


  /*
   * =======================================================
   * Map
   * =======================================================
   */

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
            Tileهای OpenStreetMap
            ================================================= */}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* =================================================
            مدیریت Bounds نقشه
            ================================================= */}

        <MapViewport
          onBoundsChange={onBoundsChange}
        />


        {/* =================================================
            Markerهای قابل مشاهده
            =================================================
            
            فقط propertyهایی که داخل Bounds هستند
            Render می‌شوند.
            ================================================= */}

        {visibleProperties.map(
          (property) => (
            <MapPropertyMarker
              key={property.id}
              property={property}
            />
          )
        )}


        {/* =================================================
            کنترل‌های نقشه
            ================================================= */}

        <MapControls
          properties={visibleProperties}
        />

      </MapContainer>

    </div>
  );
}