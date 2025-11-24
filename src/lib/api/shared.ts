import type {
  CreateSharedRoleBodyData,
  CreateSharedRoleResponseData,
  GetAllSharedRolesResponseData,
  GetMeasurementDefinitionByIdResponseData,
  GetMeasurementDefinitionsResponseData,
  UpdateSharedRoleBodyData,
  UpdateSharedRoleResponseData,
} from "@/types/api/shared";
import { apiClient } from "./client";
import type { ApiResponse } from "./utils";

/**
 * Get all shared roles (system roles + user-created roles)
 */
export async function getAllSharedRoles(): Promise<GetAllSharedRolesResponseData> {
  const response =
    await apiClient.get<ApiResponse<GetAllSharedRolesResponseData>>(
      "/shared/roles"
    );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch shared roles");
  }

  return response.data.data;
}

/**
 * Get only roles created by the current user
 */
export async function getUserSharedRoles(): Promise<GetAllSharedRolesResponseData> {
  // Filter client-side for user-created roles
  const allRoles = await getAllSharedRoles();
  return allRoles.filter((role) => role.created_by !== null);
}

/**
 * Create a new shared role
 */
export async function createSharedRole(
  data: CreateSharedRoleBodyData
): Promise<CreateSharedRoleResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateSharedRoleResponseData>
  >("/shared/roles", data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create shared role");
  }

  return response.data.data;
}

/**
 * Update an existing shared role
 */
export async function updateSharedRole(
  id: number,
  updates: UpdateSharedRoleBodyData
): Promise<UpdateSharedRoleResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateSharedRoleResponseData>
  >(`/shared/roles/${id}`, updates);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update shared role");
  }

  return response.data.data;
}

/**
 * Delete a shared role
 */
export async function deleteSharedRole(id: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/shared/roles/${id}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete shared role");
  }
}

// ===== SHARED MEASUREMENT DEFINITIONS =====

export async function getMeasurementDefinitions(): Promise<GetMeasurementDefinitionsResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetMeasurementDefinitionsResponseData>
  >("/shared/measurement-definitions");

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch measurements");
  }

  return response.data.data;
}

export async function getMeasurementDefinitionById(
  id: number
): Promise<GetMeasurementDefinitionByIdResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetMeasurementDefinitionByIdResponseData>
  >(`/shared/measurement-definitions/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch measurement");
  }

  return response.data.data;
}
