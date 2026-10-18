import {
  createAdminAuditLog as createAdminAuditLogRepository,
  findAdminAuditLogs,
  type AdminAuditLogQuery,
  type CreateAdminAuditLogInput,
} from "../repository/adminAuditLogRepository";

export const writeAdminAuditLogService = async (
  input: CreateAdminAuditLogInput
) => createAdminAuditLogRepository(input);

export const getAdminAuditLogsService = async (
  query: AdminAuditLogQuery
) => findAdminAuditLogs(query);
