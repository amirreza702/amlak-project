
/**
 * ============================================================
 * Agent Repository
 * ============================================================
 *
 * این Repository فقط مسئول ارتباط مستقیم با Database است.
 *
 * منطق Business در Service قرار دارد.
 *
 * ============================================================
 */

import { prisma } from "../../../lib/prisma";

/**
 * ------------------------------------------------------------
 * پیدا کردن Agent بر اساس Agent ID
 * ------------------------------------------------------------
 *
 * این تابع برای بررسی وجود Agent استفاده می‌شود.
 *
 * این Use Case فقط به id نیاز دارد.
 */
export const findAgentById = async (
  agentId: string
) => {
  return prisma.agent.findUnique({
    where: {
      id: agentId,
    },

    select: {
      id: true,
    },
  });
};

/**
 * ------------------------------------------------------------
 * دریافت اطلاعات Profile مشاور
 * ------------------------------------------------------------
 *
 * اطلاعات مورد نیاز Profile:
 *
 * Agent:
 * - id
 * - firstName
 * - lastName
 * - agencyName
 * - address
 * - isVerified
 *
 * User:
 * - mobile
 *
 * mobile در جدول User قرار دارد و در این Repository
 * همراه اطلاعات Agent خوانده می‌شود.
 */
export const findAgentProfileById = async (
  id: string
) => {
  return prisma.agent.findUnique({
    where: {
      id,
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      agencyName: true,
      address: true,
      isVerified: true,

      user: {
        select: {
          mobile: true,
        },
      },
    },
  });
};

/**
 * ------------------------------------------------------------
 * ویرایش اطلاعات Profile مشاور
 * ------------------------------------------------------------
 *
 * فقط اطلاعات مربوط به Profile Agent تغییر می‌کند.
 *
 * mobile قابل تغییر نیست؛
 * چون مربوط به User و Authentication / OTP است.
 *
 * isVerified نیز در اینجا قابل تغییر نیست؛
 * چون وضعیت تأیید باید توسط فرآیند Verification سیستم
 * کنترل شود.
 */
export const updateAgentProfile = async (
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    agencyName?: string | null;
    address?: string | null;
  }
) => {
  return prisma.agent.update({
    where: {
      id,
    },

    data,
  });
};
