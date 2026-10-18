"use client";

import { useCallback, useEffect, useState } from "react";
import { LogOut, LoaderCircle } from "lucide-react";
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
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const syncSession = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLogoutError(null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const refreshSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (isActive) {
          setUser(currentUser);
          setLogoutError(null);
        }
      } catch {
        if (isActive) {
          setUser(null);
        }
      }
    };

    const handleAuthStateChange = () => {
      void syncSession();
    };

    void refreshSession();
    window.addEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange);

    return () => {
      isActive = false;
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange);
    };
  }, [syncSession]);

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
      className="fixed bottom-4 left-4 z-[2000] flex max-w-[calc(100vw-2rem)] flex-col items-start gap-2"
      dir="rtl"
    >
      {logoutError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-lg"
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
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-lg transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F9CF9] disabled:cursor-not-allowed disabled:opacity-60"
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
  );
}
