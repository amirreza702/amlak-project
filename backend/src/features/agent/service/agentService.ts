
/**
 * ============================================================
 * Agent Service
 * ============================================================
 *
 * منطق Business مربوط به Profile مشاور در این Service قرار دارد.
 *
 * جریان:
 *
 * Controller
 *    ↓
 * Agent Service
 *    ↓
 * Agent Repository
 *    ↓
 * Database
 *
 * ============================================================
 */

import {
  findAgentProfileById,
  updateAgentProfile as updateAgentProfileRepository,
} from "../repository/agentRepository";

/**
 * ------------------------------------------------------------
 * دریافت Profile مشاور
 * ------------------------------------------------------------
 */
export const getAgentProfile = async (
  agentId: string
) => {
  /**
   * دریافت اطلاعات Agent از Repository.
   */
  const agent = await findAgentProfileById(agentId);

  /**
   * اگر Agent وجود نداشته باشد،
   * خطای Business ایجاد می‌کنیم.
   */
  if (!agent) {
    throw new Error("مشاور مورد نظر پیدا نشد.");
  }

  return agent;
};

/**
 * ------------------------------------------------------------
 * ویرایش Profile مشاور
 * ------------------------------------------------------------
 */
export const updateAgentProfile = async (
  agentId: string,
  data: {
    firstName?: string;
    lastName?: string;
    agencyName?: string | null;
    address?: string | null;
  }
) => {
  /**
   * ============================================================
   * 1. بررسی وجود Agent
   * ============================================================
   */
  const agent = await findAgentProfileById(agentId);

  if (!agent) {
    throw new Error("مشاور مورد نظر پیدا نشد.");
  }

  /**
   * ============================================================
   * 2. آماده‌سازی اطلاعات
   * ============================================================
   *
   * نام و نام خانوادگی trim می‌شوند.
   */
  const firstName =
    data.firstName !== undefined
      ? data.firstName.trim()
      : undefined;

  const lastName =
    data.lastName !== undefined
      ? data.lastName.trim()
      : undefined;

  const agencyName =
    data.agencyName !== undefined
      ? data.agencyName?.trim() || null
      : undefined;

  const address =
    data.address !== undefined
      ? data.address?.trim() || null
      : undefined;

  /**
   * ============================================================
   * 3. اعتبارسنجی
   * ============================================================
   */

  if (
    firstName !== undefined &&
    firstName.length === 0
  ) {
    throw new Error("نام مشاور نمی‌تواند خالی باشد.");
  }

  if (
    lastName !== undefined &&
    lastName.length === 0
  ) {
    throw new Error(
      "نام خانوادگی مشاور نمی‌تواند خالی باشد."
    );
  }

  /**
   * حداقل یک فیلد Profile باید برای Update ارسال شود.
   */
  if (
    firstName === undefined &&
    lastName === undefined &&
    data.agencyName === undefined &&
    data.address === undefined
  ) {
    throw new Error(
      "حداقل یک فیلد برای ویرایش ارسال کنید."
    );
  }

  /**
   * ============================================================
   * 4. Update
   * ============================================================
   *
   * عملیات Database از طریق Repository انجام می‌شود.
   */
  return updateAgentProfileRepository(agentId, {
    firstName,
    lastName,
    agencyName,
    address,
  });
};
