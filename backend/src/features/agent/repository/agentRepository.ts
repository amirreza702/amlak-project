// ============================================================
// Agent Repository
// ============================================================
// مسئول دسترسی به داده‌های مربوط به:
//
// User
// Agent
//
// ساختار:
//
// User
//   └── Agent
//
// رابطه User و Agent برابر 1 به 1 است.
// ============================================================

import { UserRole } from "@prisma/client";

import { prisma } from "../../../lib/prisma";

/**
 * ============================================================
 * نوع اطلاعات Authentication مشاور
 * ============================================================
 *
 * این Type نتیجه‌ای است که Auth برای Login لازم دارد.
 *
 * mobile / passwordHash / isActive / role
 * از User می‌آیند.
 *
 * firstName / lastName / agencyName / address / isVerified
 * از Agent می‌آیند.
 */
export interface AgentAuthRecord {
  userId: string;

  mobile: string;
  passwordHash: string | null;
  role: UserRole;
  isActive: boolean;

  agentId: string;
  firstName: string;
  lastName: string;
  agencyName: string | null;
  address: string | null;
  isVerified: boolean;
}

/**
 * ============================================================
 * اطلاعات عمومی Agent
 * ============================================================
 *
 * Password هیچ‌وقت از Repository به عنوان اطلاعات عمومی
 * برگردانده نمی‌شود.
 */
export interface AgentPublicRecord {
  id: string;

  userId: string;

  firstName: string;
  lastName: string;

  agencyName: string | null;
  address: string | null;

  isVerified: boolean;

  mobile: string;
  role: UserRole;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * ============================================================
 * پیدا کردن Agent بر اساس Mobile
 * ============================================================
 *
 * mobile روی User قرار دارد، نه Agent.
 */
export async function findAgentByMobile(
  mobile: string
): Promise<AgentAuthRecord | null> {

  const user = await prisma.user.findUnique({
    where: {
      mobile,
    },

    include: {
      agent: true,
    },
  });

  if (!user || !user.agent) {
    return null;
  }

  return {
    userId: user.id,

    mobile: user.mobile,
    passwordHash: user.passwordHash,
    role: user.role,
    isActive: user.isActive,

    agentId: user.agent.id,
    firstName: user.agent.firstName,
    lastName: user.agent.lastName,
    agencyName: user.agent.agencyName,
    address: user.agent.address,
    isVerified: user.agent.isVerified,
  };
}

/**
 * ============================================================
 * پیدا کردن Agent بر اساس User ID
 * ============================================================
 */
export async function findAgentByUserId(
  userId: string
): Promise<AgentAuthRecord | null> {

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    include: {
      agent: true,
    },
  });

  if (!user || !user.agent) {
    return null;
  }

  return {
    userId: user.id,

    mobile: user.mobile,
    passwordHash: user.passwordHash,
    role: user.role,
    isActive: user.isActive,

    agentId: user.agent.id,
    firstName: user.agent.firstName,
    lastName: user.agent.lastName,
    agencyName: user.agent.agencyName,
    address: user.agent.address,
    isVerified: user.agent.isVerified,
  };
}

/**
 * ============================================================
 * پیدا کردن Agent بر اساس Agent ID
 * ============================================================
 *
 * این تابع برای کدهای قدیمی هم تا حد ممکن سازگاری ایجاد می‌کند.
 */
export async function findAgentById(
  agentId: string
): Promise<AgentAuthRecord | null> {

  const agent = await prisma.agent.findUnique({
    where: {
      id: agentId,
    },

    include: {
      user: true,
    },
  });

  if (!agent) {
    return null;
  }

  return {
    userId: agent.user.id,

    mobile: agent.user.mobile,
    passwordHash: agent.user.passwordHash,
    role: agent.user.role,
    isActive: agent.user.isActive,

    agentId: agent.id,
    firstName: agent.firstName,
    lastName: agent.lastName,
    agencyName: agent.agencyName,
    address: agent.address,
    isVerified: agent.isVerified,
  };
}

/**
 * ============================================================
 * ساخت User + Agent
 * ============================================================
 *
 * ثبت‌نام مشاور باید یک تراکنش واحد باشد.
 *
 * اگر ایجاد User موفق شود ولی Agent شکست بخورد،
 * کل عملیات Rollback می‌شود.
 */
export async function createAgent(data: {
  firstName: string;
  lastName: string;

  mobile: string;
  passwordHash: string;

  agencyName?: string | null;
  address?: string | null;
}) {

  return prisma.$transaction(async (tx) => {

    /**
     * ابتدا User ساخته می‌شود.
     */
    const user = await tx.user.create({
      data: {
        mobile: data.mobile,
        passwordHash: data.passwordHash,

        role: UserRole.AGENT,

        isActive: true,
      },
    });

    /**
     * سپس Agent به User متصل می‌شود.
     */
    const agent = await tx.agent.create({
      data: {
        userId: user.id,

        firstName: data.firstName,
        lastName: data.lastName,

        agencyName: data.agencyName ?? null,
        address: data.address ?? null,

        /**
         * مشاور تازه ثبت‌نام‌شده هنوز
         * توسط Hashti تأیید نشده است.
         */
        isVerified: false,
      },

      include: {
        user: true,
      },
    });

    return {
      user,
      agent,
    };
  });
}

/**
 * ============================================================
 * تبدیل AgentAuthRecord به اطلاعات عمومی
 * ============================================================
 */
export function toPublicAgent(
  agent: AgentAuthRecord
): AgentPublicRecord {

  return {
    id: agent.agentId,

    userId: agent.userId,

    firstName: agent.firstName,
    lastName: agent.lastName,

    agencyName: agent.agencyName,
    address: agent.address,

    isVerified: agent.isVerified,

    mobile: agent.mobile,

    role: agent.role,
    isActive: agent.isActive,

    /**
     * این دو مقدار در AuthRecord وجود ندارند.
     * برای Public API فعلاً از زمان فعلی استفاده نمی‌کنیم.
     *
     * اگر بعداً لازم شد، Repository می‌تواند این مقادیر را
     * از Prisma برگرداند.
     */
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
}

/**
 * ============================================================
 * بررسی وجود Mobile
 * ============================================================
 */
export async function isMobileTaken(
  mobile: string
): Promise<boolean> {

  const user = await prisma.user.findUnique({
    where: {
      mobile,
    },

    select: {
      id: true,
    },
  });

  return Boolean(user);
}