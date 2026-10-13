
import bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import { UserRole } from "@prisma/client";

import {
  createSession,
  createUser,
  findUserByMobile,
  findSessionByTokenHash,
  deleteSessionByTokenHash,
  resetUserPasswordAndSessions,
} from "../repository/authRepository";

interface RegisterInput {
  mobile: string;
  password: string;
  role: UserRole;
}

/**
 * تبدیل توکن Session به هش SHA-256
 */
const hashSessionToken = (sessionToken: string) =>
  createHash("sha256").update(sessionToken).digest("hex");

/**
 * ثبت‌نام کاربر جدید
 */
export const registerUserService = async ({
  mobile,
  password,
  role,
}: RegisterInput) => {
  // نقش کارکنان هشتی نباید ثبت‌نام عمومی داشته باشد.
  if (role === UserRole.HASHTI) {
    throw new Error("ROLE_NOT_ALLOWED");
  }

  
  // قواعد کسب‌وکار ثبت‌نام

  // شماره موبایل باید در قالب شماره موبایل ایران باشد.
  const normalizedMobile = mobile.trim();

  if (!/^09\d{9}$/.test(normalizedMobile)) {
    throw new Error("INVALID_MOBILE");
  }

  // رمز عبور باید حداقل ۸ کاراکتر داشته باشد.
  if (password.length < 8) {
    throw new Error("PASSWORD_TOO_SHORT");
  }


  const existingUser = await findUserByMobile(normalizedMobile);

  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return createUser({
    mobile:normalizedMobile,
    passwordHash,
    role,
  });
};

/**
 * ورود کاربر و ایجاد Session سمت سرور
 */
export const loginUserService = async (
  mobile: string,
  password: string
) => {
  const user = await findUserByMobile(mobile);

  if (!user || !user.passwordHash) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordIsValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordIsValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new Error("USER_INACTIVE");
  }

  // توکن تصادفی برای Session
  const sessionToken = randomBytes(32).toString("hex");

  // فقط هش توکن در دیتابیس ذخیره می‌شود.
  const tokenHash = hashSessionToken(sessionToken);

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  await createSession({
    tokenHash,
    userId: user.id,
    expiresAt,
  });

  return {
    sessionToken,
    expiresAt,
    user: {
      id: user.id,
      mobile: user.mobile,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  };
};

/**
 * اعتبارسنجی Session و شناسایی کاربر
 */
export const getAuthenticatedUserService = async (
  sessionToken: string
) => {
  const tokenHash = hashSessionToken(sessionToken);

  const session = await findSessionByTokenHash(tokenHash);

  if (!session) {
    throw new Error("SESSION_INVALID");
  }

  if (session.expiresAt <= new Date()) {
    throw new Error("SESSION_EXPIRED");
  }

  if (!session.user.isActive) {
    throw new Error("USER_INACTIVE");
  }

  return {
    id: session.user.id,
    mobile: session.user.mobile,
    role: session.user.role,
  };
};

/**
 * خروج کاربر و حذف فقط Session فعلی
 */
export const logoutUserService = async (
  sessionToken: string
) => {
  const tokenHash = hashSessionToken(sessionToken);

  await deleteSessionByTokenHash(tokenHash);
};


/**
 * بازنشانی مدیریتی رمز عبور توسط کارکنان هشتی
 *
 * این تابع فقط هش رمز را دریافت می‌کند.
 * کنترل دسترسی HASHTI در لایه Route انجام می‌شود.
 */
export const adminResetUserPasswordService = async (
  userId: string,
  newPassword: string
) => {
  if (!userId.trim()) {
    throw new Error("INVALID_USER_ID");
  }

  if (newPassword.length < 8) {
    throw new Error("PASSWORD_TOO_SHORT");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const user = await resetUserPasswordAndSessions(
    userId,
    passwordHash
  );

  return {
    id: user.id,
    mobile: user.mobile,
    role: user.role,
  };
};

