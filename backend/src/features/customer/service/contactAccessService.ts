/**
 * ============================================================
 * Contact Access Service
 * ============================================================
 *
 * منطق کسب‌وکار دسترسی Agent به اطلاعات تماس Customer
 *
 * جریان:
 *
 * Agent
 *   ↓
 * Search Request
 *   ↓
 * بررسی Customer
 *   ↓
 * بررسی دسترسی قبلی
 *   ↓
 * بررسی Subscription
 *   ↓
 * بررسی مصرف ماهانه
 *   ↓
 * ثبت ContactAccessLog
 *   ↓
 * افزایش ContactAccessUsage
 */

import { findCustomerById } from "../repository/customerRepository";

import {
  createContactAccessLog,
  findContactAccessLog,
} from "../repository/contactAccessLogRepository";

import {
  findPropertySearchRequestById,
} from "../repository/propertySearchRequestRepository";

import {
  findActiveAgentSubscription,
} from "../repository/agentSubscriptionRepository";

import {
  createContactAccessUsage,
  findContactAccessUsage,
  incrementContactAccessUsage,
} from "../repository/contactAccessUsageRepository";

/**
 * شروع ماه جاری
 *
 * periodStart شناسه دوره مصرف ماهانه است.
 *
 * از UTC استفاده می‌کنیم تا زمان سرور Docker
 * باعث ایجاد دو دوره متفاوت نشود.
 */
const getCurrentPeriodStart = () => {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1
    )
  );
};

/**
 * دسترسی Agent به اطلاعات تماس Customer
 */
export const accessCustomerContact = async (
  agentId: string,
  searchRequestId: string
) => {
  /**
   * ----------------------------------------------------------
   * 1. پیدا کردن Search Request
   * ----------------------------------------------------------
   */
  const searchRequest =
    await findPropertySearchRequestById(
      searchRequestId
    );

  if (!searchRequest) {
    throw new Error("Search request not found");
  }

  /**
   * ----------------------------------------------------------
   * 2. پیدا کردن Customer
   * ----------------------------------------------------------
   */
  const customer = await findCustomerById(
    searchRequest.customerId
  );

  if (!customer) {
    throw new Error("Customer not found");
  }

  /**
   * ----------------------------------------------------------
   * 3. بررسی دسترسی قبلی
   * ----------------------------------------------------------
   *
   * اگر Agent قبلاً همین درخواست را باز کرده باشد،
   * نباید دوباره از سهمیه او کم شود.
   */
  const existingAccess =
    await findContactAccessLog(
      agentId,
      searchRequestId
    );

  if (existingAccess) {
    return {
      access: existingAccess,

      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        mobile: customer.user.mobile,
      },
    };
  }

  /**
   * ----------------------------------------------------------
   * 4. پیدا کردن Subscription فعال
   * ----------------------------------------------------------
   */
  const subscription =
    await findActiveAgentSubscription(
      agentId
    );

  if (!subscription) {
    throw new Error(
      "Active subscription not found"
    );
  }

  /**
   * ----------------------------------------------------------
   * 5. تعیین دوره مصرف جاری
   * ----------------------------------------------------------
   */
  const periodStart =
    getCurrentPeriodStart();

  /**
   * ----------------------------------------------------------
   * 6. پیدا کردن مصرف این ماه
   * ----------------------------------------------------------
   */
  let usage =
    await findContactAccessUsage(
      agentId,
      periodStart
    );

  /**
   * اگر برای این ماه رکورد مصرف وجود ندارد،
   * آن را ایجاد می‌کنیم.
   */
  if (!usage) {
    usage =
      await createContactAccessUsage(
        agentId,
        periodStart
      );
  }

  /**
   * ----------------------------------------------------------
   * 7. بررسی سقف مصرف
   * ----------------------------------------------------------
   */
  if (
    usage.usedCount >=
    subscription.subscriptionPlan.monthlyContactLimit
  ) {
    throw new Error(
      "Monthly contact access limit reached"
    );
  }

  /**
   * ----------------------------------------------------------
   * 8. ثبت دسترسی
   * ----------------------------------------------------------
   */
  const access =
    await createContactAccessLog(
      agentId,
      customer.id,
      searchRequestId
    );

  /**
   * ----------------------------------------------------------
   * 9. افزایش مصرف
   * ----------------------------------------------------------
   */
  await incrementContactAccessUsage(
    agentId,
    periodStart
  );

  /**
   * ----------------------------------------------------------
   * 10. برگرداندن اطلاعات Customer
   * ----------------------------------------------------------
   */
  return {
    access,

    customer: {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      mobile: customer.user.mobile,
    },
  };
};