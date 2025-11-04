import type { ActivityWidgetResponseData } from "@/types/api/dashboard";
import { apiClient } from "./client";
import type { MetricConfig } from "@/hooks/useDashboardLayouts";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface MetricData {
  title: string;
  metricType: string;
  value?: number | string;
  phaseBadge?: {
    text: string;
    color?: string;
    borderColor?: string;
  };
  badges?: Array<{
    text: string;
    color?: string;
    borderColor?: string;
    icon?: string;
  }>;
  secondaryMetrics?: Array<{
    value: number | string;
    label: string;
    icon?: string;
  }>;
  subtitle?: string;
  description?: string;
  trend?: number;
  status?: "up" | "down" | "neutral";
}

export interface TableData {
  rows: Array<Record<string, string | number>>;
  columns: Array<{ key: string; label: string }>;
  scope?: {
    assessmentName?: string;
    programName?: string;
  };
}

export async function getActivityData(
  companyId: string,
  entityType: "interviews" | "assessments" | "programs"
): Promise<ActivityWidgetResponseData> {
  const response = await apiClient.get<ApiResponse<ActivityWidgetResponseData>>(
    `/dashboards/widgets/${companyId}/activity`,
    {
      params: { entityType },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch activity data");
  }

  return response.data.data;
}

export async function getMetricData(
  companyId: string,
  metricType: MetricConfig["metricType"],
  title?: string
): Promise<MetricData> {
  const response = await apiClient.get<ApiResponse<MetricData>>(
    `/dashboards/widgets/${companyId}/metrics`,
    {
      params: { metricType, title },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch metric data");
  }

  return response.data.data;
}

export async function getTableData(
  companyId: string,
  entityType: "actions" | "recommendations" | "comments",
  assessmentId?: number,
  programId?: number
): Promise<TableData> {
  const response = await apiClient.get<ApiResponse<TableData>>(
    `/dashboards/widgets/${companyId}/table`,
    {
      params: { entityType, assessmentId, programId },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch table data");
  }

  return response.data.data;
}

export async function getActionsData(companyId: string): Promise<string[]> {
  const response = await apiClient.get<ApiResponse<string[]>>(
    `/dashboards/widgets/${companyId}/actions`,
    {
      params: { entityType: "actions" },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch actions data");
  }

  return response.data.data;
}
