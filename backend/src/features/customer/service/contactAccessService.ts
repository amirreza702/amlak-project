/**
 * ============================================================
 * Contact Access Service
 * ============================================================
 *
 * منطق Business مربوط به دسترسی Agent
 * به اطلاعات تماس Customer در این Service قرار دارد.
 *
 * جریان:
 *
 * Agent
 *   ↓
 * Search Request
 *   ↓
 * Customer
 *   ↓
 * بررسی دسترسی قبلی
 *   ↓
 * ┌─────────────────────────────┐
 * │ قبلاً دیده شده؟             │
 * │                             │
 * │ بله → همان دسترسی           │
 * │ خیر → ثبت دسترسی جدید       │
 * └─────────────────────────────┘
 *   ↓
 * اطلاعات تماس Customer
 * ============================================================
 */

import { findCustomerById } from "../repository/customerRepository";

import {
  createContactAccessLog,
  findContactAccessLog,
} from "../repository/contactAccessLogRepository";

import { findPropertySearchRequestById } from "../repository/propertySearchRequestRepository";

/**
 * ------------------------------------------------------------
 * دسترسی Agent به اطلاعات تماس Customer
 * ------------------------------------------------------------
 */
export const accessCustomerContact = async (
  agentId: string,
  searchRequestId: string
) => {
  /**
   * 1. پیدا کردن درخواست جستجوی مشتری
   */
  const searchRequest =
    await findPropertySearchRequestById(searchRequestId);

  if (!searchRequest) {
    throw new Error("Search request not found");
  }

  /**
   * 2. پیدا کردن Customer
   */
  const customer = await findCustomerById(
    searchRequest.customerId
  );

  if (!customer) {
    throw new Error("Customer not found");
  }

  /**
   * 3. بررسی دسترسی قبلی Agent
   *
   * اگر Agent قبلاً Contact همین درخواست را دیده باشد،
   * نباید اعتبار دیگری مصرف شود.
   */
  const existingAccess = await findContactAccessLog(
    agentId,
    searchRequestId
  );

  /**
   * 4. اگر قبلاً دسترسی داشته،
   * همان اطلاعات تماس را برمی‌گردانیم.
   */
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
   * 5. اولین دسترسی Agent
   *
   * فعلاً ثبت مصرف اعتبار را انجام نمی‌دهیم.
   * سیستم اعتبار/اشتراک در مرحله بعد اضافه می‌شود.
   */
  const access = await createContactAccessLog(
    agentId,
    customer.id,
    searchRequestId
  );

  /**
   * 6. برگرداندن اطلاعات تماس
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