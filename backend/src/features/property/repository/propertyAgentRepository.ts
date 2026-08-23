import type { PropertyAgent } from "../types/propertyAgent";


const propertyAgents: PropertyAgent[] = [];


// آیا این مشاور قبلاً به این ملک متصل شده؟
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


// اولین مشاوری که ملک را ثبت کرده
export function hasPropertyAgents(
  propertyId: string
): boolean {

  return propertyAgents.some(
    (item) =>
      item.propertyId === propertyId
  );
}


// اتصال مشاور به ملک
export function createPropertyAgent(
  propertyId: string,
  agentId: string
): PropertyAgent {

  const propertyAgent: PropertyAgent = {
    propertyId,

    agentId,

    registeredAt: new Date(),

    isFirstRegistrant:
      !hasPropertyAgents(propertyId),
  };

  propertyAgents.push(propertyAgent);

  return propertyAgent;
}