"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { type AdminStaff, getAdminStaff } from "@/features/admin/api/adminApi";
import { ADMIN_PERMISSION_OPTIONS, createAdminStaff, updateAdminStaffPermissions } from "@/features/admin/api/adminApi";
import { getCurrentUser } from "@/features/auth/api/authApi";

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["USERS_READ"]);
  const [editing, setEditing] = useState<AdminStaff | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const user = await getCurrentUser();
      if (user.role !== "HASHTI") throw new Error("دسترسی کارکنان هشتی لازم است.");
      const result = await getAdminStaff();
      setStaff(result.items);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "دریافت فهرست کارکنان ناموفق بود."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  function toggle(value: string, selected: string[], setter: (values: string[]) => void) {
    setter(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);
  }
  async function createStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reason.trim().length < 3) { setError("برای ایجاد حساب، دلیل ثبت کنید."); return; }
    try {
      await createAdminStaff({ mobile, password, permissions, reason: reason.trim() });
      setMobile(""); setPassword(""); setReason(""); setPermissions(["USERS_READ"]); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "ایجاد حساب کارکنان ناموفق بود."); }
  }
  async function savePermissions() {
    if (!editing || reason.trim().length < 3) { setError("برای تغییر دسترسی، دلیل ثبت کنید."); return; }
    try {
      await updateAdminStaffPermissions(editing.id, editPermissions, reason.trim());
      setEditing(null); setReason(""); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تغییر دسترسی ناموفق بود."); }
  }

  return <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8"><div className="mx-auto max-w-6xl space-y-5">
    <header className="border-b border-slate-200 pb-5"><p className="text-sm font-semibold text-amber-700">هشتی / مدیریت ارشد</p><h1 className="mt-1 text-3xl font-black">مدیریت کارکنان و دسترسی‌ها</h1><p className="mt-2 text-sm text-slate-600">حساب کارکنان به‌صورت جداگانه ایجاد می‌شود و مجوزهای هر حساب قابل کنترل است.</p></header>
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
    <form onSubmit={createStaff} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold">ایجاد حساب کارمند</h2><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">شماره موبایل<input required value={mobile} onChange={e => setMobile(e.target.value)} pattern="09[0-9]{9}" placeholder="09123456789" className="mt-1 w-full rounded-lg border px-3 py-2.5" /></label><label className="text-sm">رمز اولیه (حداقل ۱۲ کاراکتر)<input required minLength={12} type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2.5" /></label></div>
      <fieldset><legend className="mb-2 text-sm font-semibold">مجوزها</legend><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{ADMIN_PERMISSION_OPTIONS.map(option => <label key={option.value} className="flex items-center gap-2 rounded-lg border p-3 text-sm"><input type="checkbox" checked={permissions.includes(option.value)} onChange={() => toggle(option.value, permissions, setPermissions)} />{option.label}</label>)}</div></fieldset>
      <label className="block text-sm">دلیل ایجاد حساب<input required minLength={3} value={reason} onChange={e => setReason(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2.5" /></label><button className="rounded-lg bg-[#062a5b] px-5 py-2.5 font-semibold text-white">ایجاد حساب و ثبت سابقه</button>
    </form>
    <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><h2 className="p-4 text-lg font-bold">حساب‌های کارکنان</h2>{loading ? <p className="p-6">در حال دریافت اطلاعات…</p> : <table className="w-full min-w-[750px] text-right text-sm"><thead className="bg-slate-100"><tr><th className="p-3">موبایل</th><th className="p-3">سطح</th><th className="p-3">مجوزها</th><th className="p-3">وضعیت</th><th className="p-3">عملیات</th></tr></thead><tbody>{staff.map(user => <tr key={user.id} className="border-t"><td dir="ltr" className="p-3 text-right">{user.mobile}</td><td className="p-3">{user.isSuperAdmin ? "مدیر ارشد هشتی" : "کارمند هشتی"}</td><td className="p-3">{user.isSuperAdmin ? "همه مجوزها" : (user.adminPermissions || []).map(value => ADMIN_PERMISSION_OPTIONS.find(o => o.value === value)?.label || value).join("، ") || "بدون مجوز"}</td><td className="p-3">{user.isActive ? "فعال" : "غیرفعال"}</td><td className="p-3">{!user.isSuperAdmin && <button onClick={() => { setEditing(user); setEditPermissions(user.adminPermissions || []); }} className="rounded-md border px-3 py-1.5">ویرایش دسترسی</button>}</td></tr>)}</tbody></table>}</section>
    {editing && <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-bold">تغییر دسترسی {editing.mobile}</h2><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{ADMIN_PERMISSION_OPTIONS.map(option => <label key={option.value} className="flex items-center gap-2 rounded-lg border p-3 text-sm"><input type="checkbox" checked={editPermissions.includes(option.value)} onChange={() => toggle(option.value, editPermissions, setEditPermissions)} />{option.label}</label>)}</div><div className="flex gap-2"><button onClick={() => void savePermissions()} className="rounded-lg bg-[#062a5b] px-5 py-2.5 text-white">ذخیره دسترسی و ثبت سابقه</button><button onClick={() => setEditing(null)} className="rounded-lg border px-5 py-2.5">انصراف</button></div></section>}
  </div></main>;
}
