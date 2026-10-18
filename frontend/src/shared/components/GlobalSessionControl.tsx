"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, LoaderCircle, LayoutDashboard } from "lucide-react";
import {
  AUTH_STATE_CHANGE_EVENT,
  getCurrentUser,
  logoutUser,
  type UserPublic,
} from "@/features/auth/api/authApi";

/**
 * دکمهٔ سراسری خروج که در RootLayout قرار می‌گیرد و در تمام صفحات فعال است.
 * کاربر فقط از روی Session معتبر بک‌اند شناسایی می‌شود.
 */
export function GlobalSessionControl() {
  const pathname = usePathname();
  const latestCheckId = useRef(0);
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const syncSession = useCallback(async () => {
    // پاسخ قدیمی نباید وضعیت ورود جدیدتر را بازنویسی کند.
    const checkId = ++latestCheckId.current;

    try {
      const currentUser = await getCurrentUser();
      if (checkId === latestCheckId.current) {
        setUser(currentUser);
        setLogoutError(null);
      }
    } catch {
      if (checkId === latestCheckId.current) {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const handleAuthStateChange = () => {
      void syncSession();
    };

    // بازیابی نشست در بارگذاری مستقیم و هنگام جابه‌جایی بین صفحات.
    void syncSession();
    window.addEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange);

    return () => {
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange);
    };
  }, [pathname, syncSession]);

  const handleLogout = async () => {
    setIsSigningOut(true);
    setLogoutError(null);

    try {
      await logoutUser();
      setUser(null);
    } catch {
      setLogoutError("خروج انجام نشد؛ اتصال به سرور را بررسی کنید.");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!user && !logoutError) {
    return null;
  }

  return (
    <div
      className="relative z-[2000] w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur"
      dir="rtl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-4 py-2 sm:px-6 lg:px-8">
        {user && (
          <Link
            href={user.role === "CUSTOMER" ? "/customer" : user.role === "OWNER" ? "/owner" : user.role === "AGENT" ? "/agent" : "/hashti"}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#043873] hover:bg-blue-50"
          >
            <LayoutDashboard className="h-4 w-4" />
            پنل من
          </Link>
        )}
        {logoutError && (
          <div
            role="alert"
            className="text-sm text-red-700"
          >
            {logoutError}
          </div>
        )}
        {user && (
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isSigningOut}
            aria-label="خروج از حساب کاربری"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F9CF9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSigningOut ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {isSigningOut ? "در حال خروج..." : "خروج از حساب"}
          </button>
        )}
      </div>
    </div>
  );
}
