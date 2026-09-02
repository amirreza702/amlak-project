// استفاده از حالت سمت کلاینت Next.js
"use client";

// ایمپورت هوک‌های ری‌اکت
import { useState, useEffect, useCallback } from "react";
// ایمپورت متدهای واقعی API مشاور
import { getCurrentAgent, loginAgent, logoutAgent } from "../api/agentApi";
// ایمپورت تایپ مشخصات عمومی مشاور
import type { AgentPublic } from "../types/agent";

// هوک مدیریت وضعیت احراز هویت مشاور
export function useCurrentAgent() {
  // ذخیره اطلاعات مشاور وارد شده (یا null در صورت عدم ورود)
  const [agent, setAgent] = useState<AgentPublic | null>(null);
  // وضعیت در حال بارگذاری اولیه
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // ذخیره متن خطای احتمالی
  const [error, setError] = useState<string | null>(null);

  // تابعی برای واکشی مجدد وضعیت کاربر از سرور
  const fetchAgent = useCallback(async () => {
    // فعال کردن لودینگ
    setIsLoading(true);
    // پاک کردن خطای قبلی
    setError(null);
    try {
      // درخواست دریافت پروفایل به سرور با کوکی
      const data = await getCurrentAgent();
      // تنظیم مشاور در state
      setAgent(data);
    } catch (err: any) {
      // اگر کاربر لاگین نبود مشاور را خالی کن
      setAgent(null);
      // ذخیره پیام خطا برای نمایش
      setError(err?.message || "ابتدا وارد حساب شوید.");
    } finally {
      // پایان وضعیت لودینگ
      setIsLoading(false);
    }
  }, []);

  // اجرای خودکار در بارگذاری اولیه صفحه
  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  // متد ورود کاربر
  const handleLogin = async (mobile: string, pass: string) => {
    // فراخوانی متد لاگین
    const result = await loginAgent(mobile, pass);
    // بروزرسانی استیت مشاور با داده‌های دریافتی
    setAgent(result.agent);
    // پاکسازی خطا
    setError(null);
    return result;
  };

  // متد خروج کاربر
  const handleLogout = async () => {
    // ارسال درخواست خروج به سرور جهت ابطال کوکی
    await logoutAgent();
    // ریست استیت مشاور
    setAgent(null);
    // تنظیم پیام متناسب
    setError("ابتدا وارد حساب شوید.");
  };

  // خروجی‌های هوک
  return {
    agent,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    refetch: fetchAgent,
  };
}
