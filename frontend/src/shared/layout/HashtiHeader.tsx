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

        

       

      </div>
    </header>
  );
}