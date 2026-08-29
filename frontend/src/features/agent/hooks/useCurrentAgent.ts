"use client";

import { useEffect, useState } from "react";

import type { Agent } from "../types/agent";
import { getCurrentAgent } from "../api/agentApi";

interface UseCurrentAgentResult {
  agent: Agent | null;
  isLoading: boolean;
  error: string | null;
}

export function useCurrentAgent(): UseCurrentAgentResult {
  const [agent, setAgent] = useState<Agent | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadAgent() {
      try {
        setIsLoading(true);
        setError(null);

        const currentAgent =
          await getCurrentAgent();

        setAgent(currentAgent);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "خطا در دریافت اطلاعات مشاور"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAgent();
  }, []);

  return {
    agent,
    isLoading,
    error,
  };
}