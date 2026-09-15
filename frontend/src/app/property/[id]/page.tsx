/**
 * ============================================================
 * صفحه جزئیات ملک
 * ============================================================
 *
 * مسیر:
 *
 * /property/[id]
 *
 * اطلاعات ملک از Backend دریافت می‌شود.
 *
 * چون پروژه از:
 *
 * output: "export"
 *
 * استفاده می‌کند، شناسه ملک‌ها در زمان Build
 * از Backend دریافت شده و مسیرهای استاتیک ساخته می‌شوند.
 * ============================================================
 */

import Link from "next/link";

/**
 * ============================================================
 * نوع اطلاعات ملک
 * ============================================================
 *
 * این ساختار مطابق پاسخ فعلی:
 *
 * GET /properties/:id
 *
 * است.
 */
interface Property {
  id: string;
  propertyType: string;
  registrationSource: string;
  city: string;
  district: string;
  address: string;
  postalCode?: string | null;
  area?: number | null;
  rooms?: number | null;
  yearBuilt?: number | null;
  floor?: number | null;
  description?: string | null;
  latitudePublic?: number | null;
  longitudePublic?: number | null;
  isActive: boolean;
}

/**
 * ============================================================
 * آدرس Backend
 * ============================================================
 *
 * در Docker:
 *
 * BACKEND_INTERNAL_URL
 *    ↓
 * http://backend:4000
 *
 * در اجرای عادی روی سیستم:
 *
 * NEXT_PUBLIC_API_URL
 *    ↓
 * http://localhost:4000
 *
 * ============================================================
 */
function getBackendUrl() {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000"
  );
}

/**
 * ============================================================
 * دریافت فهرست ملک‌ها
 * ============================================================
 *
 * برای generateStaticParams استفاده می‌شود.
 */
interface PropertySearchResponse {
  count: number;
  items: Property[];
}

async function getProperties(): Promise<Property[]> {
  const response = await fetch(
    `${getBackendUrl()}/properties/search`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(
      `خطا در دریافت فهرست ملک‌ها: ${response.status}`
    );
  }

  const data: PropertySearchResponse = await response.json();

  return data.items;
}

/**
 * ============================================================
 * دریافت یک ملک
 * ============================================================
 */
async function getPropertyById(
  id: string
): Promise<Property | null> {
  const response = await fetch(
  `${getBackendUrl()}/properties/${encodeURIComponent(id)}`
);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `خطا در دریافت ملک: ${response.status}`
    );
  }

  return response.json();
}

/**
 * ============================================================
 * تبدیل نوع ملک به فارسی
 * ============================================================
 */
function getPropertyTypeLabel(
  propertyType: string
): string {
  const labels: Record<string, string> = {
    APARTMENT: "آپارتمان",
    HOUSE: "خانه",
    VILLA: "ویلا",
    LAND: "زمین",
    SHOP: "مغازه",
    OFFICE: "اداری",
    GARDEN: "باغ",
  };

  return labels[propertyType] || propertyType;
}

/**
 * ============================================================
 * نمایش قیمت
 * ============================================================
 *
 * Endpoint فعلی جزئیات ملک هنوز اطلاعات
 * PropertyListing را برنمی‌گرداند.
 *
 * بنابراین قیمت فعلاً از API موجود قابل نمایش نیست.
 * بعداً با اتصال PropertyListing تکمیل می‌شود.
 * ============================================================
 */
function getPriceLabel() {
  return "اطلاعات قیمت در مرحله بعد تکمیل می‌شود";
}

/**
 * ============================================================
 * generateStaticParams
 * ============================================================
 *
 * Static Export به این اطلاعات نیاز دارد.
 *
 * مثلاً اگر Backend این ملک‌ها را داشته باشد:
 *
 * test-map-001
 *
 * مسیر زیر هنگام Build ساخته می‌شود:
 *
 * /property/test-map-001
 * ============================================================
 */
export async function generateStaticParams() {
  const properties = await getProperties();

  return properties.map((property) => ({
    id: property.id,
  }));
}

/**
 * ============================================================
 * نوع Props صفحه
 * ============================================================
 */
interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * ============================================================
 * Property Page
 * ============================================================
 */
