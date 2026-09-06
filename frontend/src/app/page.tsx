"use client";

import { useState } from "react";

import { HomePage } from "@/features/home/components/HomePage";
import { PropertySearchPage } from "@/features/property/components/search/PropertySearchPage";

export default function Page() {
  // مشخص می‌کند الان Home نمایش داده شود یا صفحه جستجو
  const [showSearch, setShowSearch] = useState(false);

  // اگر کاربر روی «جستجوی ملک» کلیک کرد
  if (showSearch) {
    return <PropertySearchPage />;
  }

  // صفحه اصلی با چهار دکمه
  return (
    <HomePage
      onSearch={() => setShowSearch(true)}
    />
  );
}