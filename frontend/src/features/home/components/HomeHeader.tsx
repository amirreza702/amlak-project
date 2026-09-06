"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";

export function HomeHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between px-5 pt-4 pb-2 sm:px-8 sm:pt-6">
      {/* بخش لوگو و برند */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-100">
          <Image
            src="/hashti-logo.png"
            alt="هشتی"
            width={34}
            height={34}
            priority
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black tracking-tight text-[#043873]">هشتی</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">سامانه شفاف معاملات ملک</span>
        </div>
      </div>

      {/* بج یا اقدام گوشه هدر */}
      <div className="glass-pill flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#043873]">
        <Sparkles className="h-3.5 w-3.5 text-[#4F9CF9]" />
        <span>نسخه هوشمند</span>
      </div>
    </header>
  );
}
