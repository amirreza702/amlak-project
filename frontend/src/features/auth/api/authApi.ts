// src/features/auth/api/authApi.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface AgentPublic {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  agencyName?: string | null;
  address?: string | null;
  isActive: boolean;
}

export interface AuthResponse {
  message: string;
  agent: AgentPublic;
}

// ۱. ارسال درخواست ورود با شماره موبایل و رمز عبور
export async function loginAgent(mobile: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ضروری برای ارسال و دریافت کوکی httponly
    body: JSON.stringify({ mobile, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "ورود ناموفق بود. لطفاً اطلاعات را بررسی کنید.");
  }
  return data;
}

// ۲. بررسی نشست جاری کاربر و دریافت مشخصات
export async function getCurrentAgent(): Promise<AgentPublic> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("ابتدا وارد حساب کاربری خود شوید.");
  }
  return res.json();
}

// ۳. خروج از حساب و پاک کردن کوکی
export async function logoutAgent(): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("خطا در خروج از حساب کاربری.");
  }
  return res.json();
}
