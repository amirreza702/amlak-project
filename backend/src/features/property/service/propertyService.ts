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
  PropertyHistoryAction,
  RegistrationSource,
} from "@prisma/client";

import { getAgentById } from "../../agent/service/agentService";

import {
  createProperty,
  findPropertyByPostalCode,
  findPropertyById,
  updateProperty,
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

import { createPropertyHistory } from "../repository/propertyHistoryRepository";

import type { UpdatePropertyInput } from "../types/updateProperty";

import { prisma } from "../../../lib/prisma";

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

export async function registerProperty(
  data: RegisterPropertyInput
): Promise<RegisterPropertyResult> {
  /**
   * ============================================================
   * 1. بررسی وجود Agent
   * ============================================================
   *
   * این مرحله فقط خواندنی است و قبل از Transaction انجام می‌شود.
   */
  await getAgentById(data.agentId);

  /**
   * ============================================================
   * 2. بررسی وجود Property
   * ============================================================
   *
   * این مرحله نیز فقط خواندنی است.
   */
  const existingProperty = data.postalCode
    ? await findPropertyByPostalCode(data.postalCode)
    : null;

  /**
   * مشخص می‌کند آیا Property جدید ایجاد خواهد شد یا خیر.
   */
  const isNewProperty = !existingProperty;

  /**
   * ============================================================
   * 3. عملیات اصلی ثبت Property
   * ============================================================
   *
   * ایجاد Property،
   * ثبت History،
   * و ایجاد ارتباط Agent
   *
   * همگی یک عملیات اتمیک هستند.
   */
  return prisma.$transaction(async (tx) => {
    /**
     * ----------------------------------------------------------
     * Property
     * ----------------------------------------------------------
     */

    let property: Property;

    /**
     * اگر Property قبلاً وجود داشته باشد،
     * همان Property استفاده می‌شود.
     */
    if (existingProperty) {
      property = existingProperty;
    } else {
      /**
       * ایجاد Property جدید.
       */
      property = await createProperty(
        {
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
        },
        tx
      );

      /**
       * ثبت History ایجاد Property.
       *
       * این رکورد نیز داخل همان Transaction است.
       */
      await createPropertyHistory(
        {
          propertyId: property.id,
          action: PropertyHistoryAction.CREATED,
          reason: "ایجاد ملک جدید",
        },
        tx
      );
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
     * اگر Agent قبلاً به Property متصل بوده:
     *
     * ACTIVE
     *   → ثبت مجدد مجاز نیست
     *
     * REVOKED
     *   → ارتباط دوباره فعال می‌شود.
     */
    if (existingAgent) {
      if (existingAgent.status === "REVOKED") {
        const propertyAgent =
          await reactivatePropertyAgent(
            property.id,
            data.agentId,
            tx
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
     *
     * ایجاد ارتباط Agent نیز داخل همان Transaction است.
     */
    const propertyAgent =
      await createPropertyAgent(
        property.id,
        data.agentId,
        tx
      );

    

    return {
      property,
      propertyAgent,
      isNewProperty,
    };
  });
}


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

/**
 * ============================================================
 * updatePropertyService
 * ============================================================
 *
 * ویرایش اطلاعات پایه Property.
 *
 * جریان:
 *
 * دریافت Property
 *      ↓
 * بررسی وجود ملک
 *      ↓
 * Update اطلاعات
 *      ↓
 * ثبت UPDATED در PropertyHistory
 */

export async function updatePropertyService(
  propertyId: string,
  data: UpdatePropertyInput
): Promise<Property> {
  /**
   * ============================================================
   * 1. بررسی وجود Property
   * ============================================================
   */
  const property = await findPropertyById(propertyId);

  if (!property) {
    throw new Error("ملک مورد نظر پیدا نشد.");
  }

  /**
   * ============================================================
   * 2. تشخیص تغییر موقعیت
   * ============================================================
   */
  const locationChanged =
    (data.latitudeExact !== undefined &&
      data.latitudeExact !== property.latitudeExact) ||
    (data.longitudeExact !== undefined &&
      data.longitudeExact !== property.longitudeExact) ||
    (data.latitudePublic !== undefined &&
      data.latitudePublic !== property.latitudePublic) ||
    (data.longitudePublic !== undefined &&
      data.longitudePublic !== property.longitudePublic);

  /**
   * ============================================================
   * 3. عملیات اتمیک
   * ============================================================
   *
   * Update Property
   *      +
   * History UPDATED
   *      +
   * در صورت تغییر موقعیت:
   * History LOCATION_CHANGED
   *
   * همه در یک Transaction.
   */
  return prisma.$transaction(async (tx) => {
    /**
     * ----------------------------------------------------------
     * Update Property
     * ----------------------------------------------------------
     */
    const updatedProperty = await updateProperty(
      propertyId,
      data,
      tx
    );

    /**
     * ----------------------------------------------------------
     * ثبت History مربوط به ویرایش
     * ----------------------------------------------------------
     */
    await createPropertyHistory(
      {
        propertyId,
        action: PropertyHistoryAction.UPDATED,
        reason: "ویرایش اطلاعات ملک",
      },
      tx
    );

    /**
     * ----------------------------------------------------------
     * ثبت History تغییر موقعیت
     * ----------------------------------------------------------
     */
    if (locationChanged) {
      await createPropertyHistory(
        {
          propertyId,
          action: PropertyHistoryAction.LOCATION_CHANGED,
          field: "location",
          oldValue: JSON.stringify({
            latitudeExact: property.latitudeExact,
            longitudeExact: property.longitudeExact,
            latitudePublic: property.latitudePublic,
            longitudePublic: property.longitudePublic,
          }),
          newValue: JSON.stringify({
            latitudeExact: updatedProperty.latitudeExact,
            longitudeExact: updatedProperty.longitudeExact,
            latitudePublic: updatedProperty.latitudePublic,
            longitudePublic: updatedProperty.longitudePublic,
          }),
          reason: "تغییر موقعیت ملک",
        },
        tx
      );
    }

   

    return updatedProperty;
  });
}
