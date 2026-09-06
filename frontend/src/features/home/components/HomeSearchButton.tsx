"use client";

import { Search } from "lucide-react";

interface HomeSearchButtonProps {
  onSearch: () => void;
}

export function HomeSearchButton({ onSearch }: HomeSearchButtonProps) {
  return (
    <button
      type="button"
      onClick={onSearch}
      className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-[#043873] px-5 py-4 text-white shadow-lg shadow-[#043873]/20 transition-all duration-200 active:scale-[0.98] hover:bg-[#032b54]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#4F9CF9] transition-transform duration-200 group-hover:scale-110">
          <Search className="h-5 w-5" />
        </div>
        <div className="text-right">
          <p className="text-base font-bold">جستجوی هوشمند ملک</p>
          <p className="text-[11px] text-slate-300">بر اساس بودجه، منطقه و نقشه</p>
        </div>
      </div>
      <span className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-white/25">
        شروع
      </span>
    </button>
  );
}
