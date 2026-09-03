// src/shared/layout/HashtiHeader.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { HashtiBrand } from "../branding/components/HashtiBrand";
import { AuthModal } from "@/features/auth/components/AuthModal";

interface HashtiHeaderProps {
  onAuthSuccess?: () => void;
}

export function HashtiHeader({ onAuthSuccess }: HashtiHeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <HashtiBrand variant="compact" />
          </Link>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <User className="h-4 w-4 text-emerald-600" />
            <span>ورود / حساب کاربری</span>
          </button>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={onAuthSuccess}
      />
    </>
  );
}
