/**
 * ============================================================
 * Evaluation Repository
 * ============================================================
 *
 * این Repository فقط مسئول ارتباط مستقیم
 * با دیتابیس و جدول‌های مرتبط با Evaluation است.
 *
 * منطق Business در Service قرار می‌گیرد.
 *
 * اهداف قابل ارزیابی:
 *
 * - Customer
 * - Owner
 * - Agent
 * - Property
 *
 * ============================================================
 */

import { prisma } from "../../../lib/prisma";

/**
 * ============================================================
 * ایجاد Evaluation
 * ============================================================
 */
export const createEvaluation = async (
  data: Parameters<
    typeof prisma.evaluation.create
  >[0]["data"]
) => {
  return prisma.evaluation.create({
    data,
  });
};

/**
 * ============================================================
 * پیدا کردن Evaluation بر اساس ID
 * ============================================================
 */
export const findEvaluationById = async (
  id: string
) => {
  return prisma.evaluation.findUnique({
    where: {
      id,
    },
  });
};

/**
 * ============================================================
 * Evaluationهای مربوط به Customer
 * ============================================================
 *
 * این متد برای زمانی است که Customer
 * به عنوان ارزیاب یا هدف Evaluation مطرح باشد.
 *
 * توجه:
 * فعلاً فیلتر دقیق بر اساس evaluatorUserId
 * در Service انجام می‌شود.
 *
 * این متد Evaluationهایی را بر اساس
 * customerId دریافت می‌کند.
 */
export const findEvaluationsByCustomerId = async (
  customerId: string
) => {
  return prisma.evaluation.findMany({
    where: {
      customerId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * ============================================================
 * Evaluationهای مربوط به Owner
 * ============================================================
 */
export const findEvaluationsByOwnerId = async (
  ownerId: string
) => {
  return prisma.evaluation.findMany({
    where: {
      ownerId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * ============================================================
 * Evaluationهای مربوط به Agent
 * ============================================================
 */
export const findEvaluationsByAgentId = async (
  agentId: string
) => {
  return prisma.evaluation.findMany({
    where: {
      agentId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * ============================================================
 * Evaluationهای مربوط به Property
 * ============================================================
 */
export const findEvaluationsByPropertyId = async (
  propertyId: string
) => {
  return prisma.evaluation.findMany({
    where: {
      propertyId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * ============================================================
 * تغییر وضعیت Evaluation
 * ============================================================
 */
export const updateEvaluationStatus = async (
  id: string,
  status: Parameters<
    typeof prisma.evaluation.update
  >[0]["data"]["status"]
) => {
  return prisma.evaluation.update({
    where: {
      id,
    },

    data: {
      status,
    },
  });
};