import type {
  GetActionWidgetParams,
  GetActionWidgetResponseData,
  GetActivityWidgetParams,
  GetActivityWidgetResponseData,
  GetMetricWidgetParams,
  GetMetricWidgetResponseData,
  GetTableWidgetParams,
  GetTableWidgetResponseData,
} from "@/types/api/dashboard";
import { apiClient } from "./client";
import type { ApiResponse } from "./utils";

export async function getActivityData(
  companyId: string,
  params: GetActivityWidgetParams
): Promise<GetActivityWidgetResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetActivityWidgetResponseData>
  >(`/dashboards/widgets/${companyId}/activity`, {
    params,
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch activity data");
  }

  return response.data.data;
}

export async function getMetricData(
  companyId: string,
  params: GetMetricWidgetParams
): Promise<GetMetricWidgetResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetMetricWidgetResponseData>
  >(`/dashboards/widgets/${companyId}/metrics`, {
    params,
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch metric data");
  }

  return response.data.data;
}

export async function getTableData(
  companyId: string,
  params: GetTableWidgetParams
): Promise<GetTableWidgetResponseData> {
  const response = await apiClient.get<ApiResponse<GetTableWidgetResponseData>>(
    `/dashboards/widgets/${companyId}/table`,
    {
      params,
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch table data");
  }

  return response.data.data;
}

export async function getActionsData(
  companyId: string,
  params: GetActionWidgetParams
): Promise<GetActionWidgetResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetActionWidgetResponseData>
  >(`/dashboards/widgets/${companyId}/actions`, {
    params,
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch actions data");
  }

  return response.data.data;
}
