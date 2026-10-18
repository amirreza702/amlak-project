"use client";

import { useState, type FormEvent, type ReactNode } from "react";
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
          <MiniFeature icon={<Users className="h-5 w-5" />} title="حساب‌ها و اعتبار" detail="مدیریت کامل کاربران و اشتراک‌ها به API بیشتر نیاز دارد." />
          <MiniFeature icon={<FileSearch className="h-5 w-5" />} title="مغایرت املاک" detail="بررسی مشابهت، ایجاد پرونده و ثبت تصمیم فعال است." />
          <MiniFeature icon={<LockKeyhole className="h-5 w-5" />} title="بازنشانی رمز" detail="رمز کاربر با شناسهٔ User قابل تغییر است." />
          <MiniFeature icon={<ShieldCheck className="h-5 w-5" />} title="سوابق دسترسی" detail="سوابق دسترسی به موقعیت دقیق ملک قابل مشاهده است." />
        </div>
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

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <h2 className="font-bold text-amber-950">قابلیت‌های مدیریت که API موجود ندارند</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-amber-900">
            <li>فهرست و تأیید حساب مشاوران: مسیر خواندن صف انتظار و تغییر امن وضعیت تأیید وجود ندارد.</li>
            <li>مدیریت اشتراک و ماندهٔ اعتبار: API برای فهرست پلن‌ها، اشتراک مشاور یا سوابق مصرف در اختیار پنل هشتی نیست.</li>
            <li>فهرست کاربران و سوابق عملیات مدیریتی: نیاز به APIهای خواندن دارد که فعلاً تعریف نشده‌اند.</li>
          </ul>
          <p className="mt-3 text-xs leading-6 text-amber-900">این موارد عمداً به شکل دادهٔ ساختگی نمایش داده نمی‌شوند؛ پیاده‌سازی واقعی آن‌ها مستلزم اجازهٔ جداگانه برای تغییر بک‌اند است.</p>
        </section>
      </div>

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
