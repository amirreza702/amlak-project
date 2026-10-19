"use client";

import { useEffect, useState } from "react";
import { Building2, LoaderCircle, RefreshCw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
interface OwnerProperty {
  propertyId: string; share: number; isPrimary: boolean;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  property: {
    id: string; propertyType: string; city: string; district: string; address: string;
    area: number | null; rooms: number | null; isActive: boolean; occupancyStatus: string;
    listing: { transactionType: string; salePrice: string | number | null; depositAmount: string | number | null; rentAmount: string | number | null; status: string } | null;
    agents: Array<{ agentId: string; status: string; approvedByOwner: boolean; agent: { firstName: string; lastName: string; agencyName: string | null } }>;
  };
}

export function OwnerPropertiesPanel({ user }: { user: { mobile: string } }) {
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError(null);
      const ownerId = window.sessionStorage.getItem(`hashti:ownerProfileId:${user.mobile}`);
      if (!ownerId) {
        if (active) { setProperties([]); setError("شناسه پروفایل مالک در نشست مرورگر موجود نیست؛ ابتدا دوباره وارد شوید."); setLoading(false); }
        return;
      }
      try {
        const response = await fetch(`${API_URL}/owners/${encodeURIComponent(ownerId)}/properties`, { credentials: "include", cache: "no-store" });
        const body = await response.json().catch(() => ({})) as { message?: string; properties?: OwnerProperty[] };
        if (!response.ok) throw new Error(body.message || "دریافت املاک مالک ناموفق بود.");
        if (active) setProperties(body.properties ?? []);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "دریافت املاک مالک ناموفق بود.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [user.mobile, reload]);

  return (
    <section className="space-y-4 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Building2 className="h-5 w-5 text-[#043873]" /> املاک مرتبط با پروفایل من</h2>
        <button type="button" onClick={() => setReload((value) => value + 1)} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50">
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} تازه‌سازی
        </button>
      </div>
      <p className="text-sm leading-7 text-slate-600">فهرست بر اساس ارتباط‌های واقعی مالکیت خوانده می‌شود؛ املاک عمومیِ دیگران نمایش داده نمی‌شوند.</p>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> در حال دریافت املاک...</p>
        : !error && properties.length === 0 ? <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">هنوز ملکی به این پروفایل مالک متصل نشده است.</p>
        : <div className="space-y-3">{properties.map((item) => (
          <article key={item.propertyId} className="space-y-3 rounded-xl border border-slate-200 p-4">
            <div>
              <h3 className="font-bold">{item.property.city}، {item.property.district} · {item.property.propertyType}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.property.address}</p>
              <p className="mt-1 text-xs text-slate-500">شناسه ملک: <span dir="ltr" className="font-mono">{item.propertyId}</span></p>
              <p className="mt-1 text-xs text-slate-500">سهم: {item.share.toLocaleString("fa-IR")} دانگ · وضعیت مالکیت: {({ PENDING: "در انتظار", VERIFIED: "تأییدشده", REJECTED: "ردشده" })[item.verificationStatus]}</p>
              {item.property.listing && <p className="mt-1 text-sm text-slate-700">آگهی: {item.property.listing.status} · {item.property.listing.transactionType}</p>}
              {item.property.listing?.salePrice != null && <p className="mt-1 text-sm text-slate-700">قیمت فروش: {Number(item.property.listing.salePrice).toLocaleString("fa-IR")} ریال</p>}
              {item.property.listing?.depositAmount != null && <p className="mt-1 text-sm text-slate-700">ودیعه: {Number(item.property.listing.depositAmount).toLocaleString("fa-IR")} ریال</p>}
              {item.property.listing?.rentAmount != null && <p className="mt-1 text-sm text-slate-700">اجاره: {Number(item.property.listing.rentAmount).toLocaleString("fa-IR")} ریال</p>}
              <p className="mt-1 text-xs text-slate-500">{item.property.isActive ? "ملک فعال است" : "ملک غیرفعال است"} · {item.isPrimary ? "مالک اصلی" : "مالک مشترک"}</p>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-2 text-sm font-semibold">مشاوران مرتبط</p>
              {item.property.agents.length ? item.property.agents.map((relation) => (
                <div key={relation.agentId} className="mb-2 rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-semibold">{relation.agent.firstName} {relation.agent.lastName}</p>
                  <p className="mt-1 text-xs text-slate-500">{relation.agent.agencyName || "بدون نام آژانس"} · {relation.status} · {relation.approvedByOwner ? "اجازه فعالیت داده شده" : "در انتظار اجازه مالک"}</p>
                  <p dir="ltr" className="mt-1 text-xs text-slate-500">{relation.agentId}</p>
                </div>
              )) : <p className="text-sm text-slate-500">مشاوری به این ملک متصل نشده است.</p>}
            </div>
          </article>
        ))}</div>}
    </section>
  );
}
