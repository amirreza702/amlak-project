"use client";

/**
 * ============================================================
 * Application Router
 * ============================================================
 *
 * Router داخلی برنامه «هشتی»
 *
 * وظیفه این فایل:
 *
 * URL
 *  ↓
 * تشخیص Feature
 *
 * این Router برای تغییر صفحه از useState استفاده نمی‌کند.
 *
 * URL منبع اصلی وضعیت Route است.
 * ============================================================
 */

/**
 * Routeهای اصلی برنامه
 */
export type AppRoute =
  | "home"
  | "search"
  | "property"
  | "favorite"
  | "viewing"
  | "request"
  | "verification"
  | "notification"
  | "messaging"
  | "auth";

/**
 * رفتن به یک Route
 */
export function navigate(
  route: AppRoute,
  params: Record<string, string> = {},
) {
  /**
   * Home آدرس اصلی سایت است.
   */
  if (route === "home") {
    window.history.pushState({}, "", "/");

    /**
     * به برنامه اعلام می‌کنیم URL تغییر کرده است.
     */
    window.dispatchEvent(new PopStateEvent("popstate"));

    return;
  }

  /**
   * ساخت Query String
   *
   * مثال:
   *
   * page=search
   */
  const searchParams = new URLSearchParams();

  searchParams.set("page", route);

  /**
   * اضافه کردن پارامترهای اضافی
   *
   * مثال:
   *
   * id=123
   */
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });

  /**
   * تغییر URL بدون Reload
   */
  window.history.pushState(
    {},
    "",
    `/?${searchParams.toString()}`,
  );

  /**
   * اطلاع به React
   */
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/**
 * برگشت به Route قبلی
 */
export function goBack() {
  window.history.back();
}