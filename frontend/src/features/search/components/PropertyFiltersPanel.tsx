"use client";

/**
 * ============================================================
 * PropertyFiltersPanel
 * ------------------------------------------------------------
 * پنل فیلترهای دقیق جستجوی ملک
 *
 * این پنل برای اطلاعات ساختاریافته است.
 *
 * مثال:
 * - تعداد اتاق
 * - قیمت
 * - متراژ
 * - پارکینگ
 * - حمام
 * - سن بنا
 * - طبقه
 * - امکانات
 * - وضعیت سند
 *
 * جستجوی طبیعی و توصیفی در اینجا قرار ندارد.
 * آن بخش در SmartSearchPanel است.
 * ============================================================
 */

import {
  Car,
  Check,
  DoorOpen,
  FileCheck2,
  Home,
  ParkingSquare,
  Ruler,
  Sparkles,
  Warehouse,
} from "lucide-react";

interface PropertyFiltersPanelProps {
  isOpen: boolean;

  onClose: () => void;
}

/**
 * گزینه‌های تعداد اتاق
 */
const roomOptions = [
  "مهم نیست",
  "بدون اتاق",
  "۱ اتاق",
  "۲ اتاق",
  "۳ اتاق",
  "۴ اتاق",
  "۵ اتاق و بیشتر",
];

/**
 * گزینه‌های تعداد پارکینگ
 */
const parkingOptions = [
  "مهم نیست",
  "بدون پارکینگ",
  "۱",
  "۲",
  "۳ و بیشتر",
];

/**
 * گزینه‌های حمام
 */
const bathroomOptions = [
  "مهم نیست",
  "۱",
  "۲",
  "۳ و بیشتر",
];

/**
 * گزینه‌های سن بنا
 */
const ageOptions = [
  "مهم نیست",
  "نوساز",
  "۱ تا ۵ سال",
  "۶ تا ۱۰ سال",
  "۱۱ تا ۲۰ سال",
  "بیش از ۲۰ سال",
];

