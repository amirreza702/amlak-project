// فعال‌سازی رندر کلاینت در محیط Next.js
"use client";

// ایمپورت هوک استخراج وضعیت مشاور
import { useCurrentAgent } from "@/features/agent/hooks/useCurrentAgent";
// ایمپورت فرم ثبت اطلاعات ملک
import { PropertyForm } from "@/features/property/components/PropertyForm";
// ایمپورت بنر تصویر و عنوان بالای صفحه
import { PropertyPageHeader } from "@/features/property/components/layout/PropertyPageHeader";
// ایمپورت هدر اصلی برنامه
import { HashtiHeader } from "@/shared/layout/HashtiHeader";

// کامپوننت صفحه اصلی
export default function HomePage() {
  // دریافت وضعیت احراز هویت مشاور
  const { agent, isLoading, error } = useCurrentAgent();

  return (
    // روت اصلی صفحه با رنگ پس‌زمینه سایت
    <div className="min-h-screen bg-[#f8fafb]">
      {/* هدر سایت حاوی برند و آیکون ورود به مدال */}
      <HashtiHeader />

      {/* محتوای اصلی سایت */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div id="property" className="mx-auto max-w-5xl space-y-8">
          {/* بنر معرفی و سربرگ صفحه ثبت ملک */}
          <PropertyPageHeader
            title="ثبت ملک در هشتی"
            description="ملک خود را با اطلاعات دقیق و قابل اعتماد ثبت کنید."
          />

          {/* فرم ثبت ملک فقط در صورت تایید احراز هویت لود می‌شود و هیچ فرم ثبت‌نامی روی صفحه نیست */}
          {!isLoading && !error && agent && (
            <PropertyForm agentId={agent.id} />
          )}
        </div>
      </main>
    </div>
  );
}
