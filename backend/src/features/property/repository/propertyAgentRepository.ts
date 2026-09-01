import { prisma } from "../../../lib/prisma";
import type { PropertyAgent } from "../types/propertyAgent";

export const findPropertyAgent = async (
  propertyId: string,
  agentId: string
): Promise<PropertyAgent | null> => {
  return prisma.propertyAgent.findUnique({
    where: { propertyId_agentId: { propertyId, agentId } },
  });
};

export const hasPropertyAgents = async (propertyId: string): Promise<boolean> => {
  const count = await prisma.propertyAgent.count({ where: { propertyId } });
  return count > 0;
};

export const createPropertyAgent = async (
  propertyId: string,
  agentId: string
): Promise<PropertyAgent> => {
  const isFirstRegistrant = !(await hasPropertyAgents(propertyId));
  return prisma.propertyAgent.create({
    data: {
      propertyId,
      agentId,
      isFirstRegistrant,
    },
  });
};