export function PropertyFiltersPanel({
  isOpen,
  onClose,
}: PropertyFiltersPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
        mt-2
        max-h-[calc(100dvh-150px)]
        overflow-y-auto
        rounded-2xl
        border
        border-white/80
        bg-white/95
        shadow-2xl
        backdrop-blur-2xl
      "
    >
      {/* =====================================================
          Header
          ===================================================== */}
      <div
        className="
          sticky
          top-0
          z-10
          flex
          items-center
          justify-between
          border-b
          border-slate-100
          bg-white/95
          px-4
          py-3
          backdrop-blur-xl
        "
      >
        <div className="flex items-center gap-2">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-slate-900
              text-white
            "
          >
            <Sparkles size={17} />
          </div>

          <div>
            <div className="text-sm font-bold text-slate-900">
              فیلترهای ملک
            </div>

            <div className="text-[11px] text-slate-500">
              مشخصات دقیق ملک را انتخاب کنید
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            rounded-lg
            px-3
            py-1.5
            text-xs
            font-semibold
            text-slate-500
            hover:bg-slate-100
          "
        >
          بستن
        </button>
      </div>

      <div className="space-y-6 p-4">

        {/* ===================================================
            تعداد اتاق
            =================================================== */}
        <FilterSection
          icon={<DoorOpen size={17} />}
          title="تعداد اتاق"
        >
          <div className="flex flex-wrap gap-2">
            {roomOptions.map((item, index) => (
              <FilterChip
                key={item}
                label={item}
                active={index === 0}
              />
            ))}
          </div>
        </FilterSection>

        {/* ===================================================
            قیمت
            =================================================== */}
        <FilterSection
          icon={<Home size={17} />}
          title="قیمت"
        >
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="حداقل قیمت"
              className="
                h-11
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                outline-none
                focus:border-slate-400
                focus:bg-white
              "
            />

            <input
              type="text"
              inputMode="numeric"
              placeholder="حداکثر قیمت"
              className="
                h-11
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                outline-none
                focus:border-slate-400
                focus:bg-white
              "
            />
          </div>
        </FilterSection>

        {/* ===================================================
            متراژ
            =================================================== */}
        <FilterSection
          icon={<Ruler size={17} />}
          title="متراژ"
        >
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="حداقل متر"
              className="
                h-11
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                outline-none
                focus:border-slate-400
                focus:bg-white
              "
            />

            <input
              type="number"
              placeholder="حداکثر متر"
              className="
                h-11
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                outline-none
                focus:border-slate-400
                focus:bg-white
              "
            />
          </div>
        </FilterSection>

        {/* ===================================================
            پارکینگ
            =================================================== */}
        <FilterSection
          icon={<ParkingSquare size={17} />}
          title="پارکینگ"
        >
          <div className="flex flex-wrap gap-2">
            {parkingOptions.map((item, index) => (
              <FilterChip
                key={item}
                label={item}
                active={index === 0}
              />
            ))}
          </div>
        </FilterSection>

        {/* ===================================================
            حمام
            =================================================== */}
        <FilterSection
          icon={<Warehouse size={17} />}
          title="تعداد حمام"
        >
          <div className="flex flex-wrap gap-2">
            {bathroomOptions.map((item, index) => (
              <FilterChip
                key={item}
                label={item}
                active={index === 0}
              />
            ))}
          </div>
        </FilterSection>

        {/* ===================================================
            سن بنا
            =================================================== */}
        <FilterSection
          icon={<Home size={17} />}
          title="سن بنا"
        >
          <div className="flex flex-wrap gap-2">
            {ageOptions.map((item, index) => (
              <FilterChip
                key={item}
                label={item}
                active={index === 0}
              />
            ))}
          </div>
        </FilterSection>

        {/* ===================================================
            امکانات
            =================================================== */}
        <FilterSection
          icon={<Car size={17} />}
          title="امکانات"
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <CheckOption label="آسانسور" />
            <CheckOption label="پارکینگ" />
            <CheckOption label="انباری" />
            <CheckOption label="بالکن" />
            <CheckOption label="حیاط" />
            <CheckOption label="استخر" />
          </div>
        </FilterSection>

        {/* ===================================================
            وضعیت سند
            =================================================== */}
        <FilterSection
          icon={<FileCheck2 size={17} />}
          title="وضعیت سند و مدارک"
        >
          <div className="grid gap-2">
            <CheckOption label="سند تک‌برگ" />
            <CheckOption label="اعتبار مدارک تأیید شده" />
            <CheckOption label="قابل معامله" />
          </div>
        </FilterSection>

        {/* ===================================================
            دکمه اعمال
            =================================================== */}
        <div
          className="
            sticky
            bottom-0
            -mx-4
            -mb-4
            border-t
            border-slate-100
            bg-white/95
            p-4
            backdrop-blur-xl
          "
        >
          <button
            type="button"
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-slate-900
              px-4
              py-3
              text-sm
              font-bold
              text-white
              shadow-lg
              transition
              hover:bg-slate-800
            "
          >
            <Check size={17} />
            اعمال فیلترها
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   بخش فیلتر
   ============================================================ */

function FilterSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-slate-500">
          {icon}
        </span>

        <h3 className="text-sm font-bold text-slate-800">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

/* ============================================================
   دکمه انتخابی
   ============================================================ */

function FilterChip({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`
        rounded-xl
        border
        px-3
        py-2
        text-xs
        font-medium
        transition

        ${
          active
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }
      `}
    >
      {label}
    </button>
  );
}

/* ============================================================
   گزینه تیک‌دار
   ============================================================ */

function CheckOption({
  label,
}: {
  label: string;
}) {
  return (
    <label
      className="
        flex
        cursor-pointer
        items-center
        gap-2
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3
        py-3
        text-xs
        text-slate-700
        transition
        hover:bg-slate-50
      "
    >
      <input
        type="checkbox"
        className="
          h-4
          w-4
          rounded
          border-slate-300
        "
      />

      <span>{label}</span>
    </label>
  );
}