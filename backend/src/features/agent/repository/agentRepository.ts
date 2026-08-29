import { Agent } from "../types/agent";

// هش آماده برای پسورد "123456" با bcrypt
const DEMO_PASSWORD_HASH = "$2b$10$wT0YvV9w7qN1FwO5eYpZPeZJgBqF9rXw3qK.eM9Y3k6o9c0wF4EWi";

const agents: Agent[] = [
  {
    id: "agent-demo-001",
    firstName: "رضا",
    lastName: "احمدی",
    mobile: "09121234567",
    agencyName: "املاک نمونه",
    isActive: true,
    passwordHash: DEMO_PASSWORD_HASH,
  },
  {
    id: "agent-002",
    firstName: "علی",
    lastName: "رضایی",
    mobile: "09351234567",
    agencyName: "املاک پاسارگاد",
    isActive: true,
    passwordHash: DEMO_PASSWORD_HASH,
  },
];

export async function findAgentById(id: string): Promise<Agent | undefined> {
  return agents.find((agent) => agent.id === id);
}

export async function findAgentByMobile(mobile: string): Promise<Agent | undefined> {
  return agents.find((agent) => agent.mobile === mobile);
}