export default async function PropertyPage({
  params,
}: PropertyPageProps) {
  /**
   * دریافت id از URL
   */
  const { id } = await params;

  /**
   * دریافت اطلاعات واقعی ملک از Backend
   */
  const property = await getPropertyById(id);

  /**
   * اگر ملک پیدا نشد
   */
  if (!property) {
    return (
      <main
        dir="rtl"
        className="
          min-h-screen
          bg-slate-50
          px-4
          py-8
        "
      >
        <div
          className="
            mx-auto
            max-w-3xl
            border
            border-slate-200
            bg-white
            p-8
            text-center
            shadow-sm
          "
        >
          <h1
            className="
              text-xl
              font-bold
              text-slate-900
            "
          >
            ملک موردنظر پیدا نشد
          </h1>

          <p
            className="
              mt-3
              text-sm
              text-slate-500
            "
          >
            ممکن است این ملک حذف شده باشد یا
            آدرس واردشده صحیح نباشد.
          </p>

          <Link
            href="/search"
            className="
              mt-6
              inline-block
              text-sm
              font-bold
              text-brand-turquoise
              hover:text-slate-900
            "
          >
            بازگشت به جستجوی ملک
          </Link>
        </div>
      </main>
    );
  }

  /**
   * ==========================================================
   * داده‌های نمایشی
   * ==========================================================
   */

  const propertyType =
    getPropertyTypeLabel(property.propertyType);

  const location = [
    property.city,
    property.district,
  ]
    .filter(Boolean)
    .join("، ");

  const price = getPriceLabel();

  /**
   * ==========================================================
   * صفحه اصلی جزئیات ملک
   * ==========================================================
   */
  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-slate-50
        px-4
        py-5
        sm:px-6
        sm:py-8
      "
    >
      <div
        className="
          mx-auto
          max-w-5xl
        "
      >
        {/* ==================================================
            بازگشت به جستجو
           ================================================== */}
        <Link
          href="/search"
          className="
            mb-4
            inline-flex
            items-center
            gap-2
            text-sm
            font-bold
            text-slate-600
            transition-colors
            hover:text-slate-900
          "
        >
          <span>→</span>

          <span>
            بازگشت به جستجو
          </span>
        </Link>

        {/* ==================================================
            کارت اصلی ملک
           ================================================== */}
        <section
          className="
            overflow-hidden
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          {/* ==================================================
              بخش تصویر
             ================================================== */}
          <div
            className="
              flex
              min-h-[240px]
              items-center
              justify-center
              bg-slate-100
              sm:min-h-[360px]
            "
          >
            <div className="text-center text-slate-400">
              <div className="text-sm font-medium">
                تصاویر ملک
              </div>

              <div className="mt-1 text-xs">
                در مرحله بعد اضافه می‌شود
              </div>
            </div>
          </div>

          {/* ==================================================
              اطلاعات ملک
             ================================================== */}
          <div
            className="
              p-5
              sm:p-7
            "
          >
            {/* نوع ملک + شناسه */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="
                  border
                  border-slate-200
                  px-3
                  py-1
                  text-xs
                  font-bold
                  text-slate-600
                "
              >
                {propertyType}
              </span>

              {property.isActive && (
                <span
                  className="
                    border
                    border-emerald-200
                    bg-emerald-50
                    px-3
                    py-1
                    text-xs
                    font-bold
                    text-emerald-700
                  "
                >
                  فعال
                </span>
              )}
            </div>

            {/* عنوان */}
            <h1
              className="
                mt-4
                text-2xl
                font-bold
                tracking-tight
                text-slate-900
                sm:text-3xl
              "
            >
              {propertyType}
            </h1>

            {/* موقعیت */}
            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              {location}
            </p>

            {/* آدرس */}
            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              {property.address}
            </p>

            {/* ==================================================
                قیمت
               ================================================== */}
            <div
              className="
                mt-6
                border-y
                border-slate-200
                py-5
              "
            >
              <div
                className="
                  text-xs
                  text-slate-500
                "
              >
                قیمت
              </div>

              <div
                className="
                  mt-1
                  text-lg
                  font-bold
                  text-slate-900
                "
              >
                {price}
              </div>
            </div>

            {/* ==================================================
                مشخصات اصلی
               ================================================== */}
            <div
              className="
                mt-6
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-4
              "
            >
              {/* نوع ملک */}
              <div
                className="
                  border
                  border-slate-200
                  p-4
                "
              >
                <div className="text-xs text-slate-500">
                  نوع ملک
                </div>

                <div
                  className="
                    mt-1
                    text-sm
                    font-bold
                    text-slate-900
                  "
                >
                  {propertyType}
                </div>
              </div>

              {/* متراژ */}
              <div
                className="
                  border
                  border-slate-200
                  p-4
                "
              >
                <div className="text-xs text-slate-500">
                  متراژ
                </div>

                <div
                  className="
                    mt-1
                    text-sm
                    font-bold
                    text-slate-900
                  "
                >
                  {property.area != null
                    ? `${property.area} متر`
                    : "ثبت نشده"}
                </div>
              </div>

              {/* تعداد اتاق */}
              <div
                className="
                  border
                  border-slate-200
                  p-4
                "
              >
                <div className="text-xs text-slate-500">
                  اتاق
                </div>

                <div
                  className="
                    mt-1
                    text-sm
                    font-bold
                    text-slate-900
                  "
                >
                  {property.rooms != null
                    ? `${property.rooms} خواب`
                    : "ثبت نشده"}
                </div>
              </div>

              {/* سال ساخت */}
              <div
                className="
                  border
                  border-slate-200
                  p-4
                "
              >
                <div className="text-xs text-slate-500">
                  سال ساخت
                </div>

                <div
                  className="
                    mt-1
                    text-sm
                    font-bold
                    text-slate-900
                  "
                >
                  {property.yearBuilt ?? "ثبت نشده"}
                </div>
              </div>
            </div>

            {/* ==================================================
                توضیحات ملک
               ================================================== */}
            <div className="mt-7">
              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-900
                "
              >
                درباره این ملک
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  leading-7
                  text-slate-600
                "
              >
                {property.description ||
                  "توضیحی برای این ملک ثبت نشده است."}
              </p>
            </div>

            {/* ==================================================
                دکمه‌های اقدام
               ================================================== */}
            <div
              className="
                mt-8
                grid
                gap-3
                sm:grid-cols-2
              "
            >
              <button
                type="button"
                className="
                  h-12
                  border
                  border-slate-300
                  bg-white
                  text-sm
                  font-bold
                  text-slate-800
                  transition-colors
                  hover:bg-slate-50
                "
              >
                افزودن به علاقه‌مندی‌ها
              </button>

              <button
                type="button"
                className="
                  h-12
                  bg-slate-900
                  text-sm
                  font-bold
                  text-white
                  transition-colors
                  hover:bg-slate-800
                "
              >
                درخواست اطلاعات بیشتر
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}