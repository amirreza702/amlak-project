"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  Check,
  ChevronLeft,
  Edit3,
  FileText,
  Heart,
  LoaderCircle,
  MapPin,
  Plus,
  Save,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { AUTH_STATE_CHANGE_EVENT, getCurrentUser, type UserPublic } from "@/features/auth/api/authApi";
import { getCurrentCustomerProfile } from "../api/customerSearchRequestApi";
import type {
  CustomerProfileForRequest,
  CustomerRequestPropertyType,
  CustomerRequestTransactionType,
} from "../types/customerSearchRequest";
import {
  closeCustomerSearchRequest,
  getCustomerFavorites,
  getCustomerSearchRequests,
  getPublicProperty,
  removeCustomerFavorite,
  updateCustomerProfile,
  updateCustomerSearchRequest,
  type CustomerFavoriteRecord,
  type CustomerSearchRequestRecord,
  type PublicPropertyRecord,
} from "../api/customerDashboardApi";
import {
  getUserNotifications,
  markUserNotificationAsRead,
  type UserNotification,
} from "@/features/notification/api/notificationApi";

type DashboardTab = "requests" | "favorites" | "notifications" | "profile";

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#043873] focus:ring-2 focus:ring-[#043873]/10";
const transactionOptions: Array<{ value: CustomerRequestTransactionType; label: string }> = [
  { value: "SALE", label: "خرید" },
  { value: "FULL_DEPOSIT", label: "رهن کامل" },
  { value: "RENT", label: "اجاره" },
];
const propertyOptions: Array<{ value: CustomerRequestPropertyType; label: string }> = [
  { value: "APARTMENT", label: "آپارتمان" },
  { value: "HOUSE", label: "خانه" },
  { value: "VILLA", label: "ویلا" },
  { value: "LAND", label: "زمین" },
  { value: "SHOP", label: "مغازه" },
  { value: "OFFICE", label: "اداری" },
  { value: "GARDEN", label: "باغ" },
];

function money(value: string | number | null): string {
  if (value === null || value === "") return "تعیین نشده";
  const number = Number(value);
  return Number.isFinite(number) ? new Intl.NumberFormat("fa-IR").format(number) + " تومان" : String(value);
}
function prettyDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("fa-IR");
}
function transactionLabel(value: string): string {
  return transactionOptions.find((option) => option.value === value)?.label ?? value;
}
function propertyLabel(value: string): string {
  return propertyOptions.find((option) => option.value === value)?.label ?? value;
}

