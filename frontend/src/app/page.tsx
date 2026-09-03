// src/app/page.tsx
"use client";

import { useCurrentAgent } from "@/features/auth/hooks/useCurrentAgent";
import { PropertyForm } from "@/features/property/components/PropertyForm";
import { PropertyPageHeader } from "@/features/property/components/layout/PropertyPageHeader";
import { HashtiHeader } from "@/shared/layout/HashtiHeader";

export default function Home() {
  // دریافت وضعیت نشست کاربر و تابع بازخوانی
  const { agent, isLoading, error, refetch } = useCurrentAgent();

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* اتصال مستقیم کال‌بک ورود به متد refetch */}
      <HashtiHeader onAuthSuccess={refetch} />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <PropertyPageHeader
          title="ثبت ملک جدید"
          description="اطلاعات ملک خود را جهت بررسی و انتشار در سامانه هوشمند هشتی وارد کنید."
        />

        {isLoading && (
          <div className="mt-8 text-center text-gray-500">
            در حال بررسی وضعیت نشست کاربری...
          </div>
        )}

        {!isLoading && error && (
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
            <p className="font-medium">برای ثبت ملک، لطفاً ابتدا از منوی بالای صفحه وارد حساب کاربری خود شوید.</p>
          </div>
        )}

        {!isLoading && !error && agent && (
          <div className="mt-8">
            <PropertyForm agentId={agent.id} />
          </div>
        )}
      </div>
    </main>
  );
}
