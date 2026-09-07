"use client";

import { navigate } from "@/shared/lib/app-router";

export function HomeSearchButton() {
  const handleSearch = () => {
    console.log("SEARCH BUTTON CLICKED");

    navigate("search");

    console.log("NAVIGATED TO SEARCH");
  };

  return (
    <button
      type="button"
      onClick={handleSearch}
      className="w-full"
    >
      جستجوی ملک
    </button>
  );
}