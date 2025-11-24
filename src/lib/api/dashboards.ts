import { apiClient } from "./client";
import type { ApiResponse } from "./utils";
import type {
  CreateDashboardBodyData,
  CreateDashboardResponseData,
  GetDashboardsResponseData,
  GetWidgetConfigOptionsResponseData,
  UpdateDashboardBodyData,
  UpdateDashboardResponseData,
} from "@/types/api/dashboard";

export async function getDashboards(
  companyId: string
): Promise<GetDashboardsResponseData> {
  const response = await apiClient.get<ApiResponse<GetDashboardsResponseData>>(
    `/dashboards/${companyId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch dashboards");
  }

  return response.data.data;
}

export async function createDashboard(
  companyId: string,
  data: CreateDashboardBodyData
): Promise<CreateDashboardResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateDashboardResponseData>
  >(`/dashboards/${companyId}`, data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create dashboard");
  }

  return response.data.data;
}

export async function updateDashboard(
  companyId: string,
  dashboardId: number,
  updates: UpdateDashboardBodyData
): Promise<UpdateDashboardResponseData> {
  const response = await apiClient.patch<
    ApiResponse<UpdateDashboardResponseData>
  >(`/dashboards/${companyId}/${dashboardId}`, updates);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update dashboard");
  }

  return response.data.data;
}

export async function deleteDashboard(
  companyId: string,
  dashboardId: number
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/dashboards/${companyId}/${dashboardId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete dashboard");
  }
}

export async function getWidgetConfigOptions(
  companyId: string
): Promise<GetWidgetConfigOptionsResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetWidgetConfigOptionsResponseData>
  >(`/dashboards/widgets/${companyId}/config-options`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch widget config options"
    );
  }

  return response.data.data;
}
