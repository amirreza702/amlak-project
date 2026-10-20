"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AgentDashboard } from "@/features/agent/components/AgentDashboard";
import { OwnerDashboard } from "@/features/owner/components/OwnerDashboard";
import { HashtiDashboard } from "@/features/hashti/components/HashtiDashboard";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Home,
  LoaderCircle,
  LogIn,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import {
  AUTH_STATE_CHANGE_EVENT,
  getCurrentUser,
  loginUser,
  registerUser,
  type UserPublic,
  type UserRole,
} from "@/features/auth/api/authApi";

type AccountPortalRole = "OWNER" | "AGENT" | "HASHTI";
type AuthMode = "login" | "register";

const roleCopy: Record<AccountPortalRole, {
  title: string;
  heading: string;
  description: string;
  successTitle: string;
  successDescription: string;
}> = {
  OWNER: {
    title: "مالک",
    heading: "ورود یا ایجاد حساب مالک",
    description: "برای ثبت و مدیریت ملک، وارد حساب مالک شوید یا حساب جدید ایجاد کنید.",
    successTitle: "حساب مالک آماده است",
    successDescription: "ورود به حساب مالک با موفقیت انجام شد. برای ادامه، از گزینه‌های هشتی استفاده کنید.",
  },
  AGENT: {
    title: "مشاور املاک",
    heading: "ورود یا ایجاد حساب مشاور",
    description: "برای استفاده از امکانات مشاور املاک، وارد حساب خود شوید یا حساب جدید ایجاد کنید.",
    successTitle: "ورود به حساب مشاور انجام شد",
    successDescription: "هستی حساب و وضعیت تأیید آن در ادامه بررسی می‌شود؛ امکانات مشاور فقط پس از تأیید در رابط نمایش داده خواهند شد.",
  },
  HASHTI: {
    title: "کارکنان هشتی",
    heading: "ورود به پنل هشتی",
    description: "این بخش فقط برای حساب‌های کارکنان هشتی در دسترس است.",
    successTitle: "به پنل هشتی خوش آمدید",
    successDescription: "نشست شما با نقش کارکنان هشتی تأیید شد. ابزارهای مدیریتی بعدی از همین مسیر محافظت‌شده اضافه می‌شوند.",
  },
};

interface RoleAccountPageProps {
  role: AccountPortalRole;
}

function translateError(message: string): string {
  if (message.includes("already registered")) {
    return "این شماره موبایل قبلاً ثبت شده است؛ حالت ورود را انتخاب کنید.";
  }
  if (message.includes("Invalid Iranian mobile number")) {
    return "شماره موبایل باید با 09 شروع شود و ۱۱ رقم داشته باشد.";
  }
  if (message.includes("at least 8 characters")) {
    return "رمز عبور باید حداقل ۸ کاراکتر داشته باشد.";
  }
  if (message.includes("incorrect")) {
    return "شماره موبایل یا رمز عبور صحیح نیست.";
  }
  if (message.includes("selected role") || message.includes("ROLE_MISMATCH")) {
    return "این حساب با نوع حساب انتخاب‌شده مطابقت ندارد. اطلاعات ورود را بررسی کنید.";
  }
  if (message.includes("inactive")) {
    return "این حساب کاربری غیرفعال است.";
  }
  return "عملیات انجام نشد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.";
}

