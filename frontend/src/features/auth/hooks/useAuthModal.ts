"use client";

import { useCallback, useState } from "react";
import type { AuthRole } from "../components/AuthModal";

export function useAuthModal() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<AuthRole>("agent");

  const openAuthModal = useCallback((role: AuthRole) => {
    setAuthRole(role);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  return {
    isAuthModalOpen,
    authRole,
    openAuthModal,
    closeAuthModal,
  };
}
