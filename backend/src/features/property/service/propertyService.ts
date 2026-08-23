import { getAgentById } from "../../agent/service/agentService";

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


export interface RegisterPropertyResult {
  property: Property;

  propertyAgent: PropertyAgent;

  isNewProperty: boolean;
}


export function registerProperty(
  data: RegisterPropertyInput
): RegisterPropertyResult {

  // -----------------------------------------
  // مرحله 1
  // بررسی می‌کنیم مشاور واقعاً وجود دارد
  // -----------------------------------------

  getAgentById(data.agentId);


  // -----------------------------------------
  // مرحله 2
  // جستجوی ملک بر اساس کد پستی
  // -----------------------------------------

  let property =
    findPropertyByPostalCode(
      data.postalCode
    );


  // -----------------------------------------
  // مرحله 3
  // مشخص می‌کنیم ملک جدید است یا قبلاً وجود داشته
  // -----------------------------------------

  const isNewProperty =
    !property;


  // -----------------------------------------
  // مرحله 4
  // اگر ملک وجود نداشت، ایجادش می‌کنیم
  // -----------------------------------------

  if (!property) {

    property = createProperty({
      postalCode: data.postalCode,

      area: data.area,

      rooms: data.rooms,

      floor: data.floor,
    });
  }


  // -----------------------------------------
  // مرحله 5
  // بررسی می‌کنیم این مشاور قبلاً به این ملک
  // متصل شده یا نه
  // -----------------------------------------

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


  // -----------------------------------------
  // مرحله 6
  // اتصال مشاور به ملک
  // -----------------------------------------

  const propertyAgent =
    createPropertyAgent(
      property.id,
      data.agentId
    );


  // -----------------------------------------
  // مرحله 7
  // نتیجه Use Case
  // -----------------------------------------

  return {
    property,

    propertyAgent,

    isNewProperty,
  };
}