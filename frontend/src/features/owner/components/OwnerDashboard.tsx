"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Building2, LoaderCircle, Save, ShieldCheck, UserRound, UserRoundCheck, Users } from "lucide-react";
import type { UserPublic } from "@/features/auth/api/authApi";
import { UserNotificationsPanel } from "@/shared/components/UserNotificationsPanel";
import { OwnerPropertiesPanel } from "./OwnerPropertiesPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
interface OwnerProfile {
  id: string;
  firstName: string;
  lastName: string;
  user?: { mobile: string };
}
async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { credentials: "include", cache: "no-store", ...init });
  const body = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(body.message || "درخواست به سرور ناموفق بود.");
  return body as T;
}

export function OwnerDashboard({ user }: { user: UserPublic }) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [relationshipBusy, setRelationshipBusy] = useState(false);
  const [relationshipMessage, setRelationshipMessage] = useState<string | null>(null);
  const [relationshipError, setRelationshipError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const id = window.sessionStorage.getItem(`hashti:ownerProfileId:${user.mobile}`);
    setProfileId(id);
    if (!id) {
      setLoadingProfile(false);
      setProfileError("شناسهٔ پروفایل مالک در مرورگر ذخیره نیست. حساب قابل ورود است، اما API فعلی پروفایل مالک را از نشست جاری پیدا نمی‌کند.");
      return;
    }
    (async () => {
      try {
        const result = await requestJson<OwnerProfile>(`/owners/${encodeURIComponent(id)}/profile`);
        if (!active) return;
        setProfile(result);
        setFirstName(result.firstName);
        setLastName(result.lastName);
        setProfileError(null);
      } catch (error: unknown) {
        if (active) setProfileError(error instanceof Error ? error.message : "دریافت پروفایل مالک انجام نشد.");
      } finally {
        if (active) setLoadingProfile(false);
      }
    })();
    return () => { active = false; };
  }, [user.mobile]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profileId) return;
    setSavingProfile(true);
    setProfileError(null);
    setMessage(null);
    try {
      const result = await requestJson<{ id: string; firstName: string; lastName: string }>(
        `/owners/${encodeURIComponent(profileId)}/profile`,
        { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }) }
      );
      setProfile((current) => current ? { ...current, firstName: result.firstName, lastName: result.lastName } : current);
      setMessage("اطلاعات پروفایل ذخیره شد.");
    } catch (error: unknown) {
      setProfileError(error instanceof Error ? error.message : "ذخیرهٔ پروفایل انجام نشد.");
    } finally {
      setSavingProfile(false);
    }
  };

  const setAgentRelationship = async (decision: "approval" | "revoke") => {
    if (!propertyId.trim() || !agentId.trim()) {
      setRelationshipError("شناسهٔ ملک و شناسهٔ پروفایل مشاور را وارد کنید.");
      return;
    }
    setRelationshipBusy(true);
    setRelationshipError(null);
    setRelationshipMessage(null);
    try {
      await requestJson(
        `/properties/${encodeURIComponent(propertyId.trim())}/agents/${encodeURIComponent(agentId.trim())}/${decision}`,
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }
      );
      setRelationshipMessage(decision === "approval" ? "اجازهٔ فعالیت مشاور روی ملک ثبت شد." : "اجازهٔ فعالیت مشاور روی ملک لغو شد.");
    } catch (error: unknown) {
      setRelationshipError(error instanceof Error ? error.message : "تغییر دسترسی مشاور انجام نشد.");
    } finally {
      setRelationshipBusy(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen w-full mr-16 space-y-5 overflow-x-hidden bg-slate-50 px-3 py-4 sm:px-5 lg:mr-64 lg:px-6">
      <aside aria-label="ابزارهای پنل مالک" className="fixed inset-y-0 right-0 z-30 w-16 overflow-x-hidden overflow-y-auto border-l border-slate-200 bg-white p-1.5 shadow-sm sm:p-2 lg:w-64 lg:p-3">
        <h2 className="hidden px-3 py-2 text-base font-black text-slate-900 lg:block">پنل مالک</h2>
        <nav className="grid grid-cols-1 gap-1.5 lg:gap-2" aria-label="ابزارهای مالک">
          {[["profile", "اطلاعات مالک"], ["agent-access", "دسترسی مشاوران"], ["properties", "املاک من"], ["notifications", "اعلان‌ها"]].map(([target, label]) => (
            <button key={target} type="button" title={label} aria-current={selectedTool === target ? "page" : undefined} onClick={() => setSelectedTool(target)} className={`flex min-h-11 min-w-0 items-center justify-center rounded-lg border px-1 py-2 text-center text-[11px] font-semibold leading-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#043873] lg:justify-start lg:px-3 lg:text-right lg:text-sm ${selectedTool === target ? "border-[#043873] bg-blue-50 text-[#043873]" : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-[#043873]"}`}><span className="hidden lg:inline">{label}</span><span className="lg:hidden">{label.slice(0,2)}</span></button>
          ))}
        </nav>
      </aside>
      <div hidden={selectedTool !== "profile"} className="grid gap-3 sm:grid-cols-3">
        <SummaryCard icon={<Building2 className="h-5 w-5" />} label="املاک ثبت‌شده" value="از طریق API فعلی قابل فهرست‌کردن نیست" />
        <SummaryCard icon={<UserRoundCheck className="h-5 w-5" />} label="مشاوران مجاز" value="فهرست کامل در دسترس نیست" />
        <SummaryCard icon={<ShieldCheck className="h-5 w-5" />} label="دسترسی‌ها" value="کنترل سرورمحور" />
      </div>

      <section hidden={selectedTool !== "profile"} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2"><UserRound className="h-5 w-5 text-[#043873]" /><h2 className="text-lg font-bold">اطلاعات مالک</h2></div>
        {loadingProfile ? <p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />در حال دریافت پروفایل...</p> : profile ? (
          <form onSubmit={saveProfile} className="mt-4 grid gap-4 sm:grid-cols-2">
            <p className="sm:col-span-2 text-sm text-slate-600">شماره موبایل: <span dir="ltr" className="font-semibold">{profile.user?.mobile ?? user.mobile}</span></p>
            <label className="space-y-1 text-sm font-medium">نام<input className="w-full rounded-xl border border-slate-300 px-3 py-2.5" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></label>
            <label className="space-y-1 text-sm font-medium">نام خانوادگی<input className="w-full rounded-xl border border-slate-300 px-3 py-2.5" value={lastName} onChange={(e) => setLastName(e.target.value)} required /></label>
            <div className="sm:col-span-2"><button type="submit" disabled={savingProfile} className="inline-flex items-center gap-2 rounded-xl bg-[#043873] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{savingProfile ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}ذخیرهٔ پروفایل</button></div>
          </form>
        ) : (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">{profileError || "پروفایل در دسترس نیست."}</div>
        )}
        {message && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
        {profileError && profile && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{profileError}</p>}
      </section>

      <section hidden={selectedTool !== "agent-access"} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2"><Users className="h-5 w-5 text-[#043873]" /><h2 className="text-lg font-bold">تأیید یا لغو دسترسی مشاور برای یک ملک</h2></div>
        <p className="mt-2 text-sm leading-7 text-slate-600">API فعلی عملیات تأیید/لغو را دارد، اما فهرست املاک مالک و مشاوران مرتبط را برنمی‌گرداند. تا تکمیل آن API، شناسه‌های موجود را وارد کنید. سرور همچنان مالکیت و دسترسی را کنترل می‌کند.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">شناسه ملک<input className="w-full rounded-xl border border-slate-300 px-3 py-2.5" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} dir="ltr" /></label>
          <label className="space-y-1 text-sm font-medium">شناسه پروفایل مشاور<input className="w-full rounded-xl border border-slate-300 px-3 py-2.5" value={agentId} onChange={(e) => setAgentId(e.target.value)} dir="ltr" /></label>
        </div>
        {relationshipError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{relationshipError}</p>}
        {relationshipMessage && <p role="status" className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{relationshipMessage}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => void setAgentRelationship("approval")} disabled={relationshipBusy} className="rounded-lg bg-[#043873] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{relationshipBusy ? "در حال ارسال..." : "تأیید مشاور"}</button>
          <button type="button" onClick={() => void setAgentRelationship("revoke")} disabled={relationshipBusy} className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 disabled:opacity-60">لغو دسترسی</button>
        </div>
      </section>

      <section hidden={selectedTool !== "properties"} className="rounded-2xl border border-dashed border-slate-300 bg-white p-5">
        <h2 className="font-bold">املاک من و تاریخچهٔ تغییرات</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">API فعلی برای مالک، فهرست همهٔ املاک متعلق به حساب و تاریخچهٔ آن‌ها را ارائه نمی‌کند. این بخش بدون API سمت سرور نمی‌تواند اطلاعات واقعی را نمایش دهد؛ هیچ فهرست حدسی از آگهی‌های عمومی جایگزین آن نمی‌شود.</p>
      </section>
      <div hidden={selectedTool !== "properties"}><OwnerPropertiesPanel user={user} /></div>
      <div hidden={selectedTool !== "notifications"}><UserNotificationsPanel userId={user.id} /></div>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-[#043873]">{icon}<p className="text-sm font-semibold text-slate-500">{label}</p></div><p className="mt-3 text-sm font-black leading-6 text-slate-900">{value}</p></div>;
}
