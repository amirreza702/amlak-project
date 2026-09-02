// مشخص کردن اجرای کامپوننت در سمت کلاینت مرورگر
"use client";

// وارد کردن ماژول‌های اصلی React و هوک‌های مورد نیاز
import React, { useState, useEffect } from "react";
// استفاده از پورتال برای رندر مودال در root سند HTML (جهت جلوگیری از لایه‌بندی Z-Index)
import { createPortal } from "react-dom";
// وارد کردن آیکون‌های متناسب از کتابخانه lucide-react
import { X, User, Phone, Lock, Briefcase, KeyRound, Building2, ArrowRight } from "lucide-react";

// تعریف تایپ‌های سه نقش موجود در سیستم
type UserRole = "agent" | "customer" | "owner";

// تعریف مشخصات پراپ‌های ورودی کامپوننت
interface AuthModalProps {
  // وضعیت باز یا بسته بودن پنجره
  isOpen: boolean;
  // تابعی برای بستن مودال
  onClose: () => void;
  // تابع کال‌بک در صورت موفقیت‌آمیز بودن احراز هویت
  onSuccess?: () => void;
}

// کامپوننت اصلی مودال احراز هویت چندنقشی
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // نگهداری نقش انتخاب‌شده (پیش‌فرض: مشاور)
  const [selectedRole, setSelectedRole] = useState<UserRole>("agent");

  // استیت‌های فرم مشاور (ورود با موبایل و رمز عبور)
  const [agentMobile, setAgentMobile] = useState<string>("");
  const [agentPassword, setAgentPassword] = useState<string>("");

  // استیت‌های فرم مشتری (بدون رمز عبور - فقط با کد تایید پیامکی OTP)
  const [customerMobile, setCustomerMobile] = useState<string>("");
  const [customerOtp, setCustomerOtp] = useState<string>("");
  const [customerOtpSent, setCustomerOtpSent] = useState<boolean>(false);

  // استیت‌های فرم مالک (ورود با شماره موبایل و کد ملی/شناسه ملک)
  const [ownerMobile, setOwnerMobile] = useState<string>("");
  const [ownerNationalCode, setOwnerNationalCode] = useState<string>("");

  // استیت وضعیت لودینگ درخواست‌ها
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // استیت نگهداری متن خطا
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // استیت اطمینان از مانت کلاینت جهت جلوگیری از خطای Hydration در Next.js
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // تنظیم وضعیت مانت شدن در مرورگر پس از اولین رندر
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // در صورت بسته بودن یا لود نشدن کلاینت، چیزی رندر نمی‌شود
  if (!isMounted || !isOpen) {
    return null;
  }

  // تابع مدیریت لاگین مشاور (ارسال موبایل و رمز به بک‌اند)
  const handleAgentLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // درخواست ورود مشاور به ای‌پای بک‌اند هشتی
      const res = await fetch("/api/agents/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: agentMobile.trim(),
          password: agentPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "شماره موبایل یا رمز عبور اشتباه است.");
      }

      // در صورت ورود موفق
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("خطایی در ارتباط با سرور رخ داد.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // تابع مدیریت احراز هویت مشتری (ارسال پیامک و تایید کد یکبار مصرف)
  const handleCustomerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    // مرحله ۱: ارسال کد تایید به شماره مشتری
    if (!customerOtpSent) {
      if (customerMobile.trim().length < 10) {
        setErrorMessage("لطفاً شماره موبایل معتبر ۱۰ یا ۱۱ رقمی وارد کنید.");
        return;
      }
      setIsLoading(true);
      // شبیه‌سازی درخواست ارسال SMS
      setTimeout(() => {
        setIsLoading(false);
        setCustomerOtpSent(true);
      }, 600);
    } 
    // مرحله ۲: تایید کد OTP وارد شده توسط مشتری
    else {
      if (customerOtp.trim().length < 4) {
        setErrorMessage("کد تایید وارد شده معتبر نیست.");
        return;
      }
      setIsLoading(true);
      // شبیه‌سازی تایید کد و ورود
      setTimeout(() => {
        setIsLoading(false);
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 700);
    }
  };

  // تابع مدیریت فرم مالک
  const handleOwnerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setErrorMessage("پنل مالکین به‌زودی فعال خواهد شد.");
    }, 700);
  };

  // رندر مودال در انتهای سند HTML با createPortal
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      {/* دیالوگ اصلی مودال */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* دکمه بستن در گوشه بالا */}
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="بستن"
        >
          <X className="h-5 w-5" />
        </button>

        {/* سربرگ مودال */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-[#0b3158]">ورود به سامانه هشتی</h2>
          <p className="mt-1 text-xs text-slate-500">نقش کاربری خود را انتخاب نمایید</p>
        </div>

        {/* دکمه‌های ناوبری تب‌های سه نقش */}
        <div className="mb-6 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
          {/* تب مشاور */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole("agent");
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition ${
              selectedRole === "agent"
                ? "bg-white text-[#0b3158] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>مشاور</span>
          </button>

          {/* تب مشتری */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole("customer");
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition ${
              selectedRole === "customer"
                ? "bg-white text-[#0b3158] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="h-4 w-4" />
            <span>مشتری</span>
          </button>

          {/* تب مالک */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole("owner");
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition ${
              selectedRole === "owner"
                ? "bg-white text-[#0b3158] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>مالک</span>
          </button>
        </div>

        {/* باکس نمایش پیام‌های خطا */}
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-red-600">
            {errorMessage}
          </div>
        )}

        {/* ۱. فرم ورود مشاور (موبایل + رمز عبور) */}
        {selectedRole === "agent" && (
          <form onSubmit={handleAgentLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">شماره موبایل مشاور</label>
              <div className="relative">
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="09123456789"
                  value={agentMobile}
                  onChange={(e) => setAgentMobile(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-3 text-left text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#159ca8] focus:outline-none"
                />
                <Phone className="absolute top-3 right-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">رمز عبور</label>
              <div className="relative">
                <input
                  type="password"
                  dir="ltr"
                  placeholder="••••••••"
                  value={agentPassword}
                  onChange={(e) => setAgentPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-3 text-left text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#159ca8] focus:outline-none"
                />
                <Lock className="absolute top-3 right-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-[#0b3158] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#082340] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? "در حال بررسی اطلاعات..." : "ورود به عنوان مشاور"}
            </button>
          </form>
        )}

        {/* ۲. فرم ورود مشتری (بدون رمز عبور - فقط با پیامک OTP) */}
        {selectedRole === "customer" && (
          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            {/* مرحله دریافت شماره موبایل */}
            {!customerOtpSent ? (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  شماره موبایل خود را وارد کنید
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    placeholder="09123456789"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-3 text-left text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#159ca8] focus:outline-none"
                  />
                  <Phone className="absolute top-3 right-3 h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">کد تایید یکبار مصرف به این شماره پیامک خواهد شد.</p>
              </div>
            ) : (
              /* مرحله ورود کد تایید ارسال‌شده */
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-xs">
                  <span className="text-slate-600">ارسال کد به: <strong dir="ltr">{customerMobile}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerOtpSent(false);
                      setCustomerOtp("");
                      setErrorMessage(null);
                    }}
                    className="flex items-center gap-1 text-[#159ca8] font-semibold hover:underline"
                  >
                    <span>ویرایش شماره</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">
                    کد تایید پیامک‌شده را وارد کنید
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="1234"
                      maxLength={6}
                      value={customerOtp}
                      onChange={(e) => setCustomerOtp(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-3 text-center text-base tracking-widest text-slate-800 placeholder:text-slate-400 focus:border-[#159ca8] focus:outline-none"
                    />
                    <KeyRound className="absolute top-3 right-3 h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-[#159ca8] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#117f8a] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading
                ? "در حال پردازش..."
                : customerOtpSent
                ? "تایید کد و ورود به سایت"
                : "دریافت کد تایید ورود"}
            </button>
          </form>
        )}

        {/* ۳. فرم ورود مالک */}
        {selectedRole === "owner" && (
          <form onSubmit={handleOwnerSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">شماره تماس مالک</label>
              <div className="relative">
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="09123456789"
                  value={ownerMobile}
                  onChange={(e) => setOwnerMobile(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-3 text-left text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#159ca8] focus:outline-none"
                />
                <Phone className="absolute top-3 right-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">کد ملی یا شناسه ملک</label>
              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  placeholder="0012345678"
                  value={ownerNationalCode}
                  onChange={(e) => setOwnerNationalCode(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-3 text-left text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#159ca8] focus:outline-none"
                />
                <KeyRound className="absolute top-3 right-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-[#0b3158] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#082340] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? "در حال بررسی..." : "ورود به پنل مالک"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
