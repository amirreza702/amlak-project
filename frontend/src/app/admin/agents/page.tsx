"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminAgents, getAdminAgentHistory, getAdminSubscriptionPlans, setAdminAgentVerification, setAdminAgentSubscription, setAdminUserStatus, type AdminAgent, type AdminAuditEntry, type SubscriptionPlan } from "@/features/admin/api/adminApi";
import { getCurrentUser } from "@/features/auth/api/authApi";

export default function AdminAgentsPage() {
  const [items, setItems] = useState<AdminAgent[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [verified, setVerified] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [reason, setReason] = useState("");
  const [planId, setPlanId] = useState("");
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 10));
  const [expiresAt, setExpiresAt] = useState("");
  const [subscriptionAgent, setSubscriptionAgent] = useState<AdminAgent | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<AdminAuditEntry[]>([]);
  const [historyAgent, setHistoryAgent] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const user = await getCurrentUser();
      if (user.role !== "HASHTI") throw new Error("دسترسی کارکنان هشتی لازم است.");
      const result = await getAdminAgents({ search, isActive: active, isVerified: verified, subscriptionStatus, page, limit: 20 });
      setItems(result.items); setTotal(result.pagination.total); setTotalPages(result.pagination.totalPages);
      const planResult = await getAdminSubscriptionPlans(); setPlans(planResult.items);
      if (!planId && planResult.items[0]) setPlanId(planResult.items[0].id);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "خطا در دریافت مشاوران."); }
    finally { setLoading(false); }
  }, [search, active, verified, subscriptionStatus, page, planId]);
  useEffect(() => { void load(); }, [load]);

  async function verify(agent: AdminAgent) {
    if (reason.trim().length < 3) { setError("برای تغییر وضعیت تأیید، دلیل وارد کنید."); return; }
    try { await setAdminAgentVerification(agent.id, !agent.isVerified, reason.trim()); setReason(""); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "تغییر تأیید مشاور ناموفق بود."); }
  }
  async function accountStatus(agent: AdminAgent) {
    if (reason.trim().length < 3) { setError("برای تغییر وضعیت حساب، دلیل وارد کنید."); return; }
    try { await setAdminUserStatus(agent.user.id, !agent.user.isActive, reason.trim()); setReason(""); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "تغییر وضعیت حساب ناموفق بود."); }
  }
  async function saveSubscription() {
    if (!subscriptionAgent || !planId || reason.trim().length < 3) { setError("مشاور، طرح و دلیل معتبر را انتخاب کنید."); return; }
    try {
      await setAdminAgentSubscription(subscriptionAgent.id, { planId, status: "ACTIVE", startsAt: new Date(startsAt).toISOString(), ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}), reason: reason.trim() });
      setReason(""); setSubscriptionAgent(null); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "ثبت اشتراک ناموفق بود."); }
  }
  async function showHistory(agent: AdminAgent) {
    try { const result = await getAdminAgentHistory(agent.id); setHistory(result.items); setHistoryAgent(`${agent.firstName} ${agent.lastName}`); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "دریافت سوابق ناموفق بود."); }
  }

  return <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8"><div className="mx-auto max-w-7xl space-y-5">
    <header className="border-b border-slate-200 pb-5"><p className="text-sm font-semibold text-amber-700">هشتی / مدیریت</p><h1 className="mt-1 text-3xl font-black">مدیریت مشاوران</h1><p className="mt-2 text-sm text-slate-600">فیلتر وضعیت، تأیید مشاور، اشتراک و تاریخچهٔ تغییرات</p></header>
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
    <form onSubmit={e => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-sm font-medium">جست‌وجو<input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="نام، موبایل یا آژانس" className="mt-1 w-full rounded-lg border px-3 py-2.5" /></label>
      <label className="text-sm font-medium">حساب<select value={active} onChange={e => { setActive(e.target.value); setPage(1); }} className="mt-1 w-full rounded-lg border bg-white px-3 py-2.5"><option value="">همه</option><option value="true">فعال</option><option value="false">غیرفعال</option></select></label>
      <label className="text-sm font-medium">تأیید هشتی<select value={verified} onChange={e => { setVerified(e.target.value); setPage(1); }} className="mt-1 w-full rounded-lg border bg-white px-3 py-2.5"><option value="">همه</option><option value="true">تأییدشده</option><option value="false">تأییدنشده</option></select></label>
      <label className="text-sm font-medium">اشتراک<select value={subscriptionStatus} onChange={e => { setSubscriptionStatus(e.target.value); setPage(1); }} className="mt-1 w-full rounded-lg border bg-white px-3 py-2.5"><option value="">همه</option><option value="ACTIVE">فعال</option><option value="SUSPENDED">تعلیق</option><option value="CANCELLED">لغوشده</option><option value="EXPIRED">منقضی</option></select></label>
      <button className="rounded-lg bg-[#062a5b] px-5 py-2.5 font-semibold text-white sm:col-span-2 lg:col-span-4">جست‌وجو و اعمال فیلتر</button>
    </form>
    <label className="block text-sm font-medium">دلیل عملیات (در سوابق ثبت می‌شود)<input value={reason} onChange={e => setReason(e.target.value)} className="mt-1 w-full rounded-lg border bg-white px-3 py-2.5" placeholder="دلیل تأیید، تعلیق حساب یا تغییر اشتراک" /></label>
    <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">{loading ? <p className="p-8 text-center">در حال دریافت اطلاعات…</p> : <table className="w-full min-w-[1050px] text-right text-sm"><thead className="bg-slate-100"><tr><th className="p-3">نام مشاور</th><th className="p-3">موبایل / آژانس</th><th className="p-3">حساب</th><th className="p-3">تأیید</th><th className="p-3">آخرین اشتراک</th><th className="p-3">عملیات</th></tr></thead><tbody>{items.map(agent => <tr key={agent.id} className="border-t border-slate-100"><td className="p-3 font-medium">{agent.firstName} {agent.lastName}</td><td className="p-3"><div dir="ltr" className="text-right">{agent.user.mobile}</div><div className="text-xs text-slate-500">{agent.agencyName || "بدون آژانس"}</div></td><td className="p-3">{agent.user.isActive ? "فعال" : "غیرفعال"}</td><td className="p-3">{agent.isVerified ? "تأییدشده" : "تأییدنشده"}</td><td className="p-3">{agent.subscriptions[0]?.subscriptionPlan?.name || "بدون اشتراک"} ({agent.subscriptions[0]?.status || "—"})</td><td className="flex flex-wrap gap-2 p-3"><button onClick={() => void verify(agent)} className="rounded-md border px-2.5 py-1.5">{agent.isVerified ? "لغو تأیید" : "تأیید"}</button><button onClick={() => void accountStatus(agent)} className="rounded-md border px-2.5 py-1.5">{agent.user.isActive ? "غیرفعال‌کردن" : "فعال‌کردن"}</button><button onClick={() => setSubscriptionAgent(agent)} className="rounded-md border px-2.5 py-1.5">مدیریت اشتراک</button><button onClick={() => void showHistory(agent)} className="rounded-md border px-2.5 py-1.5">سوابق</button></td></tr>)}</tbody></table>}
      <footer className="flex items-center justify-between border-t p-3 text-sm"><span>تعداد: {total.toLocaleString("fa-IR")} — صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}</span><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-40">قبلی</button><button disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-40">بعدی</button></div></footer>
    </section>
    {subscriptionAgent && <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><h2 className="font-bold">اشتراک {subscriptionAgent.firstName} {subscriptionAgent.lastName}</h2><button onClick={() => setSubscriptionAgent(null)} className="rounded border px-3 py-1">بستن</button></div><div className="grid gap-3 sm:grid-cols-3"><label className="text-sm">طرح<select value={planId} onChange={e => setPlanId(e.target.value)} className="mt-1 w-full rounded border bg-white px-3 py-2">{plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name} — سقف {plan.monthlyContactLimit}</option>)}</select></label><label className="text-sm">شروع<input type="date" value={startsAt} onChange={e => setStartsAt(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label><label className="text-sm">پایان (اختیاری)<input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label></div><button onClick={() => void saveSubscription()} className="rounded-lg bg-[#062a5b] px-5 py-2.5 font-semibold text-white">ثبت اشتراک جدید</button><p className="text-xs text-slate-500">برای حفظ تاریخچه، اشتراک جدید ثبت می‌شود و سوابق قبلی حذف نمی‌شوند.</p></section>}
    {historyAgent && <section className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><h2 className="font-bold">سوابق {historyAgent}</h2><button onClick={() => { setHistoryAgent(""); setHistory([]); }} className="rounded border px-3 py-1">بستن</button></div>{history.length ? <ul className="mt-3 space-y-3">{history.map(item => <li key={item.id} className="border-t pt-3 text-sm"><p className="font-semibold">{item.operation} — {new Date(item.createdAt).toLocaleString("fa-IR")}</p><p className="text-slate-600">عامل: {item.actor.mobile} | دلیل: {item.reason}</p><pre className="mt-1 overflow-x-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify({ before: item.before, after: item.after }, null, 2)}</pre></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">هنوز سابقه‌ای ثبت نشده است.</p>}</section>}
  </div></main>;
}
