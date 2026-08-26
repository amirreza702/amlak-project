import Link from "next/link";

import { HashtiBrand } from "../branding/components/HashtiBrand";

export function HashtiHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">

        <Link
          href="/"
          aria-label="هشتی"
          className="
            rounded-xl
            transition-opacity
            duration-200
            hover:opacity-80
          "
        >
          <HashtiBrand variant="compact" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/"
            className="
              text-[#0b3158]
              transition-colors
              duration-200
              hover:text-[#159ca8]
            "
          >
            خانه
          </Link>

          <Link
            href="#property"
            className="
              text-[#0b3158]
              transition-colors
              duration-200
              hover:text-[#159ca8]
            "
          >
            ثبت ملک
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="#property"
            className="
              hidden
              rounded-lg
              bg-[#0b3158]
              px-4
              py-2
              text-sm
              font-medium
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-[#159ca8]
              hover:shadow-md
              sm:inline-flex
            "
          >
            ثبت ملک
          </Link>
        </div>

      </div>
    </header>
  );
}