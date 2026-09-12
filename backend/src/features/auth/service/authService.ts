// ============================================================
// Auth Service
// ============================================================
// این فایل فقط مسئول عملیات فنی Authentication است:
//
// - Hash کردن Password
// - بررسی Password
// - ساخت JWT
// - اعتبارسنجی JWT
//
// این Service مستقیماً با Prisma یا Agent کار نمی‌کند.
// ============================================================

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  AuthError,
  TokenPayload,
} from "../types/auth";

/**
 * تعداد Roundهای Bcrypt
 */
const BCRYPT_COST = 10;

/**
 * طول عمر Token
 */
const JWT_TTL = "7d";

/**
 * دریافت Secret مربوط به JWT
 *
 * Secret نباید داخل کد ثابت باشد.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AuthError(
      "پیکربندی امنیتی ناقص است: JWT_SECRET تعریف نشده است.",
      500
    );
  }

  return secret;
}

/**
 * Hash کردن Password
 */
export async function hashPassword(
  plainTextPassword: string
): Promise<string> {
  return bcrypt.hash(
    plainTextPassword,
    BCRYPT_COST
  );
}

/**
 * مقایسه Password خام با Hash ذخیره‌شده
 */
export async function verifyPassword(
  plainTextPassword: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(
    plainTextPassword,
    passwordHash
  );
}

/**
 * ساخت JWT
 *
 * sub = شناسه User
 *
 * نه شناسه Agent.
 */
export function signAuthToken(
  userId: string,
  role?: string
): string {

  const payload: TokenPayload = {
    sub: userId,
    role,
  };

  return jwt.sign(
    payload,
    getJwtSecret(),
    {
      expiresIn: JWT_TTL,
    }
  );
}

/**
 * اعتبارسنجی JWT
 */
export function verifyAuthToken(
  token: string
): TokenPayload {

  try {

    const payload = jwt.verify(
      token,
      getJwtSecret()
    ) as TokenPayload;

    if (!payload.sub) {
      throw new AuthError(
        "توکن احراز هویت نامعتبر است.",
        401
      );
    }

    return payload;

  } catch (error: any) {

    if (error instanceof AuthError) {
      throw error;
    }

    if (error?.name === "TokenExpiredError") {
      throw new AuthError(
        "نشست شما منقضی شده است. لطفاً دوباره وارد شوید.",
        401
      );
    }

    throw new AuthError(
      "توکن احراز هویت نامعتبر است.",
      401
    );
  }
}