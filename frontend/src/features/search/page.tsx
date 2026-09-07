"use client";

/**
 * ============================================================
 * Search Feature - Entry Point
 * ============================================================
 *
 * این فایل نقطه ورود Feature جستجو است.
 *
 * نکته معماری:
 *
 * Search یک Business Feature مستقل است.
 *
 * بنابراین دیگر زیر Property قرار ندارد.
 *
 * ساختار:
 *
 * features/
 * ├── search/
 * │   ├── page.tsx
 * │   ├── components/
 * │   ├── hooks/
 * │   ├── services/
 * │   └── types/
 * │
 * └── property/
 *
 * ============================================================
 */

import { PropertySearchPage } from "./components/PropertySearchPage";

export default function SearchPage() {
  /**
   * فعلاً UI موجود جستجو را مستقیماً نمایش می‌دهیم.
   *
   * بعداً منطق جستجو را به hooks و services
   * منتقل می‌کنیم.
   */
  return <PropertySearchPage />;
}