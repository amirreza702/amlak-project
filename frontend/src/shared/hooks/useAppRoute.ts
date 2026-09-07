"use client";

/**
 * ============================================================
 * useAppRoute
 * ============================================================
 *
 * Route فعلی برنامه را مستقیماً از URL می‌خواند.
 *
 * نکته مهم:
 * ------------------------------------------------------------
 * برای نگهداری Route از useState استفاده نمی‌کنیم.
 *
 * URL منبع اصلی Route است.
 *
 * useSyncExternalStore باعث می‌شود React هنگام تغییر URL
 * دوباره کامپوننت را Render کند.
 * ============================================================
 */

import { useSyncExternalStore } from "react";

import type { AppRoute } from "@/shared/lib/app-router";

/**
 * اطلاعات Route فعلی
 */
export interface AppRouteInfo {
  route: AppRoute;
  params: Record<string, string>;
}

/**
 * ============================================================
 * Routeهای معتبر برنامه
 * ============================================================
 */

const validRoutes: AppRoute[] = [
  "home",
  "search",
  "property",
  "favorite",
  "viewing",
  "request",
  "verification",
  "notification",
  "messaging",
  "auth",
];

/**
 * ============================================================
 * مقدار ثابت برای Server
 * ============================================================
 *
 * خیلی مهم:
 *
 * این object را بیرون از getServerSnapshot تعریف کرده‌ایم
 * تا در هر فراخوانی object جدید ساخته نشود.
 *
 * این دقیقاً مشکل:
 *
 * "The result of getServerSnapshot should be cached"
 *
 * را برطرف می‌کند.
 * ============================================================
 */

const serverSnapshot: AppRouteInfo = {
  route: "home",
  params: {},
};

/**
 * ============================================================
 * خواندن Route از URL
 * ============================================================
 */

function getSnapshot(): AppRouteInfo {
  /**
   * پارامترهای Query String را می‌خوانیم.
   *
   * مثال:
   *
   * /?page=search&city=shahrud
   *
   * page = search
   * city = shahrud
   */
  const searchParams = new URLSearchParams(
    window.location.search,
  );

  /**
   * Route اصلی
   */
  const page = searchParams.get("page");

  /**
   * اگر page وجود نداشت،
   * یعنی در Home هستیم.
   */
  if (!page) {
    return serverSnapshot;
  }

  /**
   * بررسی می‌کنیم Route معتبر است یا نه.
   */
  const route = validRoutes.includes(page as AppRoute)
    ? (page as AppRoute)
    : "home";

  /**
   * سایر پارامترهای URL را استخراج می‌کنیم.
   */
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    /**
     * page خود Route است و نباید داخل params قرار بگیرد.
     */
    if (key !== "page") {
      params[key] = value;
    }
  });

  /**
   * اطلاعات Route
   */
  return {
    route,
    params,
  };
}

/**
 * ============================================================
 * Server Snapshot
 * ============================================================
 *
 * در Server همیشه Home را به عنوان مقدار اولیه در نظر می‌گیریم.
 *
 * نکته مهم:
 * از serverSnapshot ثابت استفاده می‌کنیم،
 * نه اینکه هر بار object جدید بسازیم.
 * ============================================================
 */

function getServerSnapshot(): AppRouteInfo {
  return serverSnapshot;
}

/**
 * ============================================================
 * Subscribe
 * ============================================================
 *
 * هر زمان Browser تاریخچه URL را تغییر دهد،
 * React را مطلع می‌کنیم.
 * ============================================================
 */

function subscribe(callback: () => void) {
  /**
   * Back / Forward مرورگر
   */
  window.addEventListener("popstate", callback);

  /**
   * هنگام Unmount شدن Hook،
   * Listener حذف می‌شود.
   */
  return () => {
    window.removeEventListener("popstate", callback);
  };
}

/**
 * ============================================================
 * useAppRoute
 * ============================================================
 */

export function useAppRoute(): AppRouteInfo {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
}