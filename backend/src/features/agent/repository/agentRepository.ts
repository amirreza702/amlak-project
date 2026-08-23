import type { Agent } from "../types/agent";

// فعلاً به جای PostgreSQL یک آرایه در حافظه داریم.
// بعداً فقط لایه Repository را به PostgreSQL متصل می‌کنیم.
const agents: Agent[] = [
  {
    id: "agent-001",
    name: "مشاور نمونه",
  },
];


// پیدا کردن مشاور بر اساس ID
export function findAgentById(
  id: string
): Agent | undefined {

  return agents.find(
    (agent) => agent.id === id
  );
}