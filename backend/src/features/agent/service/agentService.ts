 /**
  * ============================================================
  * Agent Service
  * ============================================================
  *
  * این Service منطق مربوط به موجودیت مشاور را مدیریت می‌کند.
  *
  * در معماری جدید:
  *
  * User
  * ├── mobile
  * ├── passwordHash
  * ├── isActive
  * └── اطلاعات احراز هویت
  *
  * Agent
  * ├── firstName
  * ├── lastName
  * ├── agencyName
  * └── address
  *
  * اما AgentPublic فعلاً همان قرارداد قدیمی خروجی است.
  * بنابراین این Service اطلاعات User و Agent را
  * دوباره در قالب AgentPublic قرار می‌دهد.
  * ============================================================
  */

import { findAgentById } from "../repository/agentRepository";

import type { AgentPublic } from "../types/agent";

/**
 * ============================================================
 * تبدیل رکورد جدید Agent + User به خروجی عمومی
 * ============================================================
 *
 * passwordHash هرگز در خروجی قرار نمی‌گیرد.
 *
 * ساختار مورد انتظار AgentPublic:
 *
 * {
 *   id,
 *   firstName,
 *   lastName,
 *   mobile,
 *   agencyName,
 *   address,
 *   isActive,
 *   createdAt,
 *   updatedAt
 * }
 */
export const sanitizeAgent = (agent: any): AgentPublic => {
  return {
    // شناسه خود Agent
    id: agent.id,

    // اطلاعات پروفایل Agent
    firstName: agent.firstName,
    lastName: agent.lastName,
    agencyName: agent.agencyName ?? null,
    address: agent.address ?? null,

    // اطلاعات User
    mobile: agent.user.mobile,
    isActive: agent.user.isActive,

    // زمان‌های مربوط به User
    createdAt: agent.user.createdAt,
    updatedAt: agent.user.updatedAt,
  };
};

/**
 * ============================================================
 * دریافت Agent بر اساس شناسه Agent
 * ============================================================
 */
export const getAgentById = async (
  id: string
): Promise<AgentPublic> => {

  /**
   * Repository رکورد Agent را همراه User برمی‌گرداند.
   */
  const agent = await findAgentById(id);

  /**
   * اگر Agent وجود نداشته باشد،
   * خطای مناسب ایجاد می‌کنیم.
   */
  if (!agent) {
    throw new Error("مشاور با این مشخصات یافت نشد.");
  }

  /**
   * تبدیل رکورد داخلی به خروجی امن.
   */
  return sanitizeAgent(agent);
};