"use client";

import { HomeHeader } from "./HomeHeader";
import { HomeSearchButton } from "./HomeSearchButton";
import { HomeRequestButton } from "./HomeRequestButton";
import { HomeRoleCards } from "./HomeRoleCards";
import { HomeTrustMessage } from "./HomeTrustMessage";
import { MockMap } from "./MockMap";

interface HomePageProps {
  onSearch: () => void;
}

export function HomePage({ onSearch }: HomePageProps) {
  return (
    <div
      dir="rtl"
      className="relative min-h-screen w-full overflow-visible bg-slate-100"
    >
      {/* =====================================================
          نقشه ثابت پس‌زمینه
          با اسکرول صفحه حرکت نمی‌کند
         ===================================================== */}
      <div className="pointer-events-none fixed inset-0 z-0 select-none">
        <MockMap />

        {/* لایه سفید روی نقشه */}
        <div className="absolute inset-0 bg-white/65 backdrop-blur-[2px]" />
      </div>

      {/* =====================================================
          محتوای اصلی
          ارتفاع آن باید بتواند از ارتفاع صفحه بیشتر شود
         ===================================================== */}
      <div className="relative z-10 flex min-h-screen w-full flex-col overflow-visible">
        {/* هدر */}
        <HomeHeader />

        {/* =================================================
            Main
           ================================================= */}
        <main className="flex w-full flex-1 items-start justify-center px-4 py-8 sm:px-6 sm:py-12">
          <div className="w-full max-w-lg">
            {/* عنوان */}
            <div className="mb-6 text-center">
              <p className="text-sm font-medium text-slate-500">
                ساده‌تر پیدا کنید، مطمئن‌تر معامله کنید
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                ملک مناسب خود را پیدا کنید
              </h2>
            </div>

            {/* کارت اصلی */}
            <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-md sm:p-5">
              <div className="space-y-3">
                <HomeSearchButton onSearch={onSearch} />

                <HomeRequestButton />

                <HomeRoleCards />
              </div>
            </div>

            {/* پیام اعتماد */}
            <div className="mt-4 pb-12">
              <HomeTrustMessage />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}