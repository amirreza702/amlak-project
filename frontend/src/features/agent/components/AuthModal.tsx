"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type UserRole = "agent" | "customer" | "owner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<UserRole>("agent");

  const [agentUsername, setAgentUsername] = useState<string>("");
  const [agentPassword, setAgentPassword] = useState<string>("");

  const [customerMobile, setCustomerMobile] = useState<string>("");
  const [customerPassword, setCustomerPassword] = useState<string>("");

  const [ownerMobile, setOwnerMobile] = useState<string>("");
  const [ownerCode, setOwnerCode] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) {
    return null;
  }

  const handleAgentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: agentUsername.trim(),
          password: agentPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "نام کاربری یا رمز عبور مشاور نامعتبر است.");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("خطایی در برقراری ارتباط رخ داده است.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      if (customerMobile.trim().length < 10) {
        throw new Error("لطفاً شماره موبایل معتبر وارد نمایید.");
      }

      if (customerPassword.length < 4) {
        throw new Error("کلمه عبور باید حداقل ۴ کاراکتر باشد.");
      }

      const res = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: customerMobile.trim(),
          password: customerPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "شماره همراه یا کلمه عبور مشتری اشتباه است.");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("خطایی در ورود مشتری رخ داده است.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setErrorMessage("بخش مالکین به زودی راه‌اندازی خواهد شد.");
    }, 600);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="بستن پنجره"
        >
          ✕
        </button>

        <div className="mb-5 text-center">
          <h2 className="text-2xl font-black text-[#0b3158]">ورود به هشتی</h2>
          <p className="mt-1 text-xs font-medium text-[#159ca8]">
            {activeTab === "agent" && "پنل اختصاصی ثبت ملک مشاوران"}
            {activeTab === "customer" && "پنل جستجو و نشان‌گذاری مشتریان"}
            {activeTab === "owner" && "پیگیری وضعیت پرونده‌های ثبتی مالک"}
          </p>
        </div>

        <div className="mb-5 flex rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("agent");
              setErrorMessage("");
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
              activeTab === "agent"
                ? "bg-white text-[#0b3158] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            مشاور
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("customer");
              setErrorMessage("");
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
              activeTab === "customer"
                ? "bg-white text-[#0b3158] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            مشتری
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("owner");
              setErrorMessage("");
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
              activeTab === "owner"
                ? "bg-white text-[#0b3158] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            مالک
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-2.5 text-center text-xs font-semibold text-red-600">
            {errorMessage}
          </div>
        )}

        {activeTab === "agent" && (
          <form onSubmit={handleAgentSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                نام کاربری / شماره همراه
              </label>
              <input
                type="text"
                dir="ltr"
                placeholder="مثال: 09123456789"
                value={agentUsername}
                onChange={(e) => setAgentUsername(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-left text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#159ca8] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                کلمه عبور
              </label>
              <input
                type="password"
                dir="ltr"
                placeholder="********"
                value={agentPassword}
                onChange={(e) => setAgentPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-left text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#159ca8] focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-[#0b3158] to-[#159ca8] py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? "در حال ورود..." : "ورود به حساب مشاور"}
            </button>
          </form>
        )}

        {activeTab === "customer" && (
          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                شماره همراه مشتری
              </label>
              <input
                type="tel"
                dir="ltr"
                placeholder="مثال: 09123456789"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-left text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#159ca8] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                کلمه عبور
              </label>
              <input
                type="password"
                dir="ltr"
                placeholder="********"
                value={customerPassword}
                onChange={(e) => setCustomerPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-left text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#159ca8] focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-[#159ca8] to-[#0b3158] py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? "در حال ورود..." : "ورود به حساب مشتری"}
            </button>
          </form>
        )}

        {activeTab === "owner" && (
          <form onSubmit={handleOwnerSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                شماره تماس مالک
              </label>
              <input
                type="tel"
                dir="ltr"
                placeholder="مثال: 09123456789"
                value={ownerMobile}
                onChange={(e) => setOwnerMobile(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-left text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#159ca8] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                کد ملی یا شناسه پیگیری
              </label>
              <input
                type="text"
                dir="ltr"
                placeholder="مثال: 0012345678"
                value={ownerCode}
                onChange={(e) => setOwnerCode(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-left text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#159ca8] focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-2xl bg-[#0b3158] py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#082340] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? "در حال بررسی..." : "ورود به پنل مالک"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
