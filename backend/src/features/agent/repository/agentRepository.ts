import type { Agent } from "../types/agent";

/*
 * موقتاً نقش Database را بازی می‌کند.
 *
 * توجه:
 * هیچ Business Logic نباید در این فایل باشد.
 * بعداً این فایل را با PostgreSQL جایگزین می‌کنیم.
 */
const agents: Agent[] = [
  {
    id: "agent-001",
    name: "مشاور اول",
  },
  {
    id: "agent-002",
    name: "مشاور دوم",
  },
];


/**
 * پیدا کردن یک مشاور با شناسه
 */
export function findAgentById(
  id: string
): Agent | undefined {

  return agents.find(
    (agent) => agent.id === id
  );
}