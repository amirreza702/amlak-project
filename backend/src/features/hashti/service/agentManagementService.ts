import {
  findContactAccessLogs,
  findManagedAgents,
  updateAgentVerification as updateAgentVerificationRepository,
  type AgentManagementQuery,
  type ContactAccessLogQuery,
} from "../repository/agentManagementRepository";

export const getManagedAgentsService = async (
  query: AgentManagementQuery
) => findManagedAgents(query);

export const setAgentVerificationService = async (
  agentId: string,
  isVerified: boolean
) => updateAgentVerificationRepository(agentId, isVerified);

export const getHashtiContactAccessLogsService = async (
  query: ContactAccessLogQuery
) => findContactAccessLogs(query);
