import { findAgentById } from "../repository/agentRepository";
import { AuthError, Agent, AgentPublic } from "../types/agent";

/** حذف فیلدهای حساس و متادیتا قبل از ارسال به کلاینت */
export function sanitizeAgent(agent: Agent): AgentPublic {
  // به صورت صریح فیلد passwordHash جدا شده و بقیه فیلدها بازگردانده می‌شوند
  const { passwordHash, ...safeAgent } = agent;
  return safeAgent;
}

/** دریافت مشاور فعال با id — برای /me */
export async function getAgentById(id: string): Promise<AgentPublic> {
  const agent = await findAgentById(id);

  if (!agent || !agent.isActive) {
    throw new AuthError("مشاور مورد نظر پیدا نشد یا غیرفعال است.", 401);
  }

  return sanitizeAgent(agent);
}
