import {
  findAgentById,
} from "../repository/agentRepository";

import type { Agent } from "../types/agent";


/**
 * دریافت مشاور بر اساس شناسه
 *
 * اینجا قوانین Business مربوط به Agent
 * در صورت نیاز اعمال خواهند شد.
 */
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