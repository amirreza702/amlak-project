// src/features/auth/components/AuthModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { loginAgent } from "../api/authApi";

export type UserRole = "agent" | "customer" | "owner";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<UserRole>("agent");
  const [mobile, setMobile] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setErrorMessage(null);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  // پردازش فرم لاگین مشاور
  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!mobile.trim() || !password.trim()) {
      setErrorMessage("لطفاً شماره همراه و رمز عبور را وارد کنید.");
      return;
    }

    setIsLoading(true);
    try {
      // ارسال به API احراز هویت با رعایت کوکی
      await loginAgent(mobile.trim(), password);
      
      // فراخوانی کال‌بک موفقیت و بستن مودال
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "خطا در برقراری ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* دکمه بستن */}
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          ✕
        </button>

        <h3 className="mb-4 text-center text-xl font-bold text-gray-800">
          ورود به هشتی
        </h3>

        {/* تب‌های انتخاب نقش */}
        <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              activeTab === "agent" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => { setActiveTab("agent"); setErrorMessage(null); }}
          >
            مشاور املاک
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              activeTab === "customer" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => { setActiveTab("customer"); setErrorMessage(null); }}
          >
            مشتری
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              activeTab === "owner" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => { setActiveTab("owner"); setErrorMessage(null); }}
          >
            مالک
          </button>
        </div>

        {/* نمایش پیام خطا */}
        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        {/* فرم لاگین مشاور */}
        {activeTab === "agent" && (
          <form onSubmit={handleAgentSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">شماره موبایل</label>
              <input
                type="text"
                placeholder="09123456789"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                dir="ltr"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">رمز عبور</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white shadow-md hover:bg-emerald-700 focus:outline-none disabled:opacity-50"
            >
              {isLoading ? "در حال ورود..." : "ورود به حساب مشاور"}
            </button>
          </form>
        )}

        {/* تب‌های دیگر */}
        {activeTab !== "agent" && (
          <div className="py-8 text-center text-sm text-gray-500">
            این بخش به زودی فعال خواهد شد.
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
