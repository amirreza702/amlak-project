"use client";

import { useCurrentAgent } from "../hooks/useCurrentAgent";

export function CurrentAgent() {
  const {
    agent,
    isLoading,
    error,
  } = useCurrentAgent();

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-muted-foreground">
        در حال دریافت اطلاعات مشاور...
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
      >
        {error}
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm">
        مشاور وارد سیستم نشده است.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-muted-foreground">
        مشاور ثبت‌کننده
      </div>

      <div className="mt-1 font-semibold text-[#0b3158]">
        {agent.firstName} {agent.lastName}
      </div>

      {agent.agencyName && (
        <div className="mt-1 text-sm text-[#159ca8]">
          {agent.agencyName}
        </div>
      )}
    </div>
  );
}