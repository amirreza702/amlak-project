// فعال‌سازی رندر سمت کلاینت برای هوک‌ها و استیت‌ها
"use client";

// ایمپورت ابزارهای کانتکست و هوک‌های پایه ری‌اکت
import React, { createContext, useContext } from "react";
// ایمپورت هوک مدیریت سشن و لاگین مشاور
import { useCurrentAgent } from "../hooks/useCurrentAgent";
// استفاده مستقیم از تایپ واقعی موجود در پروژه (Agent)
import type { Agent } from "../types/agent";

// ساختار داده‌ها و متدهای ارائه‌شده توسط کانتکست
interface AgentContextType {
  // اطلاعات آبجکت مشاور لاگین‌شده یا مقدار نال
  agent: Agent | null;
  // وضعیت انتظار دریافت اطلاعات از سرور
  isLoading: boolean;
  // متن خطای احتمالی
  error: string | null;
  // متد ارسال درخواست لاگین
  login: (mobile: string, pass: string) => Promise<any>;
  // متد خروج از حساب
  logout: () => Promise<void>;
  // متد بازخوانی مجدد اطلاعات مشاور از سرور
  refetch: () => Promise<void>;
}

// ساخت نمونه کانتکست با مقدار پیش‌فرض تعریف‌نشده
const AgentContext = createContext<AgentContextType | undefined>(undefined);

// کامپوننت ارائه‌دهنده سراسری کانتکست
export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // استخراج مقادیر از هوک اختصاصی
  const authState = useCurrentAgent();

  // قرار دادن مقادیر در دسترس کامپوننت‌های فرزند
  return (
    <AgentContext.Provider value={authState}>
      {children}
    </AgentContext.Provider>
  );
};

// هوک کاستوم جهت استفاده آسان و سریع از کانتکست در تمام کامپوننت‌ها
export const useAgentAuth = () => {
  // دریافت وضعیت فعلی کانتکست
  const context = useContext(AgentContext);
  // بررسی دسترسی مجاز و قرار داشتن در محدوده پرووایدر
  if (!context) {
    throw new Error("useAgentAuth باید در داخل AgentProvider فراخوانی شود.");
  }
  // خروجی نهایی مقادیر
  return context;
};
