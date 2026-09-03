// src/features/auth/hooks/useCurrentAgent.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { getCurrentAgent, loginAgent, logoutAgent, AgentPublic } from "../api/authApi";

export function useCurrentAgent() {
  const [agent, setAgent] = useState<AgentPublic | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // واکشی اطلاعات نشست جاری از سرور
  const fetchAgent = useCallback(async () => {
    setIsLoading(true);
    try {
      const current = await getCurrentAgent();
      setAgent(current);
      setError(null);
    } catch (err: any) {
      setAgent(null);
      setError(err?.message || "ابتدا وارد حساب شوید.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  // عملیات ورود و به‌روزرسانی فوری وضعیت
  const handleLogin = async (mobile: string, pass: string) => {
    setIsLoading(true);
    try {
      const result = await loginAgent(mobile, pass);
      setAgent(result.agent);
      setError(null);
      return result.agent;
    } catch (err: any) {
      setError(err?.message || "خطا در ورود");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // عملیات خروج
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutAgent();
      setAgent(null);
      setError("ابتدا وارد حساب شوید.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    agent,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    refetch: fetchAgent,
  };
}
