"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  CheckCircle2,
  FileSearch,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import type { UserPublic } from "@/features/auth/api/authApi";
import { UserNotificationsPanel } from "@/shared/components/UserNotificationsPanel";
import { HashtiUserManagementPanel } from "./HashtiUserManagementPanel";
import { HashtiVerificationQueuePanel } from "./HashtiVerificationQueuePanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface DuplicateMatch {
  property: {
    id: string;
    propertyType: string;
    city: string;
    district: string;
    area: number | null;
    rooms: number | null;
    registrationSource?: string;
  };
  distanceMeters: number;
  similarityScore: number;
}
interface DuplicateReview {
  id: string;
  primaryPropertyId: string;
  candidatePropertyId: string;
  similarityScore: number;
  decision: "SAME_PROPERTY" | "DIFFERENT_PROPERTY" | null;
  notes: string | null;
  createdAt: string;
  reviewedAt: string | null;
}
interface ExactLocationLog {
  id: string;
  userId: string;
  propertyId: string;
  reason: string | null;
  accessedAt: string;
  user?: { mobile?: string; role?: string };
}

interface ManagedAgent {
  id: string;
  firstName: string;
  lastName: string;
  agencyName: string | null;
  address: string | null;
  isVerified: boolean;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  verificationReviewedAt: string | null;
  verificationNotes: string | null;
  verificationReviewedBy: string | null;
  user: { id: string; mobile: string; isActive: boolean; createdAt: string };
  subscription: {
    id: string;
    status: string;
    startsAt: string;
    expiresAt: string | null;
    subscriptionPlan: { id: string; code: string; name: string; level: number; monthlyContactLimit: number };
  } | null;
  usage: {
    periodStart: string;
    usedCount: number;
    monthlyLimit: number;
    remainingCount: number;
    hasActiveSubscription: boolean;
  };
}

interface AdminSubscriptionPlan {
  id: string;
  code: string;
  name: string;
  level: number;
  monthlyContactLimit: number;
}
interface ContactAccessAuditLog {
  id: string;
  accessedAt: string;
  agent: { id: string; firstName: string; lastName: string; agencyName: string | null; user: { mobile: string } };
  customer: { id: string; firstName: string; lastName: string; user: { mobile: string } };
  searchRequest: { id: string; city: string; transactionType: string; propertyType: string; status: string };
}

interface AdminAuditLog {
  id: string;
  actorUserId: string | null;
  actorMobile: string | null;
  actorRole: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  details: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { credentials: "include", cache: "no-store", ...init });
  const body = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) {
    const message = body.message || "درخواست به سرور ناموفق بود.";
    if (message === "Authentication required") throw new Error("برای استفاده از پنل هشتی دوباره وارد شوید.");
    if (message === "You do not have permission to access this resource") throw new Error("این عملیات فقط برای تیم هشتی مجاز است.");
    if (message === "Session is invalid or expired") throw new Error("نشست منقضی شده است؛ دوباره وارد شوید.");
    throw new Error(message);
  }
  return body as T;
}

function scoreLabel(value: number) {
  return `${Math.round(value * 100)}٪`;
}
function idText(value: string) {
  return <span dir="ltr" className="break-all font-mono text-xs">{value}</span>;
}

