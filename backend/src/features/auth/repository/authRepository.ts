
import { UserRole } from "@prisma/client";
import { prisma } from "../../../lib/prisma";

/**
 * یافتن کاربر با شماره موبایل
 */
export async function findUserByMobile(mobile: string) {
  return prisma.user.findUnique({
    where: { mobile },
  });
}

/**
 * ایجاد کاربر جدید
 */
export async function createUser(data: {
  mobile: string;
  passwordHash: string;
  role: UserRole;
}) {
  return prisma.user.create({
    data: {
      mobile: data.mobile,
      passwordHash: data.passwordHash,
      role: data.role,
    },
    select: {
      id: true,
      mobile: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

/**
 * ایجاد Session در دیتابیس
 */
export async function createSession(data: {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}) {
  return prisma.session.create({
    data: {
      tokenHash: data.tokenHash,
      userId: data.userId,
      expiresAt: data.expiresAt,
    },
  });
}

/**
 * یافتن Session همراه با اطلاعات کاربر
 */
export async function findSessionByTokenHash(
  tokenHash: string
) {
  return prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: true,
    },
  });
}

/**
 * حذف Session بر اساس هش توکن
 *
 * اگر Session وجود نداشته باشد، خطا ایجاد نمی‌کند.
 */
export async function deleteSessionByTokenHash(
  tokenHash: string
) {
  return prisma.session.deleteMany({
    where: { tokenHash },
  });
}

/**
 * بازنشانی رمز عبور و حذف تمام Sessionهای کاربر
 *
 * هر دو عملیات در یک تراکنش انجام می‌شوند.
 * رمز خام هرگز در دیتابیس ذخیره نمی‌شود.
 */
export async function resetUserPasswordAndSessions(
  userId: string,
  passwordHash: string
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mobile: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    await tx.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await tx.session.deleteMany({
      where: { userId },
    });

    return user;
  });
}
