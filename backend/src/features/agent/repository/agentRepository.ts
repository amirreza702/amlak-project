import { prisma } from "../../../lib/prisma";
import type { Agent } from "../types/agent";

/**
 * لایه دسترسی به داده — فقط Prisma، بدون منطق کسب‌وکار.
 */

export async function findAgentByMobile(mobile: string): Promise<Agent | null> {
  return prisma.agent.findUnique({ where: { mobile } }) as Promise<Agent | null>;
}

export async function findAgentById(id: string): Promise<Agent | null> {
  return prisma.agent.findUnique({ where: { id } }) as Promise<Agent | null>;
}
