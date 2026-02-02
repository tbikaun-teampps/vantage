import type { paths } from ".";

export type AuditLogResponseData =
  paths["/audit/logs/{companyId}"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type AuditLogListItem = AuditLogResponseData[number];
