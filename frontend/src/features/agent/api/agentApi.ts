// آدرس پایه بک‌اند از متغیر محیطی Next.js (در .env.local: http://localhost:4000)
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// تایپ شکل پاسخ login/register بک‌اند: { message, agent }
// agent شامل شناسه، نام، نام خانوادگی، موبایل، نام آژانس (اختیاری)، و وضعیت فعال بودن است
interface AuthResponse {
  message: string;
  agent: { id: string; firstName: string; lastName: string; mobile: string; agencyName?: string; isActive: boolean };
}

// ورود مشاور با موبایل و رمز عبور
// این تابع درخواست POST به بک‌اند ارسال می‌کند و کوکی hashti_token را از بک‌اند دریافت و ذخیره می‌کند
export async function loginAgent(mobile: string, password: string): Promise<AuthResponse> {
  // ارسال درخواست به endpoint ورود بک‌اند
  const response = await fetch(`${API_URL}/api/agents/login`, {
    method: "POST",
    // credentials: "include" برای ارسال خودکار کوکی‌های httpOnly (مانند hashti_token) ضروری است
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    // ارسال اطلاعات ورود کاربر در بدنه درخواست
    body: JSON.stringify({ mobile, password }),
  });

  // خواندن پاسخ JSON از بک‌اند (چه در صورت موفقیت و چه در صورت خطا)
  const data = await response.json();

  // اگر پاسخ موفقیت‌آمیز نبود (status code غیر از 2xx)، خطا پرتاب می‌شود
  if (!response.ok) {
    // پیام خطا را از پاسخ بک‌اند استخراج کرده و پرتاب می‌کنیم
    throw new Error(data.message || "ورود ناموفق بود.");
  }
  // در صورت موفقیت، پیام و اطلاعات مشاور را برمی‌گردانیم
  return data;
}

// دریافت اطلاعات مشاور لاگین‌شده فعلی
// این تابع با خواندن کوکی hashti_token از مرورگر، اطلاعات کاربر را از بک‌اند می‌گیرد
export async function getCurrentAgent(): Promise<AuthResponse["agent"]> {
  // ارسال درخواست GET به endpoint /api/agents/me برای دریافت اطلاعات کاربر
  const response = await fetch(`${API_URL}/api/agents/me`, {
    // ارسال کوکی همراه درخواست برای احراز هویت
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  // اگر کاربر لاگین نباشد (401)، خطا پرتاب می‌شود تا به صفحه ورود هدایت شود
  if (!response.ok) {
    throw new Error("ابتدا وارد حساب شوید.");
  }

  // دریافت و بازگرداندن اطلاعات مشاور (بدون رمز عبور)
  return response.json();
}

// خروج مشاور از سیستم
// این تابع با ارسال درخواست به بک‌اند، کوکی hashti_token را پاک می‌کند
export async function logoutAgent(): Promise<void> {
  // ارسال درخواست POST به endpoint خروج
  await fetch(`${API_URL}/api/agents/logout`, {
    method: "POST",
    // ارسال کوکی لازم است تا بک‌اند بتواند آن را پاک کند
    credentials: "include",
  });
}
