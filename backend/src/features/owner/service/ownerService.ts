/**
 * ============================================================
 * Owner Service
 * ============================================================
 *
 * منطق Business مربوط به Profile مالک در این Service قرار دارد.
 *
 * Service مستقیماً با Database ارتباط ندارد.
 * تمام دسترسی به Database از طریق Owner Repository انجام می‌شود.
 *
 * ============================================================
 */

import {
  findOwnerProfileById,
  updateOwnerProfile,
} from "../repository/ownerRepository";

/**
 * ------------------------------------------------------------
 * دریافت Profile مالک
 * ------------------------------------------------------------
 */
export const getOwnerProfile = async (
  ownerId: string
) => {
  const owner =
    await findOwnerProfileById(ownerId);

  if (!owner) {
    throw new Error("Owner not found");
  }

  return owner;
};

/**
 * ------------------------------------------------------------
 * ویرایش Profile مالک
 * ------------------------------------------------------------
 *
 * قوانین:
 *
 * - firstName در صورت ارسال نباید خالی باشد.
 * - lastName در صورت ارسال نباید خالی باشد.
 * - حداقل یکی از فیلدها باید ارسال شده باشد.
 * - mobile در این Service قابل تغییر نیست.
 */
export const updateOwnerProfileService = async (
  ownerId: string,
  data: {
    firstName?: string;
    lastName?: string;
  }
) => {
  const owner =
    await findOwnerProfileById(ownerId);

  if (!owner) {
    throw new Error("Owner not found");
  }

  const firstName = data.firstName?.trim();
  const lastName = data.lastName?.trim();

  if (
    firstName !== undefined &&
    firstName.length === 0
  ) {
    throw new Error("First name cannot be empty");
  }

  if (
    lastName !== undefined &&
    lastName.length === 0
  ) {
    throw new Error("Last name cannot be empty");
  }

  if (
    firstName === undefined &&
    lastName === undefined
  ) {
    throw new Error("No profile fields to update");
  }

  return updateOwnerProfile(ownerId, {
    ...(firstName !== undefined && {
      firstName,
    }),

    ...(lastName !== undefined && {
      lastName,
    }),
  });
};