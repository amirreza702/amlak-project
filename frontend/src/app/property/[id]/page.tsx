
/**
 * ============================================================
 * صفحه جزئیات ملک
 * ============================================================
 *
 * مسیر:
 *
 * /property/[id]
 *
 * مثال:
 *
 * /property/property-1
 * /property/property-2
 *
 * [id] یک Dynamic Route است.
 *
 * چون پروژه با:
 *
 * output: "export"
 *
 * اجرا می‌شود، Next.js باید در زمان Build بداند
 * چه id هایی برای این Dynamic Route وجود دارند.
 *
 * به همین دلیل از generateStaticParams استفاده می‌کنیم.
 *
 * ------------------------------------------------------------
 *
 * جریان:
 *
 * /search
 *    ↓
 * کلیک روی نشانگر ملک
 *    ↓
 * Popup
 *    ↓
 * مشاهده جزئیات ملک
 *    ↓
 * /property/property-1
 *    ↓
 * دریافت id = property-1
 *    ↓
 * نمایش اطلاعات همان ملک
 *
 * ------------------------------------------------------------
 *
 * فعلاً اطلاعات ملک‌ها Mock هستند.
 * در مرحله اتصال Backend، همین قسمت به API متصل خواهد شد.
 * ============================================================
 */

import Link from "next/link";

/**
 * ============================================================
 * اطلاعات موقت ملک‌ها
 * ============================================================
 *
 * فعلاً این اطلاعات با ملک‌های موجود در RealMap هماهنگ هستند.
 *
 * بعداً این داده‌ها از Backend و Prisma دریافت خواهند شد.
 */
const MOCK_PROPERTIES = [
  {
    id: "property-1",
    title: "آپارتمان دو خوابه",
    location: "میدان امام خمینی",
    area: 120,
    rooms: 2,
    price: "۴٫۸ میلیارد",
    transaction: "فروش",
    propertyType: "آپارتمان",
    description:
      "آپارتمان دو خوابه با موقعیت مناسب و دسترسی خوب به مراکز شهری.",
  },

  {
    id: "property-2",
    title: "آپارتمان سه خوابه",
    location: "بلوار آزادی",
    area: 150,
    rooms: 3,
    price: "۶٫۲ میلیارد",
    transaction: "فروش",
    propertyType: "آپارتمان",
    description:
      "آپارتمان سه خوابه با فضای مناسب برای خانواده و دسترسی مناسب.",
  },

  {
    id: "property-3",
    title: "خانه ویلایی",
    location: "خیابان مدرس",
    area: 220,
    rooms: 3,
    price: "۷٫۵ میلیارد",
    transaction: "فروش",
    propertyType: "خانه ویلایی",
    description:
      "خانه ویلایی با متراژ مناسب و فضای مستقل در یکی از مناطق شهری.",
  },

  {
    id: "property-4",
    title: "آپارتمان یک خوابه",
    location: "بلوار امام رضا",
    area: 85,
    rooms: 1,
    price: "۳٫۱ میلیارد",
    transaction: "فروش",
    propertyType: "آپارتمان",
    description:
      "آپارتمان یک خوابه مناسب برای سکونت یا سرمایه‌گذاری.",
  },

  {
    id: "property-5",
    title: "آپارتمان دو خوابه",
    location: "خیابان دانشگاه",
    area: 130,
    rooms: 2,
    price: "۵٫۴ میلیارد",
    transaction: "فروش",
    propertyType: "آپارتمان",
    description:
      "آپارتمان دو خوابه با موقعیت مناسب در محدوده خیابان دانشگاه.",
  },
];

/**
 * ============================================================
 * generateStaticParams
 * ============================================================
 *
 * بسیار مهم:
 *
 * پروژه ما از Static Export استفاده می‌کند.
 *
 * بنابراین Next.js در زمان Build باید بداند
 * چه Dynamic Route هایی باید ساخته شوند.
 *
 * خروجی این تابع:
 *
 * [
 *   { id: "property-1" },
 *   { id: "property-2" },
 *   { id: "property-3" },
 *   { id: "property-4" },
 *   { id: "property-5" }
 * ]
 *
 * در نتیجه مسیرهای زیر ساخته می‌شوند:
 *
 * /property/property-1
 * /property/property-2
 * /property/property-3
 * /property/property-4
 * /property/property-5
 *
 * ------------------------------------------------------------
 *
 * در آینده:
 *
 * وقتی اطلاعات واقعی ملک‌ها از Backend بیاید،
 * این قسمت را بر اساس معماری جدید پروژه تغییر می‌دهیم.
 * ============================================================
 */
export function generateStaticParams() {
  return MOCK_PROPERTIES.map((property) => ({
    id: property.id,
  }));
}

/**
 * ============================================================
 * نوع Props صفحه
 * ============================================================
 *
 * در Next.js 16، params به صورت Promise دریافت می‌شود.
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
   * ----------------------------------------------------------
   * دریافت id از URL
   * ----------------------------------------------------------
   *
   * اگر URL این باشد:
   *
   * /property/property-1
   *
   * مقدار id خواهد بود:
   *
   * property-1
   */
  const { id } = await params;

  /**
   * ----------------------------------------------------------
   * پیدا کردن ملک
   * ----------------------------------------------------------
   *
   * فعلاً از داده‌های Mock استفاده می‌کنیم.
   *
   * بعداً این قسمت با Backend جایگزین خواهد شد.
   */
  const property = MOCK_PROPERTIES.find(
    (item) => item.id === id
  );

  /**
   * ----------------------------------------------------------
   * اگر ملک پیدا نشد
   * ----------------------------------------------------------
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
             ==================================================

              فعلاً سیستم تصاویر ملک ساخته نشده است.

              بنابراین فقط فضای تصویر را نگه می‌داریم.
              بعداً این قسمت به Gallery واقعی تبدیل می‌شود.
          */}
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
            {/* عنوان ملک */}
            <h1
              className="
                text-2xl
                font-bold
                tracking-tight
                text-slate-900
                sm:text-3xl
              "
            >
              {property.title}
            </h1>

            {/* موقعیت */}
            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              {property.location}
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
                  text-2xl
                  font-bold
                  text-slate-900
                "
              >
                {property.price}
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
              {/* نوع معامله */}
              <div
                className="
                  border
                  border-slate-200
                  p-4
                "
              >
                <div className="text-xs text-slate-500">
                  نوع معامله
                </div>

                <div
                  className="
                    mt-1
                    text-sm
                    font-bold
                    text-slate-900
                  "
                >
                  {property.transaction}
                </div>
              </div>

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
                  {property.propertyType}
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
                  {property.area} متر
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
                  {property.rooms} خواب
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
                {property.description}
              </p>
            </div>

            {/* ==================================================
                دکمه‌های اقدام
               ==================================================

                فعلاً فقط ظاهر اولیه هستند.

                در مراحل بعد:
                - علاقه‌مندی
                - تماس
                - درخواست بازدید
                - اشتراک‌گذاری

                را به صورت واقعی پیاده می‌کنیم.
            */}
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
