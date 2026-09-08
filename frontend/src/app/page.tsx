"use client";

import { HomeHeader } from "@/shared/components/HomeHeader";
import { HomeSearchButton } from "@/shared/components/HomeSearchButton";
import { HomeRequestButton } from "@/shared/components/HomeRequestButton";
import { HomeRoleCards } from "@/shared/components/HomeRoleCards";
import { HomeTrustMessage } from "@/shared/components/HomeTrustMessage";
import { MockMap } from "@/shared/components/MockMap";

export default function Page() {
  return (
    <div
      dir="rtl"
      className="
        relative
        min-h-screen
        w-full
        overflow-visible
        bg-slate-100
      "
    >
      {/* ======================================================
          نقشه پس‌زمینه
          ====================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-0
          select-none
        "
      >
        <MockMap />

        {/* لایه سفید شفاف روی نقشه */}
        <div
          className="
            absolute
            inset-0
            bg-white/65
            backdrop-blur-[2px]
          "
        />
      </div>

      {/* ======================================================
          محتوای اصلی Home
          ====================================================== */}

      <div
        className="
          relative
          z-10
          flex
          min-h-screen
          w-full
          flex-col
          overflow-visible
        "
      >
        {/* Header */}
        <HomeHeader />

        {/* Main */}
        <main
          className="
            flex
            w-full
            flex-1
            items-start
            justify-center
            px-4
            py-6
            sm:px-6
            sm:py-10
            lg:px-8
            lg:py-12
          "
        >
          <div
            className="
              w-full
              max-w-2xl
              sm:max-w-3xl
              lg:max-w-5xl
            "
          >
            {/* =================================================
                عنوان Home
                ================================================= */}

            <div
              className="
                mb-6
                text-center
                sm:mb-7
              "
            >
              <p
                className="
                  text-sm
                  font-medium
                  text-slate-500
                  sm:text-base
                "
              >
                ساده‌تر پیدا کنید، مطمئن‌تر معامله کنید
              </p>

              <h2
                className="
                  mt-2
                  text-2xl
                  font-black
                  tracking-tight
                  text-slate-900
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                ملک مناسب خود را پیدا کنید
              </h2>
            </div>

            {/* =================================================
                پنل اصلی
                ================================================= */}

            <div
              className="
                rounded-2xl
                border
                border-slate-200/90
                bg-white/95
                p-4
                shadow-[0_18px_50px_rgba(15,23,42,0.12)]
                backdrop-blur-md
                sm:p-6
                lg:p-7
              "
            >
              <div className="space-y-3 sm:space-y-4">

                {/* ورود به Search */}
                <HomeSearchButton />

                {/* ورود به Request */}
                <HomeRequestButton />

                {/* نقش‌های کاربر */}
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