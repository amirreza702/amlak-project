/**
 * ============================================================
 * Agent Service
 * ============================================================
 *
 * منطق مربوط به Agent در این Service قرار دارد.
 *
 * Repository اطلاعات Agent و User را در قالب
 * AgentAuthRecord برمی‌گرداند.
 *
 * Service این اطلاعات داخلی را به AgentPublic
 * تبدیل می‌کند.
 * ============================================================
 */

import {
  findAgentById,
} from "../repository/agentRepository";

import type {
  AgentPublic,
} from "../types/agent";

/**
 * ============================================================
 * تبدیل AgentAuthRecord به AgentPublic
 * ============================================================
 *
 * اطلاعات حساس مانند passwordHash وارد خروجی نمی‌شود.
 *
 * نکته:
 * findAgentById() دیگر یک Prisma Agent خام نیست.
 * بلکه AgentAuthRecord برمی‌گرداند؛ بنابراین اطلاعات
 * User مستقیماً روی خود agent قرار دارند.
 */
export const sanitizeAgent = (
  agent: any
): AgentPublic => {

  return {

    /**
     * شناسه Agent
     */
    id: agent.agentId,

    /**
     * اطلاعات پروفایل Agent
     */
    firstName: agent.firstName,
    lastName: agent.lastName,

    agencyName: agent.agencyName ?? null,
    address: agent.address ?? null,

    /**
     * اطلاعات User که در AgentAuthRecord
     * مستقیماً در اختیار Service قرار گرفته‌اند.
     */
    mobile: agent.mobile,
    isActive: agent.isActive,

    /**
     * AgentPublic این دو فیلد را اختیاری تعریف کرده است.
     *
     * Repository فعلی تاریخ‌های واقعی را در
     * AgentAuthRecord برنمی‌گرداند، بنابراین
     * فعلاً این فیلدها را ارسال نمی‌کنیم.
     */
  };
};

/**
 * ============================================================
 * دریافت Agent بر اساس Agent ID
 * ============================================================
 */
export const getAgentById = async (
  id: string
): Promise<AgentPublic> => {

  /**
   * Repository Agent را پیدا می‌کند.
   */
  const agent = await findAgentById(id);

  /**
   * اگر Agent وجود نداشته باشد،
   * عملیات متوقف می‌شود.
   */
  if (!agent) {
    throw new Error(
      "مشاور با این مشخصات یافت نشد."
    );
  }

  /**
   * تبدیل رکورد داخلی به خروجی عمومی.
   */
  return sanitizeAgent(agent);
};