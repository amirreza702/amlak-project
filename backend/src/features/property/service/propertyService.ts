/**
 * ============================================================
 * Property Service
 * ============================================================
 *
 * منطق Business مربوط به ثبت ملک در این Service قرار دارد.
 *
 * جریان:
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
} from "../repository/propertyRepository";

import {
  createPropertyAgent,
  findPropertyAgent,
} from "../repository/propertyAgentRepository";

import type { Property } from "../types/property";
import type { PropertyAgent } from "../types/propertyAgent";
import type { RegisterPropertyInput } from "../types/registerProperty";

/**
 * نتیجه Use Case ثبت ملک
 */
export interface RegisterPropertyResult {
  property: Property;
  propertyAgent: PropertyAgent;
  isNewProperty: boolean;
}

/**
 * ============================================================
 * ثبت ملک توسط مشاور
 * ============================================================
 */
export async function registerProperty(
  data: RegisterPropertyInput
): Promise<RegisterPropertyResult> {

  /**
   * ----------------------------------------------------------
   * مرحله ۱
   * ----------------------------------------------------------
   * اطمینان از وجود مشاور
   */
  await getAgentById(data.agentId);

  /**
   * ----------------------------------------------------------
   * مرحله ۲
   * ----------------------------------------------------------
   * اگر کد پستی وجود داشته باشد، بررسی می‌کنیم که آیا
   * ملک قبلاً در سیستم ثبت شده است یا خیر.
   *
   * چون postalCode اختیاری است، در صورت نبودن آن
   * جستجو انجام نمی‌دهیم.
   */
  const existingProperty = data.postalCode
    ? await findPropertyByPostalCode(data.postalCode)
    : null;

  const isNewProperty = !existingProperty;

  /**
   * ----------------------------------------------------------
   * مرحله ۳
   * ----------------------------------------------------------
   * ایجاد ملک در صورتی که قبلاً وجود نداشته باشد.
   */
  let property: Property;

  if (existingProperty) {

    /**
     * ملک قبلاً ثبت شده است.
     */
    property = existingProperty;

  } else {

    /**
     * agentId متعلق به ارتباط Property-Agent است
     * و نباید وارد جدول Property شود.
     */
    property = await createProperty({

      /**
       * نوع ثبت ملک مشخص می‌کند که ملک توسط مشاور
       * وارد سیستم شده است.
       */
      registrationSource: RegistrationSource.AGENT,

      /**
       * اطلاعات اصلی ملک
       */
      propertyType: data.propertyType,
      city: data.city,
      district: data.district,
      address: data.address,

      /**
       * اطلاعات اختیاری
       */
      postalCode: data.postalCode ?? null,
      area: data.area ?? null,
      rooms: data.rooms ?? null,
      floor: data.floor ?? null,

      /**
       * ملک تازه ایجادشده در ابتدا فعال است.
       */
      isActive: true,
    });
  }

  /**
   * ----------------------------------------------------------
   * مرحله ۴
   * ----------------------------------------------------------
   * بررسی می‌کنیم که این مشاور قبلاً برای این ملک
   * ارتباط Property-Agent ایجاد نکرده باشد.
   */
  const existingAgent = await findPropertyAgent(
    property.id,
    data.agentId
  );

  if (existingAgent) {
    throw new Error(
      "این مشاور قبلاً این ملک را ثبت کرده است."
    );
  }

  /**
   * ----------------------------------------------------------
   * مرحله ۵
   * ----------------------------------------------------------
   * ایجاد ارتباط بین ملک و مشاور.
   */
  const propertyAgent = await createPropertyAgent(
    property.id,
    data.agentId
  );

  /**
   * ----------------------------------------------------------
   * نتیجه نهایی
   * ----------------------------------------------------------
   */
  return {
    property,
    propertyAgent,
    isNewProperty,
  };
}