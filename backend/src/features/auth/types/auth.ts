// ============================================================
// Auth Types
// ============================================================
// این فایل فقط Typeهای مربوط به احراز هویت را نگهداری می‌کند.
// اطلاعات مشاور، مشتری و مالک در Feature مربوط به خودشان قرار دارد.
// ============================================================

/**
 * خطای استاندارد احراز هویت
 */
export class AuthError extends Error {
  public statusCode: number;

  constructor(
    message: string,
    statusCode: number = 401
  ) {
    super(message);

    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

/**
 * اطلاعات داخل JWT
 *
 * sub همیشه شناسه User است، نه Agent.
 *
 * این نکته مهم است چون در معماری جدید:
 *
 * User
 *   └── Agent
 *
 * رابطه 1 به 1 دارند.
 */
export interface TokenPayload {
  sub: string;
  role?: string;

  iat?: number;
  exp?: number;
}

/**
 * اطلاعات لازم برای Login
 */
export interface LoginPayload {
  mobile: string;
  password: string;
}

/**
 * اطلاعات لازم برای ثبت‌نام مشاور
 *
 * mobile و password متعلق به User هستند.
 * اطلاعات نام و آژانس متعلق به Agent هستند.
 */
export interface RegisterPayload {
  firstName: string;
  lastName: string;

  mobile: string;
  password: string;

  agencyName?: string;
  address?: string;
}