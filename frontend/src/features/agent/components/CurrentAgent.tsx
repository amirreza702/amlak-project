// فعال‌سازی حالت سمت کلاینت ری‌اکت
"use client";

// ایمپورت هوک‌ها و ری‌اکت
import React, { useState } from "react";
// ایمپورت هوک احراز هویت
import { useCurrentAgent } from "../hooks/useCurrentAgent";

// ویژگی‌های ورودی کامپوننت در صورت نیاز به همگام‌سازی بیرونی
interface CurrentAgentProps {
  onAgentLoaded?: (agentId: string | null) => void;
}

// کامپوننت نمایش مشخصات مشاور / فرم ورود
export const CurrentAgent: React.FC<CurrentAgentProps> = () => {
  // دریافت وضعیت‌ها و متدهای لاگین/خروج از هوک
  const { agent, isLoading, error, login, logout } = useCurrentAgent();

  // فیلدهای ورودی فرم ورود
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // مدیریت ارسال فرم ورود
  const handleSubmitLogin = async (e: React.FormEvent) => {
    // جلوگیری از رفرش صفحه
    e.preventDefault();
    // پاکسازی خطای قبلی
    setFormError(null);
    // فعال کردن لودینگ دکمه
    setIsSubmitting(true);

    try {
      // تلاش برای لاگین
      await login(mobile, password);
    } catch (err: any) {
      // نمایش پیام خطای برگشتی از بک‌اند
      setFormError(err?.message || "خطا در ورود به حساب");
    } finally {
      // غیرفعال کردن لودینگ
      setIsSubmitting(false);
    }
  };

  // حالت در حال بارگذاری اولیه
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
        در حال بررسی وضعیت حساب مشاور...
      </div>
    );
  }

  // اگر مشاور وارد شده است -> نمایش کارت پروفایل و دکمه خروج
  if (agent) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#159ca8] font-bold text-white">
            {agent.firstName[0]}
          </div>
          <div>
            <p className="text-xs text-gray-500">مشاور وارد شده</p>
            <p className="font-semibold text-gray-800">
              {agent.firstName} {agent.lastName}
            </p>
            {agent.agencyName && (
              <p className="text-xs text-[#159ca8]">{agent.agencyName}</p>
            )}
          </div>
        </div>
        <button
          onClick={logout}
          type="button"
          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
        >
          خروج از حساب
        </button>
      </div>
    );
  }

  // اگر مشاور وارد نشده است -> نمایش فرم ورود
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-800">ورود به حساب مشاور</h3>
        <p className="text-xs text-gray-500 mt-1">
          جهت ثبت ملک در سامانه، لطفاً با شماره موبایل و رمز عبور خود وارد شوید.
        </p>
      </div>

      {/* نمایش خطای ورود یا پیام وضعیت */}
      {(formError || (error && error !== "ابتدا وارد حساب شوید.")) && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          {formError || error}
        </div>
      )}

      <form onSubmit={handleSubmitLogin} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            شماره موبایل
          </label>
          <input
            type="text"
            dir="ltr"
            placeholder="09123456789"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#159ca8] focus:ring-1 focus:ring-[#159ca8]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            کلمه عبور
          </label>
          <input
            type="password"
            dir="ltr"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#159ca8] focus:ring-1 focus:ring-[#159ca8]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#159ca8] py-2.5 text-sm font-semibold text-white transition hover:bg-[#117f8a] disabled:opacity-50"
        >
          {isSubmitting ? "در حال ورود..." : "ورود به حساب کاربری"}
        </button>
      </form>
    </div>
  );
};