export function CustomerDashboard() {
  const [tab, setTab] = useState<DashboardTab | null>(null);
  const [user, setUser] = useState<UserPublic | null>(null);
  const [profile, setProfile] = useState<CustomerProfileForRequest | null>(null);
  const [requests, setRequests] = useState<CustomerSearchRequestRecord[]>([]);
  const [favorites, setFavorites] = useState<Array<CustomerFavoriteRecord & { property: PublicPropertyRecord | null }>>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ city: "", budget: "", description: "", transactionType: "SALE" as CustomerRequestTransactionType, propertyType: "APARTMENT" as CustomerRequestPropertyType });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const refreshData = useCallback(async (customer: CustomerProfileForRequest, authenticatedUser: UserPublic) => {
    const [requestsResult, favoritesResult, notificationsResult] = await Promise.allSettled([
      getCustomerSearchRequests(customer.id),
      getCustomerFavorites(customer.id),
      getUserNotifications(authenticatedUser.id),
    ]);

    if (requestsResult.status === "fulfilled") setRequests(requestsResult.value);
    else setActionError(requestsResult.reason instanceof Error ? requestsResult.reason.message : "دریافت درخواست‌ها انجام نشد.");

    if (favoritesResult.status === "fulfilled") {
      const favoriteRecords = favoritesResult.value;
      const enriched = await Promise.all(favoriteRecords.map(async (favorite) => {
        try {
          return { ...favorite, property: await getPublicProperty(favorite.propertyId) };
        } catch {
          return { ...favorite, property: null };
        }
      }));
      setFavorites(enriched);
    } else {
      setActionError(favoritesResult.reason instanceof Error ? favoritesResult.reason.message : "دریافت علاقه‌مندی‌ها انجام نشد.");
    }

    if (notificationsResult.status === "fulfilled") setNotifications(notificationsResult.value);
    else setNotifications([]);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const authenticatedUser = await getCurrentUser();
        if (authenticatedUser.role !== "CUSTOMER") {
          throw new Error("این صفحه فقط برای حساب مشتری در دسترس است.");
        }
        const customerProfile = await getCurrentCustomerProfile();
        if (!active) return;
        setUser(authenticatedUser);
        setProfile(customerProfile);
        setFirstName(customerProfile.firstName);
        setLastName(customerProfile.lastName);
        await refreshData(customerProfile, authenticatedUser);
      } catch (error: unknown) {
        if (active) setPageError(error instanceof Error ? error.message : "دریافت پنل مشتری انجام نشد.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [refreshData]);

  // پاک‌سازی اطلاعات خصوصی صفحه وقتی نشست سراسری خروج کند یا نقش عوض شود.
  useEffect(() => {
    let active = true;

    const handleAuthStateChange = async () => {
      try {
        const authenticatedUser = await getCurrentUser();
        if (authenticatedUser.role !== "CUSTOMER") {
          throw new Error("این صفحه فقط برای حساب مشتری در دسترس است.");
        }
        const customerProfile = await getCurrentCustomerProfile();
        if (!active) return;
        setUser(authenticatedUser);
        setProfile(customerProfile);
        setFirstName(customerProfile.firstName);
        setLastName(customerProfile.lastName);
        setPageError(null);
        await refreshData(customerProfile, authenticatedUser);
      } catch {
        if (!active) return;
        setUser(null);
        setProfile(null);
        setRequests([]);
        setFavorites([]);
        setNotifications([]);
        setEditingId(null);
        setPageError("برای مشاهدهٔ پنل، با حساب مشتری وارد شوید.");
        setLoading(false);
      }
    };

    window.addEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange);
    return () => {
      active = false;
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange);
    };
  }, [refreshData]);

  const activeCount = useMemo(() => requests.filter((request) => request.status === "ACTIVE").length, [requests]);
  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.isRead).length, [notifications]);

  const runAction = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    setActionError(null);
    setActionMessage(null);
    try {
      await action();
      if (profile && user) await refreshData(profile, user);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : "عملیات انجام نشد.");
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (request: CustomerSearchRequestRecord) => {
    setEditingId(request.id);
    setEditValues({
      city: request.city,
      budget: request.budget === null ? "" : String(request.budget),
      description: request.description ?? "",
      transactionType: request.transactionType,
      propertyType: request.propertyType,
    });
    setActionError(null);
    setActionMessage(null);
  };

  const saveEdit = async (requestId: string) => {
    if (!profile) return;
    const city = editValues.city.trim();
    if (!city) {
      setActionError("شهر موردنظر را وارد کنید.");
      return;
    }
    let budget: number | null = null;
    if (editValues.budget.trim()) {
      budget = Number(editValues.budget);
      if (!Number.isFinite(budget) || budget < 0) {
        setActionError("بودجه باید عددی معتبر و صفر یا بیشتر باشد.");
        return;
      }
    }
    await runAction(requestId, async () => {
      await updateCustomerSearchRequest(profile.id, requestId, {
        city,
        budget,
        description: editValues.description.trim() || null,
        transactionType: editValues.transactionType,
        propertyType: editValues.propertyType,
      });
      setEditingId(null);
      setActionMessage("درخواست با موفقیت به‌روزرسانی شد.");
    });
  };

  const tabItems: Array<{ id: DashboardTab; label: string; count?: number; icon: typeof FileText }> = [
    { id: "requests", label: "درخواست‌های من", count: requests.length, icon: FileText },
    { id: "favorites", label: "علاقه‌مندی‌ها", count: favorites.length, icon: Heart },
    { id: "notifications", label: "اعلان‌ها", count: unreadCount, icon: Bell },
    { id: "profile", label: "پروفایل", icon: UserRound },
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <aside aria-label="ابزارهای پنل مشتری" className="fixed inset-y-0 right-0 z-20 w-20 overflow-y-auto border-l border-slate-200 bg-white p-2 shadow-sm lg:w-64 lg:p-3">
        <h2 className="hidden px-3 py-2 text-base font-black text-slate-900 lg:block">پنل مشتری</h2>
        <nav className="grid grid-cols-1 gap-2" aria-label="ابزارهای مشتری">
          {tabItems.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" title={item.label} aria-current={tab === item.id ? "page" : undefined} onClick={() => setTab(item.id)} className={`flex min-w-0 items-center gap-2 rounded-lg border px-2 py-2.5 text-right text-xs font-semibold leading-5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#043873] lg:px-3 lg:text-sm ${tab === item.id ? "border-[#043873] bg-blue-50 text-[#043873]" : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-[#043873]"}`}><Icon className="h-4 w-4 shrink-0" /><span className="hidden break-words lg:inline">{item.label}</span><span className="lg:hidden">{item.count ?? ""}</span></button>; })}
          <Link href="/search" title="جست‌وجوی ملک" className="rounded-lg border border-slate-200 px-2 py-2.5 text-center text-xs font-semibold text-slate-700 hover:bg-blue-50 lg:px-3 lg:text-right">جست‌وجو</Link>
          <Link href="/request" title="درخواست جدید" className="rounded-lg bg-[#043873] px-2 py-2.5 text-center text-xs font-semibold text-white lg:px-3 lg:text-right">درخواست جدید</Link>
        </nav>
      </aside>
      <header hidden={tab === null} className="mr-20 border-b border-slate-200 bg-white lg:mr-64">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-black text-[#043873]">هشتی</Link>
          <div className="flex items-center gap-2">
            <Link href="/search" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
              <Search className="h-4 w-4" /> جست‌وجوی ملک
            </Link>
            <Link href="/request" className="inline-flex items-center gap-2 rounded-lg bg-[#043873] px-3 py-2 text-sm font-semibold text-white hover:bg-[#062a5b]">
              <Plus className="h-4 w-4" /> درخواست جدید
            </Link>
          </div>
        </div>
      </header>

      <section hidden={tab === null} className="mr-20 px-3 py-4 sm:px-5 lg:mr-64 lg:px-6">
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#2563eb]">پنل مشتری</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">{profile ? `سلام ${profile.firstName}` : "حساب مشتری"}</h1>
          <p className="mt-2 text-sm leading-7 text-slate-600">درخواست‌های جست‌وجو، علاقه‌مندی‌ها و اعلان‌ها را از یک محل مدیریت کنید.</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            <LoaderCircle className="h-5 w-5 animate-spin" /> در حال دریافت اطلاعات پنل...
          </div>
        ) : pageError ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-7 text-red-800">
            {pageError} <div className="mt-3"><Link href="/" className="font-bold underline">بازگشت به صفحه اصلی</Link></div>
          </div>
        ) : (
          <>
            <div hidden={tab !== "requests"} className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard label="همه درخواست‌ها" value={String(requests.length)} icon={<FileText className="h-5 w-5" />} />
              <StatCard label="درخواست فعال" value={String(activeCount)} icon={<Search className="h-5 w-5" />} />
              <StatCard label="اعلان خوانده‌نشده" value={String(unreadCount)} icon={<Bell className="h-5 w-5" />} />
            </div>

            <div className="mb-5 hidden flex-wrap gap-2">
              {tabItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} type="button" onClick={() => setTab(item.id)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${tab === item.id ? "border-[#043873] bg-[#043873] text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                    <Icon className="h-4 w-4" /> {item.label}
                    {item.count !== undefined && <span className={`rounded-full px-2 py-0.5 text-xs ${tab === item.id ? "bg-white/15" : "bg-slate-100"}`}>{item.count}</span>}
                  </button>
                );
              })}
              <button type="button" onClick={() => profile && user && void runAction("refresh", async () => { await refreshData(profile, user); setActionMessage("اطلاعات به‌روز شد."); })}
                disabled={busyId !== null}
                className="mr-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                {busyId === "refresh" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ChevronLeft className="h-4 w-4 rotate-180" />} به‌روزرسانی
              </button>
            </div>

            {actionMessage && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{actionMessage}</div>}
            {actionError && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{actionError}</div>}

            {tab === "requests" && (
              <div className="space-y-3">
                {requests.length === 0 ? <EmptyState text="هنوز درخواستی ثبت نکرده‌اید." action={<Link href="/request" className="font-bold text-[#043873] underline">ثبت درخواست جدید</Link>} /> :
                  requests.map((request) => (
                    <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      {editingId === request.id ? (
                        <div className="space-y-4">
                          <h3 className="font-bold">ویرایش درخواست</h3>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="space-y-1 text-sm font-medium">نوع معامله
                              <select className={inputClass} value={editValues.transactionType} onChange={(e) => setEditValues((s) => ({ ...s, transactionType: e.target.value as CustomerRequestTransactionType }))}>
                                {transactionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                            </label>
                            <label className="space-y-1 text-sm font-medium">نوع ملک
                              <select className={inputClass} value={editValues.propertyType} onChange={(e) => setEditValues((s) => ({ ...s, propertyType: e.target.value as CustomerRequestPropertyType }))}>
                                {propertyOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                            </label>
                            <label className="space-y-1 text-sm font-medium">شهر
                              <input className={inputClass} value={editValues.city} onChange={(e) => setEditValues((s) => ({ ...s, city: e.target.value }))} required />
                            </label>
                            <label className="space-y-1 text-sm font-medium">بودجه (تومان)
                              <input className={inputClass} type="number" min="0" value={editValues.budget} onChange={(e) => setEditValues((s) => ({ ...s, budget: e.target.value }))} />
                            </label>
                          </div>
                          <label className="block space-y-1 text-sm font-medium">توضیحات
                            <textarea className={inputClass} rows={3} value={editValues.description} onChange={(e) => setEditValues((s) => ({ ...s, description: e.target.value }))} />
                          </label>
                          <div className="flex gap-2">
                            <button type="button" disabled={busyId === request.id} onClick={() => void saveEdit(request.id)} className="inline-flex items-center gap-2 rounded-lg bg-[#043873] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"><Save className="h-4 w-4" /> ذخیره</button>
                            <button type="button" onClick={() => setEditingId(null)} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold"><X className="h-4 w-4" /> انصراف</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-bold">{transactionLabel(request.transactionType)} {propertyLabel(request.propertyType)}</h3>
                              <p className="mt-1 flex items-center gap-1 text-sm text-slate-600"><MapPin className="h-4 w-4" /> {request.city} · بودجه: {money(request.budget)}</p>
                              {request.description && <p className="mt-3 text-sm leading-7 text-slate-600">{request.description}</p>}
                            </div>
                            <StatusChip status={request.status} />
                          </div>
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                            <span>ثبت‌شده در {prettyDate(request.createdAt)}</span>
                            <span>کد پیگیری: <b dir="ltr" className="font-mono">{request.id}</b></span>
                          </div>
                          {request.status === "ACTIVE" && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button type="button" onClick={() => startEdit(request)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"><Edit3 className="h-4 w-4" /> ویرایش</button>
                              <button type="button" disabled={busyId === request.id} onClick={() => void runAction(request.id, async () => { await closeCustomerSearchRequest(profile!.id, request.id); setActionMessage("درخواست بسته شد."); })} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"><X className="h-4 w-4" /> بستن درخواست</button>
                            </div>
                          )}
                        </>
                      )}
                    </article>
                  ))}
              </div>
            )}

            {tab === "favorites" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {favorites.length === 0 ? <div className="sm:col-span-2"><EmptyState text="هنوز ملکی به علاقه‌مندی‌ها اضافه نکرده‌اید." action={<Link href="/search" className="font-bold text-[#043873] underline">جست‌وجوی ملک</Link>} /></div> :
                  favorites.map((favorite) => (
                    <article key={favorite.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      {favorite.property?.media?.[0]?.url && <img src={favorite.property.media[0].url} alt="" className="h-40 w-full object-cover" />}
                      <div className="p-4">
                        {favorite.property ? (
                          <>
                            <h3 className="font-bold">{propertyLabel(favorite.property.propertyType)} در {favorite.property.city}</h3>
                            <p className="mt-1 text-sm text-slate-600">{favorite.property.district} · {favorite.property.area ?? "—"} متر · {favorite.property.rooms ?? "—"} اتاق</p>
                            <p className="mt-2 text-sm font-semibold text-[#043873]">{money(favorite.property.listing.salePrice ?? favorite.property.listing.depositAmount ?? favorite.property.listing.rentAmount)}</p>
                            <Link href={`/property/${encodeURIComponent(favorite.propertyId)}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#043873] underline">مشاهده ملک <ChevronLeft className="h-4 w-4" /></Link>
                          </>
                        ) : (
                          <p className="text-sm leading-6 text-slate-600">این آگهی دیگر در فهرست عمومی فعال نیست؛ امکان حذف از علاقه‌مندی‌ها محفوظ است.</p>
                        )}
                        <button type="button" disabled={busyId === favorite.propertyId} onClick={() => void runAction(favorite.propertyId, async () => { await removeCustomerFavorite(profile!.id, favorite.propertyId); setActionMessage("ملک از علاقه‌مندی‌ها حذف شد."); })} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"><Heart className="h-4 w-4" /> حذف از علاقه‌مندی‌ها</button>
                      </div>
                    </article>
                  ))}
              </div>
            )}

            {tab === "notifications" && (
              <div className="space-y-3">
                {notifications.length === 0 ? <EmptyState text="در حال حاضر اعلانی برای نمایش وجود ندارد." /> :
                  notifications.map((notification) => (
                    <article key={notification.id} className={`rounded-2xl border bg-white p-4 ${notification.isRead ? "border-slate-200" : "border-blue-200"}`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold">{notification.title}</h3>
                          <p className="mt-1 text-sm leading-7 text-slate-600">{notification.message}</p>
                          <p className="mt-2 text-xs text-slate-400">{prettyDate(notification.createdAt)}</p>
                        </div>
                        {!notification.isRead && <button type="button" disabled={busyId === notification.id} onClick={() => void runAction(notification.id, async () => { await markUserNotificationAsRead(notification.id); setActionMessage("اعلان خوانده‌شده علامت خورد."); })} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"><Check className="h-4 w-4" /> خوانده شد</button>}
                      </div>
                    </article>
                  ))}
              </div>
            )}

            {tab === "profile" && profile && (
              <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-bold">اطلاعات حساب</h2>
                <p className="mt-2 text-sm text-slate-600">شماره موبایل حساب: <span dir="ltr" className="font-semibold">{profile.user.mobile}</span></p>
                <form className="mt-5 space-y-4" onSubmit={(event) => { event.preventDefault(); void runAction("profile", async () => { const updated = await updateCustomerProfile(profile.id, { firstName: firstName.trim(), lastName: lastName.trim() }); setProfile((current) => current ? { ...current, firstName: updated.firstName, lastName: updated.lastName } : current); setActionMessage("اطلاعات پروفایل ذخیره شد."); }); }}>
                  <label className="block space-y-1 text-sm font-medium">نام
                    <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </label>
                  <label className="block space-y-1 text-sm font-medium">نام خانوادگی
                    <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </label>
                  <button type="submit" disabled={busyId === "profile"} className="inline-flex items-center gap-2 rounded-xl bg-[#043873] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><Save className="h-4 w-4" /> ذخیره تغییرات</button>
                </form>
                <p className="mt-6 rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-500">تغییر رمز عبور به API مستقلی نیاز دارد که در نسخهٔ فعلی بک‌اند وجود ندارد؛ از افزودن فرم غیرعملی خودداری کرده‌ایم.</p>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#043873]">{icon}</div><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-black tabular-nums">{value}</p></div></div>;
}
function EmptyState({ text, action }: { text: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="text-sm leading-7 text-slate-600">{text}</p>{action && <div className="mt-3">{action}</div>}</div>;
}
function StatusChip({ status }: { status: string }) {
  const label = status === "ACTIVE" ? "فعال" : status === "CLOSED" ? "بسته‌شده" : status;
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{label}</span>;
}
