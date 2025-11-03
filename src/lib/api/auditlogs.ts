import { apiClient } from "./client";
import type { AuditLogResponseData } from "@/types/api/audit";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function getAuditLogs(
  companyId: string
): Promise<AuditLogResponseData> {
  const response = await apiClient.get<ApiResponse<AuditLogResponseData>>(
    `/audit/logs/${companyId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch audit logs");
  }

  return response.data.data;
}

export async function downloadAuditLogs(companyId: string): Promise<Blob> {
  const response = await apiClient.get(`/audit/logs/${companyId}/download`, {
    responseType: "blob",
  });

  if (response.status !== 200) {
    throw new Error("Failed to download audit logs");
  }

  return response.data;
}
