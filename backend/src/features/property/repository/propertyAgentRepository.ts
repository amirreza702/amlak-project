import type { PropertyAgent } from "../types/propertyAgent";


/*
 * شبیه‌سازی موقت جدول ارتباطی Database
 *
 * بعداً به PostgreSQL منتقل می‌شود.
 */
const propertyAgents: PropertyAgent[] = [];


/**
 * بررسی می‌کند آیا یک مشاور قبلاً
 * به یک ملک متصل شده است یا خیر.
 */
export function findPropertyAgent(
  propertyId: string,
  agentId: string
): PropertyAgent | undefined {

  return propertyAgents.find(
    (item) =>
      item.propertyId === propertyId &&
      item.agentId === agentId
  );
}


/**
 * بررسی می‌کند آیا این ملک
 * حداقل یک مشاور دارد یا خیر.
 */
export function hasPropertyAgents(
  propertyId: string
): boolean {

  return propertyAgents.some(
    (item) =>
      item.propertyId === propertyId
  );
}


/**
 * ایجاد ارتباط بین مشاور و ملک
 */
export function createPropertyAgent(
  propertyId: string,
  agentId: string
): PropertyAgent {

  const propertyAgent: PropertyAgent = {

    propertyId,

    agentId,

    registeredAt:
      new Date(),

    isFirstRegistrant:
      !hasPropertyAgents(propertyId),
  };


  propertyAgents.push(
    propertyAgent
  );


  return propertyAgent;
}