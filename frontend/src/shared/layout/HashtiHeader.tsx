// فعال‌سازی رندر در سمت کلاینت برای مدیریت استیت مودال
"use client";

// وارد کردن React و هوک useState
import React, { useState } from "react";
// وارد کردن کامپوننت لینک Next.js
import Link from "next/link";
// وارد کردن کامپوننت برند هشتی
import { HashtiBrand } from "@/shared/branding/components/HashtiBrand";
// وارد کردن آیکون آدمک از کتابخانه lucide-react
import { User } from "lucide-react";
// وارد کردن مودال احراز هویت
import { AuthModal } from "@/features/agent/components/AuthModal";

// کامپوننت هدر سراسری سامانه هشتی
export const HashtiHeader: React.FC = () => {
  // استیت باز یا بسته بودن پنجره ورود
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  return (
    // نوار ناوبری بالای صفحه با پس‌زمینه سفید نیمه‌شفاف و حاشیه پایینی
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      {/* ظرف نگه‌دارنده عناصر نوار بالایی با عرض حداکثر */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* لوگو و نام هشتی در سمت راست */}
        <Link href="/" className="flex items-center gap-3">
          <HashtiBrand variant="compact" />
        </Link>

        {/* بخش دکمه ورود در سمت چپ: دکمه سفید تمیز با آیکون آدمک */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0b3158] shadow-xs transition hover:border-[#159ca8] hover:bg-slate-50 hover:text-[#159ca8] active:scale-95"
            title="حساب کاربری"
            aria-label="حساب کاربری"
          >
            {/* آیکون آدمک با ابعاد متناسب */}
            <User className="h-5 w-5" />
          </button>
        </div>

      </div>

      {/* مودال ورود با اتصال به استیت محلی */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
};
