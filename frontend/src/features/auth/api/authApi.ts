// src/features/auth/api/authApi.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * قرارداد عمومی کاربر مطابق پاسخ‌های فعلی بک‌اند.
 * پاسخ /auth/me فقط id، mobile و role را برمی‌گرداند؛
 * پاسخ ورود علاوه بر آن isActive را نیز دارد.
 */
export type UserRole = "CUSTOMER" | "OWNER" | "AGENT" | "HASHTI";

export interface UserPublic {
  id: string;
  mobile: string;
  role: UserRole;
  isActive?: boolean;
}

/** نام قدیمی برای جلوگیری از شکستن importهای موجود. */
export type AgentPublic = UserPublic;

export interface AuthResponse {
  message: string;
  user: UserPublic;
}

interface CurrentUserResponse {
  user: UserPublic;
}

interface ApiErrorResponse {
  message?: string;
}

async function readJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

async function getErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const data = await readJson<ApiErrorResponse>(response);
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

// ورود با نشست و کوکی HttpOnly؛ مسیر دقیق مطابق authRoutes بک‌اند است.
export async function loginUser(
  mobile: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ mobile, password }),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "ورود ناموفق بود. لطفاً اطلاعات را بررسی کنید."
      )
    );
  }

  return readJson<AuthResponse>(response);
}

// بررسی نشست فعلی؛ API بک‌اند پاسخ را داخل فیلد user قرار می‌دهد.
export async function getCurrentUser(): Promise<UserPublic> {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "ابتدا وارد حساب کاربری خود شوید.")
    );
  }

  const data = await readJson<CurrentUserResponse>(response);
  return data.user;
}

// خروج از نشست فعلی.
export async function logoutUser(): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "خطا در خروج از حساب کاربری.")
    );
  }

  return readJson<{ message: string }>(response);
}

/**
 * نام‌های قدیمی حفظ شده‌اند تا مصرف‌کننده‌های فعلی بدون تغییر نام
 * توابع همچنان کار کنند؛ نوع خروجی اکنون UserPublic است، نه پروفایل فرضی مشاور.
 */
export const loginAgent = loginUser;
export const getCurrentAgent = getCurrentUser;
export const logoutAgent = logoutUser;
