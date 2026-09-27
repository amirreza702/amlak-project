/**
 * ============================================================
 * Property Search Request Service
 * ============================================================
 *
 * منطق Business مربوط به درخواست جستجوی مشتری
 * در این Service قرار دارد.
 *
 * جریان:
 *
 * Customer
 *    ↓
 * Search Request Service
 *    ↓
 * Repository
 *    ↓
 * Database
 *
 * ============================================================
 */

import {
  findCustomerById,
} from "../repository/customerRepository";

import {
  createPropertySearchRequest,
  findPropertySearchRequestById,
  findPropertySearchRequestsByCustomerId,
} from "../repository/propertySearchRequestRepository";

/**
 * ایجاد درخواست جستجوی ملک
 */
export const createCustomerSearchRequest = async (
  customerId: string,
  data: {
    transactionType:
      | "SALE"
      | "FULL_DEPOSIT"
      | "RENT";

    propertyType:
      | "APARTMENT"
      | "HOUSE"
      | "VILLA"
      | "LAND"
      | "SHOP"
      | "OFFICE"
      | "GARDEN";

    city: string;

    budget?: number;

    description?: string;
  }
) => {
  /**
   * ابتدا بررسی می‌کنیم مشتری وجود دارد.
   */
  const customer =
    await findCustomerById(customerId);

  if (!customer) {
    throw new Error("Customer not found");
  }

  /**
   * شهر باید مقدار داشته باشد.
   */
  if (!data.city.trim()) {
    throw new Error("City is required");
  }

  /**
   * بودجه اگر ارسال شده باشد،
   * نباید منفی باشد.
   */
  if (
    data.budget !== undefined &&
    data.budget < 0
  ) {
    throw new Error(
      "Budget cannot be negative"
    );
  }

  /**
   * ایجاد درخواست
   */
  return createPropertySearchRequest({
    customerId,

    transactionType: data.transactionType,

    propertyType: data.propertyType,

    city: data.city.trim(),

    budget: data.budget,

    description:
      data.description?.trim() || null,
  });
};

/**
 * دریافت یک درخواست جستجو
 */
export const getCustomerSearchRequest =
  async (
    customerId: string,
    requestId: string
  ) => {
    const customer =
      await findCustomerById(customerId);

    if (!customer) {
      throw new Error(
        "Customer not found"
      );
    }

    const request =
      await findPropertySearchRequestById(
        requestId
      );

    if (!request) {
      throw new Error(
        "Search request not found"
      );
    }

    /**
     * جلوگیری از دسترسی مشتری به
     * درخواست مشتری دیگر
     */
    if (
      request.customerId !== customerId
    ) {
      throw new Error(
        "Search request does not belong to customer"
      );
    }

    return request;
  };

/**
 * دریافت تمام درخواست‌های یک مشتری
 */
export const getCustomerSearchRequests =
  async (
    customerId: string
  ) => {
    const customer =
      await findCustomerById(customerId);

    if (!customer) {
      throw new Error(
        "Customer not found"
      );
    }

    return findPropertySearchRequestsByCustomerId(
      customerId
    );
  };