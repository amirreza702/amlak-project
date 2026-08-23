import { findAgentById } from "../repository/agentRepository";
import type { Agent } from "../types/agent";


export function getAgentById(
  id: string
): Agent {

  const agent = findAgentById(id);

  if (!agent) {
    throw new Error(
      "مشاور مورد نظر پیدا نشد."
    );
  }

  return agent;
}