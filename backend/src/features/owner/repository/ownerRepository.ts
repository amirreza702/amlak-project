/**
 * ============================================================
 * Owner Repository
 * ============================================================
 *
 * این Repository فقط مسئول ارتباط مستقیم با Database است.
 *
 * منطق Business در Service قرار دارد.
 *
 * جریان:
 *
 * Controller
 *    ↓
 * Owner Service
 *    ↓
 * Owner Repository
 *    ↓
 * Database
 *
 * ============================================================
 */

import { prisma } from "../../../lib/prisma";

/**
 * ------------------------------------------------------------
 * دریافت اطلاعات Profile مالک
 * ------------------------------------------------------------
 *
 * اطلاعات مورد نیاز Profile:
 *
 * Owner:
 * - id
 * - firstName
 * - lastName
 *
 * User:
 * - mobile
 *
 * mobile در جدول User قرار دارد و در این Repository
 * همراه اطلاعات Owner خوانده می‌شود.
 */
export const findOwnerProfileById = async (
  id: string
) => {
  return prisma.owner.findUnique({
    where: {
      id,
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,

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
 * ویرایش اطلاعات Profile مالک
 * ------------------------------------------------------------
 *
 * فقط اطلاعات مربوط به خود Owner تغییر می‌کند.
 *
 * mobile در این مرحله قابل تغییر نیست؛
 * چون مربوط به Authentication / OTP است.
 */
export const updateOwnerProfile = async (
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
  }
) => {
  return prisma.owner.update({
    where: {
      id,
    },

    data,
  });
};