export function HashtiDashboard({ user }: { user: UserPublic }) {
  const [propertyId, setPropertyId] = useState("");
  const [candidateMatches, setCandidateMatches] = useState<DuplicateMatch[]>([]);
  const [reviews, setReviews] = useState<DuplicateReview[]>([]);
  const [matchingBusy, setMatchingBusy] = useState(false);
  const [matchingError, setMatchingError] = useState<string | null>(null);
  const [matchingMessage, setMatchingMessage] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [busyReviewId, setBusyReviewId] = useState<string | null>(null);
  const [resetUserId, setResetUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [verificationCaseId, setVerificationCaseId] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [logPropertyId, setLogPropertyId] = useState("");
  const [accessLogs, setAccessLogs] = useState<ExactLocationLog[]>([]);
  const [logsBusy, setLogsBusy] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [verificationFilter, setVerificationFilter] = useState<"pending" | "verified" | "rejected" | "all">("pending");
  const [agentVerificationNotes, setAgentVerificationNotes] = useState("");
  const [managedAgents, setManagedAgents] = useState<ManagedAgent[]>([]);
  const [adminSubscriptionPlans, setAdminSubscriptionPlans] = useState<AdminSubscriptionPlan[]>([]);
  const [subscriptionPlansError, setSubscriptionPlansError] = useState<string | null>(null);
  const [selectedPlanByAgent, setSelectedPlanByAgent] = useState<Record<string, string>>({});
  const [subscriptionStartsAt, setSubscriptionStartsAt] = useState("");
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState("");
  const [busySubscriptionAgentId, setBusySubscriptionAgentId] = useState<string | null>(null);
  const [subscriptionActionError, setSubscriptionActionError] = useState<string | null>(null);
  const [subscriptionActionMessage, setSubscriptionActionMessage] = useState<string | null>(null);
  const [agentsBusy, setAgentsBusy] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [agentsMessage, setAgentsMessage] = useState<string | null>(null);
  const [busyAgentId, setBusyAgentId] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<ContactAccessAuditLog[]>([]);
  const [auditAgentId, setAuditAgentId] = useState("");
  const [auditFrom, setAuditFrom] = useState("");
  const [auditTo, setAuditTo] = useState("");
  const [auditBusy, setAuditBusy] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [adminAuditAction, setAdminAuditAction] = useState("");
  const [adminAuditTargetId, setAdminAuditTargetId] = useState("");
  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminAuditLog[]>([]);
  const [adminAuditBusy, setAdminAuditBusy] = useState(false);
  const [adminAuditError, setAdminAuditError] = useState<string | null>(null);

  const loadManagedAgents = useCallback(async () => {
    setAgentsBusy(true);
    setAgentsError(null);
    try {
      const result = await requestJson<{
        agents: ManagedAgent[];
        pagination: { total: number; limit: number; offset: number };
      }>("/hashti/agents?verificationStatus=" + verificationFilter + "&limit=100&offset=0");
      setManagedAgents(result.agents);
    } catch (error: unknown) {
      setAgentsError(error instanceof Error ? error.message : "دریافت فهرست مشاوران انجام نشد.");
      setManagedAgents([]);
    } finally {
      setAgentsBusy(false);
    }
  }, [verificationFilter]);

  useEffect(() => {
    void loadManagedAgents();
  }, [loadManagedAgents]);

  useEffect(() => {
    let active = true;
    requestJson<{ plans: AdminSubscriptionPlan[] }>("/subscription-plans")
      .then((result) => {
        if (active) setAdminSubscriptionPlans(result.plans);
      })
      .catch((error: unknown) => {
        if (active) {
          setSubscriptionPlansError(
            error instanceof Error ? error.message : "دریافت پلن‌های اشتراک انجام نشد."
          );
        }
      });
    return () => { active = false; };
  }, []);

  const reviewAgent = async (
    agentId: string,
    verificationStatus: "PENDING" | "VERIFIED" | "REJECTED"
  ) => {
    if (verificationStatus === "REJECTED" && !agentVerificationNotes.trim()) {
      setAgentsError("برای رد مشاور، یادداشت دلیل رد را وارد کنید.");
      return;
    }
    setBusyAgentId(agentId);
    setAgentsError(null);
    setAgentsMessage(null);
    try {
      await requestJson<{ agent: ManagedAgent }>(
        "/hashti/agents/" + encodeURIComponent(agentId) + "/verification",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verificationStatus,
            notes: agentVerificationNotes.trim() || null,
          }),
        }
      );
      const labels = {
        PENDING: "وضعیت مشاور به در انتظار بررسی تغییر کرد.",
        VERIFIED: "تأیید مشاور ثبت شد.",
        REJECTED: "رد مشاور همراه با یادداشت تصمیم ثبت شد.",
      } as const;
      setAgentsMessage(labels[verificationStatus]);
      setAgentVerificationNotes("");
      await loadManagedAgents();
    } catch (error: unknown) {
      setAgentsError(error instanceof Error ? error.message : "تغییر وضعیت تأیید انجام نشد.");
    } finally {
      setBusyAgentId(null);
    }
  };

  const loadAdminAuditLogs = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminAuditBusy(true);
    setAdminAuditError(null);
    try {
      const params = new URLSearchParams();
      if (adminAuditAction.trim()) params.set("action", adminAuditAction.trim());
      if (adminAuditTargetId.trim()) params.set("targetId", adminAuditTargetId.trim());
      params.set("limit", "100");
      params.set("offset", "0");
      const result = await requestJson<{ logs: AdminAuditLog[] }>(
        "/hashti/admin-audit-logs?" + params.toString()
      );
      setAdminAuditLogs(result.logs);
    } catch (error: unknown) {
      setAdminAuditError(error instanceof Error ? error.message : "دریافت سوابق مدیریتی انجام نشد.");
      setAdminAuditLogs([]);
    } finally {
      setAdminAuditBusy(false);
    }
  };

  const assignOrUpgradeSubscription = async (agent: ManagedAgent) => {
    const planId = selectedPlanByAgent[agent.id];
    const selectedPlan = adminSubscriptionPlans.find((plan) => plan.id === planId);
    setSubscriptionActionError(null);
    setSubscriptionActionMessage(null);

    if (!selectedPlan) {
      setSubscriptionActionError("یک پلن فعال انتخاب کنید.");
      return;
    }

    if (
      agent.subscription &&
      selectedPlan.level <= agent.subscription.subscriptionPlan.level
    ) {
      setSubscriptionActionError("برای ارتقا، پلنی با سطح بالاتر از پلن فعلی انتخاب کنید.");
      return;
    }

    const isUpgrade = Boolean(agent.subscription);
    let startsAt: string | undefined;
    let expiresAt: string | undefined;

    if (!isUpgrade) {
      if (!subscriptionStartsAt) {
        setSubscriptionActionError("برای ایجاد اشتراک جدید، تاریخ شروع را مشخص کنید.");
        return;
      }
      const startDate = new Date(subscriptionStartsAt);
      if (Number.isNaN(startDate.getTime())) {
        setSubscriptionActionError("تاریخ شروع معتبر نیست.");
        return;
      }
      startsAt = startDate.toISOString();

      if (subscriptionExpiresAt) {
        const expiryDate = new Date(subscriptionExpiresAt);
        if (Number.isNaN(expiryDate.getTime()) || expiryDate < startDate) {
          setSubscriptionActionError("تاریخ انقضا باید معتبر و بعد از تاریخ شروع باشد.");
          return;
        }
        expiresAt = expiryDate.toISOString();
      }
    }

    setBusySubscriptionAgentId(agent.id);
    try {
      const path = "/hashti/agents/" + encodeURIComponent(agent.id) + "/subscriptions";
      await requestJson(
        path,
        isUpgrade
          ? {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ planId }),
            }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                planId,
                startsAt,
                ...(expiresAt ? { expiresAt } : {}),
              }),
            }
      );

      setSubscriptionActionMessage(
        isUpgrade
          ? "ارتقای اشتراک مشاور ثبت شد."
          : "اشتراک جدید مشاور ثبت شد."
      );
      setSelectedPlanByAgent((current) => {
        const next = { ...current };
        delete next[agent.id];
        return next;
      });
      await loadManagedAgents();
    } catch (error: unknown) {
      setSubscriptionActionError(
        error instanceof Error ? error.message : "تغییر اشتراک مشاور انجام نشد."
      );
    } finally {
      setBusySubscriptionAgentId(null);
    }
  };

  const loadContactAuditLogs = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuditBusy(true);
    setAuditError(null);
    try {
      const params = new URLSearchParams();
      if (auditAgentId.trim()) params.set("agentId", auditAgentId.trim());
      if (auditFrom) params.set("from", new Date(auditFrom).toISOString());
      if (auditTo) params.set("to", new Date(auditTo).toISOString());
      params.set("limit", "100");
      params.set("offset", "0");
      const result = await requestJson<{ logs: ContactAccessAuditLog[] }>(
        "/hashti/contact-access-logs?" + params.toString()
      );
      setAuditLogs(result.logs);
    } catch (error: unknown) {
      setAuditError(error instanceof Error ? error.message : "دریافت گزارش دسترسی تماس انجام نشد.");
      setAuditLogs([]);
    } finally {
      setAuditBusy(false);
    }
  };

  const loadDuplicateWork = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!propertyId.trim()) {
      setMatchingError("شناسهٔ ملک اصلی را وارد کنید.");
      return;
    }
    setMatchingBusy(true);
    setMatchingError(null);
    setMatchingMessage(null);
    try {
      const encoded = encodeURIComponent(propertyId.trim());
      const [matchResponse, reviewResponse] = await Promise.all([
        requestJson<{ matches: DuplicateMatch[] }>(`/properties/${encoded}/duplicate-matches`),
        requestJson<{ duplicateReviews: DuplicateReview[] }>(`/properties/${encoded}/duplicate-reviews`),
      ]);
      setCandidateMatches(matchResponse.matches);
      setReviews(reviewResponse.duplicateReviews);
      setMatchingMessage("نتایج مشابهت و سوابق بررسی به‌روز شد.");
    } catch (error: unknown) {
      setMatchingError(error instanceof Error ? error.message : "بررسی مغایرت انجام نشد.");
      setCandidateMatches([]);
      setReviews([]);
    } finally {
      setMatchingBusy(false);
    }
  };

  const createReview = async (candidatePropertyId: string) => {
    if (!propertyId.trim()) return;
    setBusyReviewId(candidatePropertyId);
    setMatchingError(null);
    setMatchingMessage(null);
    try {
      await requestJson(`/properties/${encodeURIComponent(propertyId.trim())}/duplicate-reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidatePropertyId }),
      });
      setMatchingMessage("پروندهٔ بررسی تشابه ایجاد شد.");
      await loadDuplicateWork();
    } catch (error: unknown) {
      setMatchingError(error instanceof Error ? error.message : "ایجاد پروندهٔ بررسی انجام نشد.");
    } finally {
      setBusyReviewId(null);
    }
  };

  const decideReview = async (reviewId: string, decision: "SAME_PROPERTY" | "DIFFERENT_PROPERTY") => {
    setBusyReviewId(reviewId);
    setMatchingError(null);
    setMatchingMessage(null);
    try {
      await requestJson(`/duplicate-reviews/${encodeURIComponent(reviewId)}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, notes: reviewNotes.trim() || null }),
      });
      setMatchingMessage(decision === "SAME_PROPERTY" ? "دو رکورد به‌عنوان یک ملک ثبت شدند." : "دو رکورد به‌عنوان املاک متفاوت ثبت شدند.");
      await loadDuplicateWork();
    } catch (error: unknown) {
      setMatchingError(error instanceof Error ? error.message : "ثبت تصمیم انجام نشد.");
    } finally {
      setBusyReviewId(null);
    }
  };

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetError(null);
    setResetMessage(null);
    if (!resetUserId.trim()) {
      setResetError("شناسهٔ User را وارد کنید.");
      return;
    }
    if (newPassword.length < 8) {
      setResetError("رمز جدید باید حداقل ۸ کاراکتر داشته باشد.");
      return;
    }
    setResetBusy(true);
    try {
      await requestJson(`/auth/admin/users/${encodeURIComponent(resetUserId.trim())}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      setNewPassword("");
      setResetMessage("رمز عبور تغییر کرد و نشست‌های قبلی آن حساب باطل شدند.");
    } catch (error: unknown) {
      setResetError(error instanceof Error ? error.message : "تغییر رمز عبور انجام نشد.");
    } finally {
      setResetBusy(false);
    }
  };

  const reviewVerificationCase = async (status: "VERIFIED" | "REJECTED") => {
    if (!verificationCaseId.trim()) {
      setVerificationError("شناسهٔ پروندهٔ تأیید را وارد کنید.");
      return;
    }
    setVerificationBusy(true);
    setVerificationError(null);
    setVerificationMessage(null);
    try {
      await requestJson(`/verification-cases/${encodeURIComponent(verificationCaseId.trim())}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes: verificationNotes.trim() || null }),
      });
      setVerificationMessage(status === "VERIFIED" ? "پرونده تأیید شد." : "پرونده رد شد.");
    } catch (error: unknown) {
      setVerificationError(error instanceof Error ? error.message : "رسیدگی به پرونده انجام نشد.");
    } finally {
      setVerificationBusy(false);
    }
  };

  const loadAccessLogs = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!logPropertyId.trim()) {
      setLogsError("شناسهٔ ملک را وارد کنید.");
      return;
    }
    setLogsBusy(true);
    setLogsError(null);
    try {
      const result = await requestJson<{ accessLogs: ExactLocationLog[] }>(
        `/properties/${encodeURIComponent(logPropertyId.trim())}/exact-location-access-logs`
      );
      setAccessLogs(result.accessLogs);
    } catch (error: unknown) {
      setLogsError(error instanceof Error ? error.message : "دریافت سوابق دسترسی انجام نشد.");
      setAccessLogs([]);
    } finally {
      setLogsBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#043873]"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <h2 className="text-xl font-black">مرکز مدیریت هشتی</h2>
            <p className="mt-1 text-sm text-slate-600">حساب واردشده: <span dir="ltr">{user.mobile}</span></p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniFeature icon={<Users className="h-5 w-5" />} title="مشاوران و اشتراک" detail="صف تأیید، اشتراک فعال و سهمیه ماهانه از API سرور خوانده می‌شود." />
          <MiniFeature icon={<FileSearch className="h-5 w-5" />} title="مغایرت املاک" detail="بررسی مشابهت، ایجاد پرونده و ثبت تصمیم فعال است." />
          <MiniFeature icon={<LockKeyhole className="h-5 w-5" />} title="بازنشانی رمز" detail="رمز کاربر با شناسهٔ User قابل تغییر است." />
          <MiniFeature icon={<ShieldCheck className="h-5 w-5" />} title="سوابق دسترسی" detail="سوابق دسترسی به موقعیت دقیق ملک قابل مشاهده است." />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">مدیریت و تأیید مشاوران</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">فهرست از پایگاه داده خوانده می‌شود و اطلاعات اشتراک/مصرف نیز از رکوردهای موجود محاسبه می‌شود.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={verificationFilter} onChange={(event) => setVerificationFilter(event.target.value as "pending" | "verified" | "rejected" | "all")} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
              <option value="pending">در انتظار بررسی</option>
              <option value="verified">تأییدشده‌ها</option>
              <option value="rejected">ردشده‌ها</option>
              <option value="all">همهٔ مشاوران</option>
            </select>
            <button type="button" onClick={() => void loadManagedAgents()} disabled={agentsBusy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold disabled:opacity-60">
              {agentsBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} تازه‌سازی
            </button>
          </div>
        </div>
        <label className="mt-3 block space-y-1 text-sm font-medium">
          یادداشت تصمیم هشتی (برای رد مشاور الزامی)
          <textarea rows={2} value={agentVerificationNotes} onChange={(event) => setAgentVerificationNotes(event.target.value)} maxLength={2000} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" placeholder="دلیل رد یا توضیح تصمیم را وارد کنید" />
        </label>
        <div className="mt-4 grid gap-3 rounded-xl border border-dashed border-slate-300 p-4 sm:grid-cols-2">
          <p className="text-sm leading-6 text-slate-600 sm:col-span-2">
            تخصیص اشتراک از طرف هشتی انجام می‌شود. پرداخت آنلاین یا ثبت مبلغ در این جریان وجود ندارد. تاریخ شروع فقط هنگام ایجاد اشتراک جدید لازم است؛ برای ارتقا فقط پلن بالاتر انتخاب کنید.
          </p>
          <label className="space-y-1 text-sm font-medium">تاریخ شروع اشتراک جدید
            <input type="datetime-local" value={subscriptionStartsAt} onChange={(event) => setSubscriptionStartsAt(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>
          <label className="space-y-1 text-sm font-medium">تاریخ انقضا (اختیاری)
            <input type="datetime-local" value={subscriptionExpiresAt} onChange={(event) => setSubscriptionExpiresAt(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>
          {subscriptionPlansError && <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{subscriptionPlansError}</p>}
        </div>
        {subscriptionActionError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{subscriptionActionError}</p>}
        {subscriptionActionMessage && <p role="status" className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{subscriptionActionMessage}</p>}
        {agentsError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{agentsError}</p>}
        {agentsMessage && <p role="status" className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{agentsMessage}</p>}
        {agentsBusy && managedAgents.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> در حال دریافت مشاوران...</p>
        ) : managedAgents.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">موردی برای این فیلتر وجود ندارد.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {managedAgents.map((agent) => (
              <article key={agent.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-bold">{agent.firstName} {agent.lastName}{agent.agencyName ? " · " + agent.agencyName : ""}</p>
                    <p className="mt-1 text-sm" dir="ltr">{agent.user.mobile}</p>
                    <p className="mt-1 text-xs text-slate-500">شناسه مشاور: {idText(agent.id)}</p>
                    <p className="mt-2 text-sm text-slate-600">وضعیت حساب: {agent.user.isActive ? "فعال" : "غیرفعال"}</p>
                  </div>
                  <div className="space-y-1 text-sm sm:text-left">
                    <p>اشتراک: <b>{agent.subscription?.subscriptionPlan.name ?? "بدون اشتراک فعال"}</b></p>
                    <p>مصرف ماه جاری: {agent.usage.usedCount.toLocaleString("fa-IR")} از {agent.usage.monthlyLimit.toLocaleString("fa-IR")}</p>
                    <p>باقی‌مانده: {agent.usage.remainingCount.toLocaleString("fa-IR")}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${agent.verificationStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-800" : agent.verificationStatus === "REJECTED" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-900"}`}>
                    {agent.verificationStatus === "VERIFIED" ? "تأییدشده" : agent.verificationStatus === "REJECTED" ? "ردشده" : "در انتظار بررسی"}
                  </span>
                  {agent.verificationStatus !== "VERIFIED" && (
                    <button type="button" onClick={() => void reviewAgent(agent.id, "VERIFIED")} disabled={busyAgentId === agent.id} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-60">
                      {busyAgentId === agent.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {agent.verificationStatus === "REJECTED" ? "تأیید مجدد" : "تأیید مشاور"}
                    </button>
                  )}
                  {agent.verificationStatus === "PENDING" && (
                    <button type="button" onClick={() => void reviewAgent(agent.id, "REJECTED")} disabled={busyAgentId === agent.id || !agentVerificationNotes.trim()} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50">
                      {busyAgentId === agent.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} رد مشاور
                    </button>
                  )}
                  {agent.verificationStatus !== "PENDING" && (
                    <button type="button" onClick={() => void reviewAgent(agent.id, "PENDING")} disabled={busyAgentId === agent.id} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold disabled:opacity-60">
                      بازگشت به انتظار بررسی
                    </button>
                  )}
                </div>
                {agent.verificationNotes && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">یادداشت آخرین تصمیم: {agent.verificationNotes}</p>}
                {agent.verificationReviewedAt && <p className="mt-2 text-xs text-slate-400">آخرین بررسی: {new Date(agent.verificationReviewedAt).toLocaleString("fa-IR")}</p>}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <label className="space-y-1 text-sm font-medium">
                      پلن اشتراک
                      <select
                        value={selectedPlanByAgent[agent.id] ?? ""}
                        onChange={(event) => setSelectedPlanByAgent((current) => ({ ...current, [agent.id]: event.target.value }))}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                      >
                        <option value="">انتخاب پلن فعال</option>
                        {adminSubscriptionPlans.map((plan) => (
                          <option
                            key={plan.id}
                            value={plan.id}
                            disabled={Boolean(agent.subscription && plan.level <= agent.subscription.subscriptionPlan.level)}
                          >
                            {plan.name} · {plan.monthlyContactLimit.toLocaleString("fa-IR")} دسترسی ماهانه
                            {agent.subscription && plan.level <= agent.subscription.subscriptionPlan.level ? " (سطح برابر/پایین‌تر)" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => void assignOrUpgradeSubscription(agent)}
                      disabled={
                        busySubscriptionAgentId === agent.id ||
                        !selectedPlanByAgent[agent.id] ||
                        (agent.subscription
                          ? (adminSubscriptionPlans.find((plan) => plan.id === selectedPlanByAgent[agent.id])?.level ?? 0) <= agent.subscription.subscriptionPlan.level
                          : !subscriptionStartsAt)
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#043873] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                    >
                      {busySubscriptionAgentId === agent.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {agent.subscription ? "ارتقای اشتراک" : "ایجاد اشتراک"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold">گزارش دسترسی مشاوران به اطلاعات تماس</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">این گزارش، دسترسی‌های ثبت‌شده برای مشاهده شمارهٔ مشتری را نشان می‌دهد؛ گزارش عمومی تمام رویدادهای مدیریتی در مدل فعلی دیتابیس وجود ندارد.</p>
        <form onSubmit={(event) => void loadContactAuditLogs(event)} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-sm">شناسه مشاور (اختیاری)<input value={auditAgentId} onChange={(event) => setAuditAgentId(event.target.value)} dir="ltr" className="w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
          <label className="space-y-1 text-sm">از زمان<input type="datetime-local" value={auditFrom} onChange={(event) => setAuditFrom(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
          <label className="space-y-1 text-sm">تا زمان<input type="datetime-local" value={auditTo} onChange={(event) => setAuditTo(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
          <div className="flex items-end"><button type="submit" disabled={auditBusy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#043873] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{auditBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} دریافت گزارش</button></div>
        </form>
        {auditError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{auditError}</p>}
        {auditLogs.length > 0 && (
          <div className="mt-4 space-y-3">
            {auditLogs.map((log) => (
              <article key={log.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-bold">{log.agent.firstName} {log.agent.lastName} · <span dir="ltr">{log.agent.user.mobile}</span></p>
                <p className="mt-1 text-sm text-slate-600">مشتری: {log.customer.firstName} {log.customer.lastName} · <span dir="ltr">{log.customer.user.mobile}</span></p>
                <p className="mt-1 text-sm text-slate-600">درخواست: {log.searchRequest.city} · {log.searchRequest.transactionType} · {log.searchRequest.propertyType}</p>
                <p className="mt-1 text-xs text-slate-500">زمان: {new Date(log.accessedAt).toLocaleString("fa-IR")}</p>
                <p className="mt-1 text-xs text-slate-500">کد رویداد: {idText(log.id)}</p>
              </article>
            ))}
          </div>
        )}
        {!auditBusy && auditLogs.length === 0 && !auditError && <p className="mt-3 text-sm text-slate-500">برای مشاهده، فیلترها را تنظیم و «دریافت گزارش» را انتخاب کنید.</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold"><FileSearch className="h-5 w-5 text-[#043873]" /> رفع مغایرت و بررسی املاک تکراری</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">شناسهٔ ملک اصلی را وارد کنید. سامانه کاندیداهای مشابه در محدودهٔ جست‌وجو را برمی‌گرداند و می‌توانید برای هر کاندید پرونده بسازید یا نتیجهٔ پروندهٔ موجود را ثبت کنید.</p>
        <form onSubmit={(event) => void loadDuplicateWork(event)} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-3 text-sm" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} placeholder="شناسهٔ ملک اصلی" dir="ltr" />
          <button type="submit" disabled={matchingBusy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#043873] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{matchingBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} بررسی تشابه</button>
        </form>
        {matchingError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{matchingError}</p>}
        {matchingMessage && <p role="status" className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{matchingMessage}</p>}
        {candidateMatches.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="font-bold">کاندیداهای مشابه</h3>
            {candidateMatches.map((match) => (
              <article key={match.property.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{match.property.city} · {match.property.district || "بدون محله"}</p>
                    <p className="mt-1 text-sm text-slate-600">{match.property.propertyType} · {match.property.area ?? "—"} متر · {match.property.rooms ?? "—"} اتاق</p>
                    <p className="mt-2 text-xs text-slate-500">شناسه: {idText(match.property.id)} · فاصله: {Math.round(match.distanceMeters)} متر</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-800">شباهت {scoreLabel(match.similarityScore)}</span>
                </div>
                <button type="button" disabled={busyReviewId === match.property.id} onClick={() => void createReview(match.property.id)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50">
                  {busyReviewId === match.property.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />} ایجاد پروندهٔ بررسی
                </button>
              </article>
            ))}
          </div>
        )}
        {propertyId.trim() && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <label className="block text-sm font-medium">یادداشت تصمیم بررسی‌ها
              <textarea className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" rows={2} value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="اختیاری" />
            </label>
            <h3 className="mt-4 font-bold">پرونده‌های بررسی این ملک</h3>
            {reviews.length === 0 ? <p className="mt-2 text-sm text-slate-500">پرونده‌ای برای این ملک در پاسخ فعلی وجود ندارد.</p> : (
              <div className="mt-3 space-y-3">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1 text-sm">
                        <p>ملک اصلی: {idText(review.primaryPropertyId)}</p>
                        <p>کاندید: {idText(review.candidatePropertyId)}</p>
                        <p>امتیاز تشابه: <b>{scoreLabel(review.similarityScore)}</b></p>
                        <p>کد پرونده: {idText(review.id)}</p>
                      </div>
                      <DecisionChip decision={review.decision} />
                    </div>
                    {review.notes && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">{review.notes}</p>}
                    {review.decision === null && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" disabled={busyReviewId === review.id} onClick={() => void decideReview(review.id, "SAME_PROPERTY")} className="inline-flex items-center gap-2 rounded-lg bg-[#043873] px-3 py-2 text-sm font-bold text-white disabled:opacity-50">
                          {busyReviewId === review.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} یک ملک
                        </button>
                        <button type="button" disabled={busyReviewId === review.id} onClick={() => void decideReview(review.id, "DIFFERENT_PROPERTY")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold disabled:opacity-50"><XCircle className="h-4 w-4" /> دو ملک متفاوت</button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><LockKeyhole className="h-5 w-5 text-[#043873]" /> بازنشانی رمز عبور کاربر</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">برای امنیت، رمز فقط با شناسهٔ User تغییر می‌کند و پس از آن نشست‌های قبلی آن حساب باطل می‌شوند. API جست‌وجو/فهرست کاربران در بک‌اند فعلی وجود ندارد.</p>
          <form onSubmit={(event) => void resetPassword(event)} className="mt-4 space-y-3">
            <label className="block space-y-1 text-sm font-medium">شناسه User<input value={resetUserId} onChange={(e) => setResetUserId(e.target.value)} dir="ltr" className="w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
            <label className="block space-y-1 text-sm font-medium">رمز جدید<input type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
            {resetError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{resetError}</p>}
            {resetMessage && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{resetMessage}</p>}
            <button type="submit" disabled={resetBusy} className="rounded-xl bg-[#043873] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{resetBusy ? "در حال تغییر..." : "بازنشانی رمز"}</button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold">بررسی پروندهٔ تأیید ملک</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">شناسهٔ پروندهٔ تأیید را وارد کنید تا وضعیت آن ثبت شود. API فهرست پرونده‌های در انتظار بررسی در بک‌اند فعلی وجود ندارد.</p>
          <div className="mt-4 space-y-3">
            <label className="block space-y-1 text-sm font-medium">شناسهٔ پرونده<input value={verificationCaseId} onChange={(e) => setVerificationCaseId(e.target.value)} dir="ltr" className="w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
            <label className="block space-y-1 text-sm font-medium">یادداشت<textarea rows={2} value={verificationNotes} onChange={(e) => setVerificationNotes(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" /></label>
            {verificationError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{verificationError}</p>}
            {verificationMessage && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{verificationMessage}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void reviewVerificationCase("VERIFIED")} disabled={verificationBusy} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"><CheckCircle2 className="h-4 w-4" /> تأیید پرونده</button>
              <button type="button" onClick={() => void reviewVerificationCase("REJECTED")} disabled={verificationBusy} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 disabled:opacity-60"><XCircle className="h-4 w-4" /> رد پرونده</button>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold">سوابق دسترسی به موقعیت دقیق ملک</h2>
          <form onSubmit={(event) => void loadAccessLogs(event)} className="mt-4 flex gap-2">
            <input value={logPropertyId} onChange={(e) => setLogPropertyId(e.target.value)} placeholder="شناسه ملک" dir="ltr" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
            <button type="submit" disabled={logsBusy} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-60">{logsBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "نمایش"}</button>
          </form>
          {logsError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{logsError}</p>}
          {accessLogs.length > 0 && <div className="mt-3 space-y-2">{accessLogs.map((log) => <article key={log.id} className="rounded-lg bg-slate-50 p-3 text-sm"><p>کاربر: {log.user?.mobile ?? log.userId}</p><p>نقش: {log.user?.role ?? "نامشخص"}</p><p>زمان: {new Date(log.accessedAt).toLocaleString("fa-IR")}</p><p>دلیل: {log.reason || "ثبت نشده"}</p></article>)}</div>}
          {!logsBusy && accessLogs.length === 0 && !logsError && <p className="mt-3 text-sm text-slate-500">شناسهٔ ملک را وارد کنید تا سوابق آن نمایش داده شود.</p>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-bold">سوابق عملیات مدیریتی هشتی</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">در این قسمت رویدادهایی مانند تغییر وضعیت تأیید مشاور، ایجاد/ارتقای اشتراک و بازنشانی رمز ثبت‌شده نمایش داده می‌شود. گذرواژه یا هش آن در گزارش ذخیره نمی‌شود.</p>
          </div>
          <form onSubmit={(event) => void loadAdminAuditLogs(event)} className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-sm font-medium">نوع رویداد (اختیاری)
              <input value={adminAuditAction} onChange={(event) => setAdminAuditAction(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" placeholder="AGENT_VERIFICATION" />
            </label>
            <label className="space-y-1 text-sm font-medium">شناسه هدف (اختیاری)
              <input value={adminAuditTargetId} onChange={(event) => setAdminAuditTargetId(event.target.value)} dir="ltr" className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            </label>
            <div className="flex items-end">
              <button type="submit" disabled={adminAuditBusy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#043873] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
                {adminAuditBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} دریافت سوابق
              </button>
            </div>
          </form>
          {adminAuditError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{adminAuditError}</p>}
          {adminAuditLogs.length > 0 ? (
            <div className="mt-4 space-y-3">
              {adminAuditLogs.map((log) => (
                <article key={log.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{log.action}</p>
                      <p className="mt-1 text-sm text-slate-600">عامل: {log.actorMobile ?? "حساب حذف‌شده یا نامشخص"} · نقش: {log.actorRole ?? "نامشخص"}</p>
                      <p className="mt-1 text-sm text-slate-600">هدف: {log.targetType} · {log.targetId ? idText(log.targetId) : "بدون شناسه"}</p>
                    </div>
                    <p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString("fa-IR")}</p>
                  </div>
                  {log.details !== null && log.details !== undefined && (
                    <pre dir="ltr" className="mt-3 overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs leading-6 text-slate-700 whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                  )}
                  {(log.ipAddress || log.userAgent) && (
                    <details className="mt-2 text-xs text-slate-500">
                      <summary className="cursor-pointer">اطلاعات فنی رویداد</summary>
                      {log.ipAddress && <p dir="ltr" className="mt-2">IP: {log.ipAddress}</p>}
                      {log.userAgent && <p dir="ltr" className="mt-1 break-all">User-Agent: {log.userAgent}</p>}
                    </details>
                  )}
                </article>
              ))}
            </div>
          ) : (
            !adminAuditBusy && !adminAuditError && <p className="mt-3 text-sm text-slate-500">برای نمایش سوابق، فیلترها را تنظیم و دریافت سوابق را انتخاب کنید.</p>
          )}
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <h2 className="font-bold text-amber-950">وضعیت ثبت و تاریخچه تأیید مشاور</h2>
          <p className="mt-3 text-sm leading-7 text-amber-900">برای سازگاری با کد قدیمی، isVerified حفظ شده و وضعیت دقیق بررسی با verificationStatus نگهداری می‌شود. تغییر وضعیت مشاور، دلیل تصمیم و رویدادهای مدیریتی در تاریخچه ثبت می‌شوند.</p>
        </section>
      </div>

      <HashtiUserManagementPanel />
      <HashtiVerificationQueuePanel />
      <UserNotificationsPanel userId={user.id} />
    </div>
  );
}

function MiniFeature({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return <div className="rounded-xl border border-slate-200 p-3"><div className="flex items-center gap-2 font-bold">{icon}{title}</div><p className="mt-2 text-xs leading-6 text-slate-600">{detail}</p></div>;
}
function DecisionChip({ decision }: { decision: DuplicateReview["decision"] }) {
  if (decision === "SAME_PROPERTY") return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">یک ملک</span>;
  if (decision === "DIFFERENT_PROPERTY") return <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">دو ملک متفاوت</span>;
  return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">در انتظار تصمیم</span>;
}
