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

/** حذف Session بر اساس هش توکن */
export async function deleteSessionByTokenHash(tokenHash: string) {
  return prisma.session.deleteMany({ where: { tokenHash } });
}

/** بازنشانی رمز عبور و حذف تمام Sessionهای کاربر در یک تراکنش */
export async function resetUserPasswordAndSessions(
  userId: string,
  passwordHash: string,
  actorUserId: string,
  reason: string
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
    await tx.adminAuditLog.create({ data: {
      actorUserId, targetUserId: userId, targetType: "USER", targetId: userId,
      operation: "ADMIN_RESET_PASSWORD", reason,
      before: { passwordReset: false }, after: { passwordReset: true, sessionsRevoked: true },
    } });
    return user;
  });
}


/**
 * فهرست مدیریتی کاربران با جست‌وجو، فیلتر و صفحه‌بندی.
 * فقط اطلاعات نمایشی پروفایل برگردانده می‌شود؛ رمز و نشست‌ها هرگز انتخاب نمی‌شوند.
 */
export async function listAdminUsers(data: {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  skip: number;
  take: number;
}) {
  const where: import("@prisma/client").Prisma.UserWhereInput = {};

  if (data.role) {
    where.role = data.role;
  }

  if (typeof data.isActive === "boolean") {
    where.isActive = data.isActive;
  }

  const search = data.search?.trim();
  if (search) {
    where.OR = [
      { mobile: { contains: search } },
      { customer: { is: { firstName: { contains: search, mode: "insensitive" } } } },
      { customer: { is: { lastName: { contains: search, mode: "insensitive" } } } },
      { owner: { is: { firstName: { contains: search, mode: "insensitive" } } } },
      { owner: { is: { lastName: { contains: search, mode: "insensitive" } } } },
      { agent: { is: { firstName: { contains: search, mode: "insensitive" } } } },
      { agent: { is: { lastName: { contains: search, mode: "insensitive" } } } },
      { agent: { is: { agencyName: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: data.skip,
      take: data.take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        mobile: true,
        role: true,
        isActive: true,
        isSuperAdmin: true,
        adminPermissions: true,
        createdAt: true,
        updatedAt: true,
        customer: { select: { id: true, firstName: true, lastName: true } },
        owner: { select: { id: true, firstName: true, lastName: true } },
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            agencyName: true,
            isVerified: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total };
}
