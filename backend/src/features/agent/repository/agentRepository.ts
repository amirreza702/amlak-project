// src/features/agent/repository/agentRepository.ts
import { prisma } from "../../../lib/prisma";
import { Agent } from "../types/agent";

export class AgentRepository {
  async create(data: Omit<Agent, "id" | "createdAt">): Promise<Agent> {
    return await prisma.agent.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
  }

  async findById(id: string): Promise<Agent | null> {
    return await prisma.agent.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<Agent[]> {
    return await prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}
