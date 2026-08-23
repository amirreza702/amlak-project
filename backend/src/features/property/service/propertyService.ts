import {
  getAgentById,
} from "../../agent/service/agentService";


import {
  findPropertyByPostalCode,
  createProperty,
} from "../repository/propertyRepository";


import {
  findPropertyAgent,
  createPropertyAgent,
} from "../repository/propertyAgentRepository";


import type { Property } from "../types/property";

import type { RegisterPropertyInput } from "../types/registerProperty";

import type { PropertyAgent } from "../types/propertyAgent";


/**
 * نتیجه Use Case ثبت ملک
 */
export interface RegisterPropertyResult {

  property: Property;

  propertyAgent: PropertyAgent;

  /**
   * مشخص می‌کند Property تازه ایجاد شده
   * یا قبلاً وجود داشته است.
   */
  isNewProperty: boolean;
}


/**
 * Use Case:
 *
 * ثبت ملک توسط مشاور
 */
export function registerProperty(
  data: RegisterPropertyInput
): RegisterPropertyResult {


  // ==================================================
  // 1. بررسی وجود مشاور
  // ==================================================

  getAgentById(
    data.agentId
  );


  // ==================================================
  // 2. جستجوی ملک بر اساس کد پستی
  // ==================================================

  let property =
    findPropertyByPostalCode(
      data.postalCode
    );


  // ==================================================
  // 3. تشخیص جدید یا موجود بودن ملک
  // ==================================================

  const isNewProperty =
    property === undefined;


  // ==================================================
  // 4. اگر ملک وجود ندارد، ایجاد شود
  // ==================================================

  if (!property) {

    property =
      createProperty({

        postalCode:
          data.postalCode,

        area:
          data.area,

        rooms:
          data.rooms,

        floor:
          data.floor,
      });
  }


  // ==================================================
  // 5. بررسی ارتباط قبلی مشاور با ملک
  // ==================================================

  const existingPropertyAgent =
    findPropertyAgent(

      property.id,

      data.agentId
    );


  if (existingPropertyAgent) {

    throw new Error(
      "این مشاور قبلاً این ملک را ثبت کرده است."
    );
  }


  // ==================================================
  // 6. ایجاد ارتباط مشاور و ملک
  // ==================================================

  const propertyAgent =
    createPropertyAgent(

      property.id,

      data.agentId
    );


  // ==================================================
  // 7. برگرداندن نتیجه Use Case
  // ==================================================

  return {

    property,

    propertyAgent,

    isNewProperty,
  };
}