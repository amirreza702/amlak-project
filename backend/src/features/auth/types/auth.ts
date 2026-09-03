// src/features/auth/types/auth.ts

// کلاس اختصاصی برای مدیریت خطاهای احراز هویت با قابلیت تنظیم کد وضعیت HTTP
export class AuthError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

// ساختار داده توکن JWT - از فیلد استاندارد sub برای نگهداری شناسه کاربر استفاده می‌کنیم
export interface TokenPayload {
  sub: string;       // شناسه کاربر یا مشاور املاک (agentId)
  role?: string;     // نقش کاربر جهت توسعه‌های آینده (اختیاری)
  iat?: number;      // زمان صدور توکن
  exp?: number;      // زمان انقضای توکن
}

// ساختار ورودی فرم ورود مشاور
export interface LoginPayload {
  mobile: string;
  password: string;
}

// ساختار ورودی فرم ثبت‌نام مشاور
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  mobile: string;
  password: string;
  agencyName?: string;
  address?: string;
}
