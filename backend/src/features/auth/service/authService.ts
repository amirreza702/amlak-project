// src/features/auth/service/authService.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthError, TokenPayload } from "../types/auth";

// فاکتور پیچیدگی هش و مدت زمان اعتبار توکن
const BCRYPT_COST = 10;
const JWT_TTL = "7d";

// دریافت کلید سکرت به شکل ایمن و جلوگیری از استفاده از کلید ناامن
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AuthError("پیکربندی امنیتی ناقص است: JWT_SECRET تعریف نشده است.", 500);
  }
  return secret;
}

// تولید هش امن برای رمز عبور
export async function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, BCRYPT_COST);
}

// بررسی تطابق رمز عبور ورودی با مقدار هش‌شده
export async function verifyPassword(plainTextPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, passwordHash);
}

// امضای توکن JWT با ساختار استاندارد sub
export function signAuthToken(userId: string): string {
  const payload: TokenPayload = { sub: userId };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_TTL });
}

// بررسی و اعتبارسنجی توکن JWT دریافتی
export function verifyAuthToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new AuthError("نشست شما منقضی شده است. لطفاً مجدداً وارد شوید.", 401);
    }
    throw new AuthError("توکن امنیتی نامعتبر است.", 401);
  }
}
