import type { Metadata } from "next";

import "./globals.css";

import { PwaRegistrar } from "@/lib/PwaRegistrar";

/**
 * Metadata اصلی برنامه هشتی
 */
export const metadata: Metadata = {
  title: "هشتی",
  description: "پلتفرم هشتی",

  /**
   * مشخصات مربوط به ظاهر مرورگر/PWA
   */
  themeColor: "#062a5b",

  /**
   * لینک Manifest
   */
  manifest: "/manifest.webmanifest",
};

/**
 * Root Layout
 *
 * این Layout در تمام صفحات برنامه استفاده می‌شود.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {/* ==================================================
            ثبت Service Worker
            ==================================================
            این کامپوننت فقط در Production فعال می‌شود.
            در نتیجه Development تحت تأثیر Cache قرار نمی‌گیرد.
        ================================================== */}
        <PwaRegistrar />

        {/* محتوای صفحات */}
        {children}
      </body>
    </html>
  );
}