export function RoleAccountPage({ role }: RoleAccountPageProps) {
  const copy = roleCopy[role];
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentUser, setCurrentUser] = useState<UserPublic | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const syncSession = useCallback(async () => {
    try {
      setCurrentUser(await getCurrentUser());
    } catch {
      setCurrentUser(null);
    } finally {
      setIsCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const refreshSession = async () => {
      try {
        const user = await getCurrentUser();
        if (active) setCurrentUser(user);
      } catch {
        if (active) setCurrentUser(null);
      } finally {
        if (active) setIsCheckingSession(false);
      }
    };

    const handleSessionChange = () => {
      void syncSession();
    };

    void refreshSession();
    window.addEventListener(AUTH_STATE_CHANGE_EVENT, handleSessionChange);
    return () => {
      active = false;
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handleSessionChange);
    };
  }, [syncSession]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    setSuccessMessage(null);

    const normalizedMobile = mobile.trim();
    if (!/^09\d{9}$/.test(normalizedMobile)) {
      setAuthError("شماره موبایل باید با 09 شروع شود و ۱۱ رقم داشته باشد.");
      return;
    }
    if (!password) {
      setAuthError("رمز عبور را وارد کنید.");
      return;
    }

    if (authMode === "register") {
      if (role === "HASHTI") {
        setAuthError("برای کارکنان هشتی ثبت‌نام عمومی فعال نیست.");
        return;
      }
      if (!firstName.trim() || !lastName.trim()) {
        setAuthError("نام و نام خانوادگی را وارد کنید.");
        return;
      }
      if (password.length < 8) {
        setAuthError("رمز عبور باید حداقل ۸ کاراکتر داشته باشد.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (authMode === "register") {
        const registrationRole = role as Exclude<UserRole, "HASHTI">;
        const registration = await registerUser({
          mobile: normalizedMobile,
          password,
          role: registrationRole,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        // شناسهٔ پروفایل فقط برای وصل‌شدن رابط به APIهای موجود نگه داشته می‌شود؛
        // کنترل دسترسی واقعی همچنان باید از نشست سمت سرور انجام شود.
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            `hashti:${role.toLowerCase()}ProfileId:${normalizedMobile}`,
            registration.user.profileId
          );
        }
      }

      const result = await loginUser(normalizedMobile, password, role);
      setCurrentUser(result.user);
      setPassword("");
      setSuccessMessage(
        authMode === "register"
          ? "ثبت‌نام با موفقیت انجام شد و ورود خودکار انجام گرفت."
          : "ورود با موفقیت انجام شد."
      );

      // پس از ورود کارکنان هشتی، کاربر را به همان صفحه مدیریتی برگردان
      // که پیش از ورود درخواست کرده بود؛ فقط مسیرهای داخلی پنل پذیرفته می‌شوند.
      if (role === "HASHTI" && typeof window !== "undefined") {
        const returnTo = new URLSearchParams(window.location.search).get("returnTo");
        if (returnTo?.startsWith("/admin/")) {
          window.location.assign(returnTo);
          return;
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("already registered")) setAuthMode("login");
      setAuthError(translateError(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthError(null);
    setSuccessMessage(null);
  };

  const isAuthenticatedForThisRole = currentUser?.role === role;

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <section className={role === "HASHTI" ? "w-full max-w-none px-0 py-4" : "mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12"}>
        <div className="mb-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#043873]">
            {role === "OWNER" ? (
              <Building2 className="h-6 w-6" />
            ) : role === "AGENT" ? (
              <BriefcaseBusiness className="h-6 w-6" />
            ) : (
              <ShieldCheck className="h-6 w-6" />
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            {role === "HASHTI" ? "پنل هشتی" : copy.heading}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{copy.description}</p>
        </div>

        {isCheckingSession ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            در حال بررسی وضعیت ورود...
          </div>
        ) : isAuthenticatedForThisRole && currentUser ? (
          <div className="space-y-5">
            <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{copy.successTitle}</h2>
                  <p className="mt-1 text-sm leading-7 text-slate-600">{successMessage || copy.successDescription}</p>
                  <p className="mt-1 text-xs text-slate-500">حساب فعال: <span dir="ltr">{currentUser.mobile}</span></p>
                </div>
              </div>
              <Link href="/" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#043873] underline">
                <Home className="h-4 w-4" /> بازگشت به صفحه اصلی
              </Link>
            </section>
            {role === "OWNER" && <OwnerDashboard user={currentUser} />}
            {role === "AGENT" && <AgentDashboard user={currentUser} />}
            {role === "HASHTI" && <HashtiDashboard user={currentUser} />}
          </div>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            {currentUser && currentUser.role !== role && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
                اکنون با حساب دیگری وارد شده‌اید. پس از ورود موفق به حساب {copy.title}، نشست قبلی همین مرورگر باطل می‌شود.
              </div>
            )}

            <h2 className="text-lg font-bold">{copy.heading}</h2>
            {role !== "HASHTI" && (
              <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => changeMode("login")}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${authMode === "login" ? "bg-white text-[#043873] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  ورود
                </button>
                <button
                  type="button"
                  onClick={() => changeMode("register")}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${authMode === "register" ? "bg-white text-[#043873] shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  ایجاد حساب
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {authMode === "register" && role !== "HASHTI" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block space-y-2 text-sm font-medium">
                    نام
                    <input
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-[#043873] focus:ring-2 focus:ring-[#043873]/10"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      autoComplete="given-name"
                      required
                    />
                  </label>
                  <label className="block space-y-2 text-sm font-medium">
                    نام خانوادگی
                    <input
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-[#043873] focus:ring-2 focus:ring-[#043873]/10"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      autoComplete="family-name"
                      required
                    />
                  </label>
                </div>
              )}

              <label className="block space-y-2 text-sm font-medium">
                شماره موبایل
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-[#043873] focus:ring-2 focus:ring-[#043873]/10"
                  type="tel"
                  inputMode="numeric"
                  dir="ltr"
                  placeholder="09123456789"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  autoComplete="tel"
                  required
                />
              </label>

              <label className="block space-y-2 text-sm font-medium">
                رمز عبور
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-[#043873] focus:ring-2 focus:ring-[#043873]/10"
                  type="password"
                  dir="ltr"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={authMode === "register" ? "new-password" : "current-password"}
                  minLength={authMode === "register" ? 8 : undefined}
                  required
                />
              </label>

              {authError && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#043873] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#062a5b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : authMode === "register" ? (
                  <UserPlus className="h-4 w-4" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {isSubmitting
                  ? "لطفاً صبر کنید..."
                  : authMode === "register"
                    ? "ایجاد حساب و ادامه"
                    : "ورود و ادامه"}
              </button>
            </form>
          </section>
        )}
      </section>
    </main>
  );
}
