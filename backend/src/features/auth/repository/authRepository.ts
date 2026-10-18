import { UserRole } from "@prisma/client";
import { prisma } from "../../../lib/prisma";

/** یافتن کاربر با شماره موبایل */
export async function findUserByMobile(mobile: string) {
  return prisma.user.findUnique({ where: { mobile } });
}

/**
 * ایجاد حساب و پروفایل نقش‌محور در یک تراکنش.
 * در صورت شکست ایجاد پروفایل، حساب ناقص باقی نمی‌ماند.
 */
export async function createUser(data: {
  mobile: string;
  passwordHash: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
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

    let profileId: string;
    if (data.role === UserRole.CUSTOMER) {
      const profile = await tx.customer.create({
        data: { userId: user.id, firstName: data.firstName, lastName: data.lastName },
        select: { id: true },
      });
      profileId = profile.id;
    } else if (data.role === UserRole.OWNER) {
      const profile = await tx.owner.create({
        data: { userId: user.id, firstName: data.firstName, lastName: data.lastName },
        select: { id: true },
      });
      profileId = profile.id;
    } else if (data.role === UserRole.AGENT) {
      const profile = await tx.agent.create({
        data: { userId: user.id, firstName: data.firstName, lastName: data.lastName },
        select: { id: true },
      });
      profileId = profile.id;
    } else {
      throw new Error("ROLE_NOT_ALLOWED");
    }

    return { ...user, profileId };
  });
}

/** ایجاد Session در دیتابیس */
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

/** یافتن Session همراه با اطلاعات کاربر */
export async function findSessionByTokenHash(tokenHash: string) {
  return prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
}

/**
 * تمدید مهلت Session هنگام فعالیت معتبر.
 * نشست منقضی‌شده تمدید نمی‌شود.
 */
export async function extendSessionExpiry(
  tokenHash: string,
  activeAt: Date,
  expiresAt: Date
): Promise<boolean> {
  const result = await prisma.session.updateMany({
    where: {
      tokenHash,
      expiresAt: { gt: activeAt },
    },
    data: { expiresAt },
  });

  return result.count > 0;
}

/** حذف Session بر اساس هش توکن */
export async function deleteSessionByTokenHash(tokenHash: string) {
  return prisma.session.deleteMany({ where: { tokenHash } });
}

/** بازنشانی رمز عبور و حذف تمام Sessionهای کاربر در یک تراکنش */
export async function resetUserPasswordAndSessions(
  userId: string,
  passwordHash: string
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, mobile: true, role: true },
    });

    if (!user) throw new Error("USER_NOT_FOUND");

    await tx.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await tx.session.deleteMany({ where: { userId } });
    return user;
  });
}
