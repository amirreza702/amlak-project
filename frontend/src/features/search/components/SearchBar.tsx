"use client";

import { ArrowRight, Mic, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  district: string;
  setDistrict: (value: string) => void;
}

export function SearchBar({
  district,
  setDistrict,
}: SearchBarProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div
      className="
        flex
        items-center
        gap-2
        rounded-2xl
        border
        border-white/80
        bg-white/95
        p-2
        shadow-2xl
        backdrop-blur-xl
      "
    >
      {/* دکمه بازگشت */}
      <button
        type="button"
        onClick={handleBack}
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          text-slate-600
          transition
          hover:bg-slate-100
        "
        aria-label="بازگشت"
      >
        <ArrowRight size={20} />
      </button>

      {/* آیکون جستجو */}
      <Search
        size={20}
        className="shrink-0 text-slate-500"
      />

      {/* ورودی جستجو */}
      <input
        value={district}
        onChange={(event) =>
          setDistrict(event.target.value)
        }
        placeholder="محله، خیابان، شهر یا کدپستی را جستجو کنید"
        className="
          min-w-0
          flex-1
          bg-transparent
          px-1
          text-sm
          font-medium
          text-slate-800
          outline-none
          placeholder:text-slate-400
          sm:text-base
        "
      />

      {/* جستجوی صوتی */}
      <button
        type="button"
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          text-slate-500
          transition
          hover:bg-slate-100
        "
        aria-label="جستجوی صوتی"
      >
        <Mic size={19} />
      </button>
    </div>
  );
}