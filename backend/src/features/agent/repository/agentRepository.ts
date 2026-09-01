// src/features/agent/repository/agentRepository.ts
import { prisma } from "../../../lib/prisma";
import type { Agent } from "../types/agent";

export const findAgentById = async (id: string): Promise<Agent | null> => {
  return prisma.agent.findUnique({ where: { id } });
};

export const findAgentByMobile = async (mobile: string): Promise<Agent | null> => {
  return prisma.agent.findUnique({ where: { mobile } });
};

export const createAgent = async (
  data: Omit<Agent, "id" | "createdAt" | "updatedAt">
): Promise<Agent> => {
  return prisma.agent.create({ data });
};

export const findAllAgents = async (): Promise<Agent[]> => {
  return prisma.agent.findMany({ orderBy: { createdAt: "desc" } });
};

