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

export interface RegisterPropertyResult {
  property: Property;
  propertyAgent: PropertyAgent;
  isNewProperty: boolean;
}

export async function registerProperty(
  data: RegisterPropertyInput
): Promise<RegisterPropertyResult> {
  // اطمینان از وجود مشاور در دیتابیس
  await getAgentById(data.agentId);

  const existingProperty = await findPropertyByPostalCode(data.postalCode);
  const isNewProperty = !existingProperty;

  let property: Property;
  if (existingProperty) {
    property = existingProperty;
  } else {
    const { agentId: _, ...propertyData } = data;
    property = await createProperty({
      ...propertyData,
      isActive: true,
    });
  }

  const existingAgent = await findPropertyAgent(property.id, data.agentId);
  if (existingAgent) {
    throw new Error("این مشاور قبلاً این ملک را ثبت کرده است.");
  }

  const propertyAgent = await createPropertyAgent(property.id, data.agentId);

  return { property, propertyAgent, isNewProperty };
}
