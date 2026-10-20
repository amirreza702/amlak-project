"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, LoaderCircle, RefreshCw, Search, ShieldCheck } from "lucide-react";

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

export function OwnerPropertiesPanel({ user, mode = "properties" }: { user: { mobile: string }; mode?: "properties" | "agents" }) {
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [minRooms, setMinRooms] = useState("");
  const [occupancyFilter, setOccupancyFilter] = useState("all");
  const [listingFilter, setListingFilter] = useState("all");
  const [busyAgent, setBusyAgent] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const visibleProperties = useMemo(() => properties.filter((item) => {
    const text = `${item.property.city} ${item.property.district} ${item.property.address} ${item.property.propertyType} ${item.propertyId} ${item.property.agents.map((a) => `${a.agent.firstName} ${a.agent.lastName} ${a.agent.agencyName ?? ""}`).join(" ")}`.toLocaleLowerCase();
    const matchesSearch = text.includes(search.trim().toLocaleLowerCase());
    const listing = item.property.listing;
    const price = listing ? Number(listing.transactionType === "SALE" ? listing.salePrice : listing.transactionType === "RENT" ? listing.rentAmount : listing.depositAmount) : null;
    const area = item.property.area;
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? item.property.isActive : statusFilter === "inactive" ? !item.property.isActive : item.verificationStatus === statusFilter);
    return matchesSearch && matchesStatus && (!cityFilter.trim() || item.property.city.toLocaleLowerCase().includes(cityFilter.trim().toLocaleLowerCase())) && (!districtFilter.trim() || item.property.district.toLocaleLowerCase().includes(districtFilter.trim().toLocaleLowerCase())) && (transactionFilter === "all" || listing?.transactionType === transactionFilter) && (propertyTypeFilter === "all" || item.property.propertyType === propertyTypeFilter) && (minPrice === "" || (price !== null && Number.isFinite(price) && price >= Number(minPrice))) && (maxPrice === "" || (price !== null && Number.isFinite(price) && price <= Number(maxPrice))) && (minArea === "" || (area !== null && area >= Number(minArea))) && (maxArea === "" || (area !== null && area <= Number(maxArea))) && (minRooms === "" || (item.property.rooms !== null && item.property.rooms >= Number(minRooms))) && (occupancyFilter === "all" || item.property.occupancyStatus === occupancyFilter) && (listingFilter === "all" || listing?.status === listingFilter) && (mode !== "agents" || item.property.agents.length > 0);
  }), [properties, search, statusFilter, cityFilter, districtFilter, transactionFilter, propertyTypeFilter, minPrice, maxPrice, minArea, maxArea, minRooms, occupancyFilter, listingFilter, mode]);

  const updateAgentAccess = async (propertyId: string, agentId: string, action: "approval" | "revoke") => {
    setBusyAgent(`${propertyId}:${agentId}`); setActionMessage(null); setActionError(null);
    try {
      const response = await fetch(`${API_URL}/properties/${encodeURIComponent(propertyId)}/agents/${encodeURIComponent(agentId)}/${action}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const body = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(body.message || "تغییر دسترسی مشاور انجام نشد.");
      setActionMessage(action === "approval" ? "دسترسی مشاور تأیید شد." : "دسترسی مشاور لغو شد.");
      setReload((value) => value + 1);
    } catch (error) { setActionError(error instanceof Error ? error.message : "تغییر دسترسی مشاور انجام نشد."); }
    finally { setBusyAgent(null); }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/owners/me/properties`, { credentials: "include", cache: "no-store" });
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
        <h2 className="flex items-center gap-2 text-lg font-bold"><Building2 className="h-5 w-5 text-[#043873]" /> {mode === "agents" ? "مدیریت مشاوران مرتبط با املاک" : "مدیریت املاک من"}</h2>
        <button type="button" onClick={() => setReload((value) => value + 1)} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50">
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} تازه‌سازی
        </button>
      </div>
      <p className="text-sm leading-7 text-slate-600">فهرست بر اساس ارتباط‌های واقعی مالکیت خوانده می‌شود؛ املاک عمومی دیگران نمایش داده نمی‌شوند. از جست‌وجو و فیلتر برای محدودکردن فهرست استفاده کنید.</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><label className="relative block sm:col-span-2"><Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" /><input aria-label="جست‌وجوی ملک یا مشاور" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی نشانی، شناسه یا مشاور..." className="w-full rounded-xl border border-slate-300 py-2.5 pr-9 pl-3 text-sm" /></label><input aria-label="شهر" value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} placeholder="شهر" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /><input aria-label="محله" value={districtFilter} onChange={(event) => setDistrictFilter(event.target.value)} placeholder="محله / منطقه" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /><select aria-label="نوع ملک" value={propertyTypeFilter} onChange={(event) => setPropertyTypeFilter(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"><option value="all">همه انواع ملک</option><option value="APARTMENT">آپارتمان</option><option value="HOUSE">خانه</option><option value="VILLA">ویلا</option><option value="LAND">زمین</option><option value="SHOP">مغازه</option><option value="OFFICE">اداری</option><option value="GARDEN">باغ</option></select><select aria-label="نوع معامله" value={transactionFilter} onChange={(event) => setTransactionFilter(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"><option value="all">همه معاملات</option><option value="SALE">فروش</option><option value="FULL_DEPOSIT">رهن کامل</option><option value="RENT">اجاره</option></select><input aria-label="حداقل قیمت" type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="حداقل قیمت (تومان)" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /><input aria-label="حداکثر قیمت" type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="حداکثر قیمت (تومان)" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /><input aria-label="حداقل متراژ" type="number" min="0" value={minArea} onChange={(event) => setMinArea(event.target.value)} placeholder="حداقل متراژ (متر)" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /><input aria-label="حداکثر متراژ" type="number" min="0" value={maxArea} onChange={(event) => setMaxArea(event.target.value)} placeholder="حداکثر متراژ (متر)" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /><input aria-label="حداقل اتاق" type="number" min="0" value={minRooms} onChange={(event) => setMinRooms(event.target.value)} placeholder="حداقل تعداد اتاق" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /><select aria-label="وضعیت سکونت" value={occupancyFilter} onChange={(event) => setOccupancyFilter(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"><option value="all">همه وضعیت‌های سکونت</option><option value="VACANT">خالی</option><option value="OCCUPIED">ساکن دارد</option></select><select aria-label="وضعیت آگهی" value={listingFilter} onChange={(event) => setListingFilter(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"><option value="all">همه وضعیت‌های آگهی</option><option value="DRAFT">پیش‌نویس</option><option value="PUBLISHED">منتشرشده</option><option value="REJECTED">ردشده</option><option value="EXPIRED">منقضی</option></select><select aria-label="وضعیت ملک یا مالکیت" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"><option value="all">همه وضعیت‌ها</option><option value="active">ملک فعال</option><option value="inactive">ملک غیرفعال</option><option value="PENDING">مالکیت در انتظار</option><option value="VERIFIED">مالکیت تأییدشده</option><option value="REJECTED">مالکیت ردشده</option></select></div>
      {actionError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
      {actionMessage && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{actionMessage}</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> در حال دریافت املاک...</p>
        : !error && visibleProperties.length === 0 ? <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{properties.length === 0 ? "هنوز ملکی به این پروفایل مالک متصل نشده است." : "موردی با این جست‌وجو و فیلتر پیدا نشد."}</p>
        : <div className="space-y-3">{visibleProperties.map((item) => (
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
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-[#043873]" /> مدیریت مشاوران مرتبط</p>
              {item.property.agents.length ? item.property.agents.map((relation) => (
                <div key={relation.agentId} className="mb-2 rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-semibold">{relation.agent.firstName} {relation.agent.lastName}</p>
                  <p className="mt-1 text-xs text-slate-500">{relation.agent.agencyName || "بدون نام آژانس"} · {relation.status} · {relation.approvedByOwner ? "اجازه فعالیت داده شده" : "در انتظار اجازه مالک"}</p>
                  <p dir="ltr" className="mt-1 text-xs text-slate-500">{relation.agentId}</p>
                  <div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={busyAgent !== null} onClick={() => void updateAgentAccess(item.propertyId, relation.agentId, "approval")} className="rounded-lg bg-[#043873] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busyAgent === `${item.propertyId}:${relation.agentId}` ? "در حال ثبت..." : "تأیید دسترسی"}</button><button type="button" disabled={busyAgent !== null} onClick={() => void updateAgentAccess(item.propertyId, relation.agentId, "revoke")} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-50">لغو دسترسی</button></div>
                </div>
              )) : <p className="text-sm text-slate-500">مشاوری به این ملک متصل نشده است.</p>}
            </div>
          </article>
        ))}</div>}
    </section>
  );
}
