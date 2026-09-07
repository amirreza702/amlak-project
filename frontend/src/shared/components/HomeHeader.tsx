
"use client";

import Image from "next/image";
import { Sparkles, ChevronLeft } from "lucide-react";

export function HomeHeader() {
  return (
    <header
      className="
        relative
        z-20
        flex
        items-center
        justify-between
        px-5
        pt-4
        pb-2
        sm:px-8
        sm:pt-6
      "
    >
      {/* =====================================================
          بخش لوگو و برند
         ===================================================== */}
      <div className="flex items-center gap-3">
        {/* لوگو */}
        <div
          className="
            relative
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            bg-white
            p-1.5
            shadow-sm
            ring-1
            ring-slate-100
          "
        >
          <Image
            src="/hashti-logo.png"
            alt="هشتی"
            width={34}
            height={34}
            priority
            className="object-contain"
          />
        </div>

        {/* نام و شعار */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black tracking-tight text-[#043873]">
              هشتی
            </span>
          </div>

          <span className="text-[11px] font-medium text-slate-500">
            سامانه شفاف معاملات ملک
          </span>
        </div>
      </div>

      {/* =====================================================
          دکمه نسخه هوشمند

          قبلاً یک div و span صرفاً نمایشی بود.

          حالا یک button واقعی است تا بعداً بتوانیم قابلیت
          «نسخه هوشمند» را به آن متصل کنیم.
         ===================================================== */}
      <button
        type="button"
        aria-label="نسخه هوشمند"
        className="
          group
          flex
          items-center
          gap-2
          rounded-full
          border
          border-[#4F9CF9]/20
          bg-white/90
          px-3
          py-2
          text-xs
          font-bold
          text-[#043873]
          shadow-sm
          backdrop-blur-md
          transition-all
          duration-200
          hover:border-[#4F9CF9]/40
          hover:bg-white
          hover:shadow-md
          active:scale-95
          focus-visible:outline-none
          focus-visible:ring-4
          focus-visible:ring-[#4F9CF9]/20
        "
      >
        {/* آیکون هوشمندی */}
        <span
          className="
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full
            bg-[#4F9CF9]/10
            transition-transform
            duration-200
            group-hover:scale-110
          "
        >
          <Sparkles
            className="h-3.5 w-3.5 text-[#4F9CF9]"
            aria-hidden="true"
          />
        </span>

        {/* متن */}
        <span className="whitespace-nowrap">
          نسخه هوشمند
        </span>

        {/* فلش برای القای قابل کلیک بودن */}
        <ChevronLeft
          className="
            h-3.5
            w-3.5
            text-slate-400
            transition-transform
            duration-200
            group-hover:-translate-x-0.5
          "
          aria-hidden="true"
        />
      </button>
    </header>
  );
}

