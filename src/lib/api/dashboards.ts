import { apiClient } from "./client";
import type { Layout } from "react-grid-layout";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface DashboardItem {
  id: string;
  widgetType: string;
  config: any;
}

export interface CreateDashboardInput {
  name: string;
  widgets: DashboardItem[];
  layout: Layout[];
}

export interface UpdateDashboardInput {
  name?: string;
  widgets?: DashboardItem[];
  layout?: Layout[];
}

export interface Dashboard {
  id: number;
  name: string;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  widgets: any;
  layout: any;
}

export async function getDashboards(companyId: string): Promise<Dashboard[]> {
  const response = await apiClient.get<ApiResponse<Dashboard[]>>(
    `/dashboards/${companyId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch dashboards");
  }

  return response.data.data;
}

export async function createDashboard(
  companyId: string,
  input: CreateDashboardInput
): Promise<Dashboard> {
  try {
    const response = await apiClient.post<ApiResponse<Dashboard>>(
      `/dashboards/${companyId}`,
      input
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create dashboard");
    }

    toast.success("Dashboard created successfully");
    return response.data.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to create dashboard");
    toast.error(errorMessage);
    throw error;
  }
}

export async function updateDashboard(
  companyId: string,
  dashboardId: number,
  updates: UpdateDashboardInput
): Promise<Dashboard> {
  try {
    const response = await apiClient.patch<ApiResponse<Dashboard>>(
      `/dashboards/${companyId}/${dashboardId}`,
      updates
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update dashboard");
    }

    toast.success("Dashboard updated successfully");
    return response.data.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to update dashboard");
    toast.error(errorMessage);
    throw error;
  }
}

export async function deleteDashboard(
  companyId: string,
  dashboardId: number
): Promise<void> {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/dashboards/${companyId}/${dashboardId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete dashboard");
    }

    toast.success("Dashboard deleted successfully");
  } catch (error) {
    const errorMessage = getErrorMessage(error, "Failed to delete dashboard");
    toast.error(errorMessage);
    throw error;
  }
}

export interface WidgetConfigOptions {
  assessments: Array<{
    id: number;
    name: string;
    status: string;
  }>;
  programs: Array<{
    id: number;
    name: string;
    status: string;
  }>;
  interviews: Array<{
    id: number;
    name: string;
    status: string;
  }>;
}

export async function getWidgetConfigOptions(
  companyId: string
): Promise<WidgetConfigOptions> {
  const response = await apiClient.get<ApiResponse<WidgetConfigOptions>>(
    `/dashboards/widgets/${companyId}/config-options`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch widget config options"
    );
  }

  return response.data.data;
}
