"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminOwners, getAdminOwnerHistory, setAdminOwnerStatus, type AdminOwner, type AdminAuditEntry } from "@/features/admin/api/adminApi";
import { getCurrentUser } from "@/features/auth/api/authApi";

export default function AdminOwnersPage() {
  const [items, setItems] = useState<AdminOwner[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [reason, setReason] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<AdminAuditEntry[]>([]);
  const [historyOwner, setHistoryOwner] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const user = await getCurrentUser();
      if (user.role !== "HASHTI") throw new Error("دسترسی کارکنان هشتی لازم است.");
      const result = await getAdminOwners({ search, isActive: active, page, limit: 20 });
      setItems(result.items); setTotal(result.pagination.total); setTotalPages(result.pagination.totalPages);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "خطا در دریافت مالکان."); }
    finally { setLoading(false); }
  }, [search, active, page]);
  useEffect(() => { void load(); }, [load]);

  async function changeStatus(owner: AdminOwner) {
    if (reason.trim().length < 3) { setError("برای تغییر وضعیت، دلیل حداقل ۳ حرفی وارد کنید."); return; }
    try {
      await setAdminOwnerStatus(owner.id, !owner.user.isActive, reason.trim());
      setReason("");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تغییر وضعیت ناموفق بود."); }
  }
  async function showHistory(owner: AdminOwner) {
    try {
      const result = await getAdminOwnerHistory(owner.id);
      setHistory(result.items); setHistoryOwner(`${owner.firstName} ${owner.lastName}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "دریافت سوابق ناموفق بود."); }
  }

  return <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="border-b border-slate-200 pb-5"><p className="text-sm font-semibold text-amber-700">هشتی / مدیریت</p><h1 className="mt-1 text-3xl font-black">مدیریت مالکان</h1><p className="mt-2 text-sm text-slate-600">جست‌وجو، وضعیت حساب، پروفایل و سوابق ثبت‌شدهٔ تغییرات</p></header>
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      <form onSubmit={e => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[2fr_1fr_auto]">
        <label className="text-sm font-medium">جست‌وجوی نام یا موبایل<input value={searchInput} onChange={e => setSearchInput(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" placeholder="نام، نام خانوادگی یا شماره موبایل" /></label>
        <label className="text-sm font-medium">وضعیت حساب<select value={active} onChange={e => { setActive(e.target.value); setPage(1); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"><option value="">همه</option><option value="true">فعال</option><option value="false">غیرفعال</option></select></label>
        <button className="self-end rounded-lg bg-[#062a5b] px-5 py-2.5 font-semibold text-white">جست‌وجو</button>
      </form>
      <label className="block text-sm font-medium">دلیل تغییر وضعیت (برای ثبت در سوابق)<input value={reason} onChange={e => setReason(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5" placeholder="مثلاً درخواست مالک یا تکمیل بررسی مدارک" /></label>
      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {loading ? <p className="p-8 text-center">در حال دریافت اطلاعات…</p> : <table className="w-full min-w-[760px] text-right text-sm"><thead className="bg-slate-100"><tr><th className="p-3">نام</th><th className="p-3">موبایل</th><th className="p-3">املاک مرتبط</th><th className="p-3">وضعیت</th><th className="p-3">تاریخ ثبت</th><th className="p-3">عملیات</th></tr></thead><tbody>{items.map(owner => <tr key={owner.id} className="border-t border-slate-100"><td className="p-3 font-medium">{owner.firstName} {owner.lastName}</td><td dir="ltr" className="p-3 text-right">{owner.user.mobile}</td><td className="p-3">{owner._count.properties.toLocaleString("fa-IR")}</td><td className="p-3">{owner.user.isActive ? "فعال" : "غیرفعال"}</td><td className="p-3">{new Date(owner.user.createdAt).toLocaleDateString("fa-IR")}</td><td className="flex gap-2 p-3"><button onClick={() => void changeStatus(owner)} className="rounded-md border px-3 py-1.5">{owner.user.isActive ? "غیرفعال‌کردن" : "فعال‌کردن"}</button><button onClick={() => void showHistory(owner)} className="rounded-md border px-3 py-1.5">سوابق</button></td></tr>)}</tbody></table>}
        <footer className="flex items-center justify-between border-t p-3 text-sm"><span>تعداد: {total.toLocaleString("fa-IR")} — صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}</span><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-40">قبلی</button><button disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-40">بعدی</button></div></footer>
      </section>
      {historyOwner && <section className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><h2 className="font-bold">سوابق {historyOwner}</h2><button onClick={() => { setHistoryOwner(""); setHistory([]); }} className="rounded border px-3 py-1">بستن</button></div>{history.length ? <ul className="mt-3 space-y-3">{history.map(item => <li key={item.id} className="border-t pt-3 text-sm"><p className="font-semibold">{item.operation} — {new Date(item.createdAt).toLocaleString("fa-IR")}</p><p className="text-slate-600">عامل: {item.actor.mobile} | دلیل: {item.reason}</p><pre className="mt-1 overflow-x-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify({ before: item.before, after: item.after }, null, 2)}</pre></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">هنوز سابقه‌ای ثبت نشده است.</p>}</section>}
    </div>
  </main>;
}
