/**
 * ============================================================
 * Property Service
 * ============================================================
 *
 * منطق Business مربوط به Property در این Service قرار دارد.
 *
 * ============================================================
 * جریان ثبت ملک توسط Agent
 * ============================================================
 *
 * Agent
 *   ↓
 * بررسی وجود مشاور
 *   ↓
 * بررسی وجود ملک
 *   ↓
 * ایجاد ملک در صورت جدید بودن
 *   ↓
 * ثبت ارتباط Agent و Property
 *
 * نکته:
 * registrationSource برای این Use Case همیشه AGENT است.
 * ============================================================
 */

import {
  RegistrationSource,
} from "@prisma/client";

import { getAgentById } from "../../agent/service/agentService";

import {
  createProperty,
  findPropertyByPostalCode,
  findPropertyById,
} from "../repository/propertyRepository";

import {
  createPropertyAgent,
  findPropertyAgent,
  reactivatePropertyAgent,
} from "../repository/propertyAgentRepository";

import type {
  Property,
  PropertyWithListing,
} from "../types/property";

import type { PropertyAgent } from "../types/propertyAgent";
import type { RegisterPropertyInput } from "../types/registerProperty";

/**
 * ============================================================
 * RegisterPropertyResult
 * ============================================================
 *
 * خروجی Use Case ثبت ملک.
 */
export interface RegisterPropertyResult {
  property: Property;
  propertyAgent: PropertyAgent;
  isNewProperty: boolean;
}

/**
 * ============================================================
 * registerProperty
 * ============================================================
 *
 * ثبت یک ملک توسط مشاور.
 */
export async function registerProperty(
  data: RegisterPropertyInput
): Promise<RegisterPropertyResult> {
  /**
   * ابتدا بررسی می‌کنیم مشاور وجود دارد.
   */
  await getAgentById(data.agentId);

  /**
   * اگر کد پستی وجود داشته باشد، بررسی می‌کنیم
   * آیا این ملک قبلاً در سیستم ثبت شده است یا خیر.
   */
  const existingProperty = data.postalCode
    ? await findPropertyByPostalCode(data.postalCode)
    : null;

  /**
   * اگر ملک قبلاً وجود نداشته باشد، ملک جدید است.
   */
  const isNewProperty = !existingProperty;

  /**
   * متغیر Property اصلی.
   */
  let property: Property;

  /**
   * اگر ملک قبلاً وجود داشته باشد،
   * همان ملک را استفاده می‌کنیم.
   */
  if (existingProperty) {
    property = existingProperty;
  } else {
    /**
     * در غیر این صورت ملک جدید ایجاد می‌کنیم.
     */
    property = await createProperty({
      registrationSource: RegistrationSource.AGENT,
      propertyType: data.propertyType,
      city: data.city,
      district: data.district,
      address: data.address,
      postalCode: data.postalCode ?? null,
      area: data.area ?? null,
      rooms: data.rooms ?? null,
      floor: data.floor ?? null,
      isActive: true,
    });
  }

  /**
 * ----------------------------------------------------------
 * بررسی ارتباط قبلی Agent با Property
 * ----------------------------------------------------------
 */

const existingAgent = await findPropertyAgent(
  property.id,
  data.agentId
);

/**
 * اگر Agent قبلاً به این Property متصل بوده:
 *
 * ACTIVE
 *   → ثبت مجدد مجاز نیست
 *
 * REVOKED
 *   → ارتباط قبلی دوباره فعال می‌شود
 */
if (existingAgent) {
  if (existingAgent.status === "REVOKED") {
    const propertyAgent =
      await reactivatePropertyAgent(
        property.id,
        data.agentId
      );

    return {
      property,
      propertyAgent,
      isNewProperty,
    };
  }

  throw new Error(
    "این مشاور قبلاً این ملک را ثبت کرده است."
  );
}

/**
 * ----------------------------------------------------------
 * Agent جدید
 * ----------------------------------------------------------
 */

const propertyAgent = await createPropertyAgent(
  property.id,
  data.agentId
);

return {
  property,
  propertyAgent,
  isNewProperty,
};

  
}

/**
 * ============================================================
 * getPropertyById
 * ============================================================
 *
 * دریافت جزئیات یک ملک.
 *
 * Repository علاوه بر Property،
 * PropertyListing را نیز برمی‌گرداند.
 *
 * بنابراین خروجی این Service:
 *
 * Property
 *    +
 * listing
 * ============================================================
 */
export async function getPropertyById(
  id: string
): Promise<PropertyWithListing> {
  /**
   * دریافت ملک به همراه Listing فعلی.
   */
  const property = await findPropertyById(id);

  /**
   * اگر ملک وجود نداشته باشد،
   * خطای Business ایجاد می‌کنیم.
   */
  if (!property) {
    throw new Error("ملک مورد نظر پیدا نشد.");
  }

  /**
   * Property به همراه Listing را برمی‌گردانیم.
   */
  return property;
}