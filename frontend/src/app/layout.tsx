import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "هشتی | مسکن با اصالت و اعتماد",
    template: "%s | هشتی",
  },
  description: "سامانه جستجو، مشاهده و ثبت آگهی ملک هشتی",
  applicationName: "هشتی",
};

export const viewport: Viewport = {
  themeColor: "#062a5b",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
