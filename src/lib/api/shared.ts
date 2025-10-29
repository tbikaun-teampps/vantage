import { apiClient } from "./client";
import type { SharedRole } from "@/types/assessment";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface CreateSharedRoleData {
  name: string;
  description?: string;
  company_id: string;
}

export interface UpdateSharedRoleData {
  name?: string;
  description?: string;
}

/**
 * Get all shared roles (system roles + user-created roles)
 */
export async function getAllSharedRoles(): Promise<SharedRole[]> {
  const response =
    await apiClient.get<ApiResponse<SharedRole[]>>("/shared/roles");

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch shared roles");
  }

  return response.data.data;
}

/**
 * Get only roles created by the current user
 */
export async function getUserSharedRoles(): Promise<SharedRole[]> {
  // Filter client-side for user-created roles
  const allRoles = await getAllSharedRoles();
  return allRoles.filter((role) => role.created_by !== null);
}

/**
 * Create a new shared role
 */
export async function createSharedRole(
  roleData: CreateSharedRoleData
): Promise<SharedRole> {
  const response = await apiClient.post<ApiResponse<SharedRole>>(
    "/shared/roles",
    {
      name: roleData.name,
      description: roleData.description || null,
      companyId: roleData.company_id,
    }
  );

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
  roleData: UpdateSharedRoleData
): Promise<SharedRole> {
  const response = await apiClient.put<ApiResponse<SharedRole>>(
    `/shared/roles/${id}`,
    roleData
  );

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

export async function getMeasurementDefinitions(): Promise<
  Array<{
    id: number;
    name: string;
    description: string;
    calculation_type: string;
    provider: string;
    objective: string;
    calculation: string;
    required_csv_columns: Record<string, string>;
    active: boolean;
  }>
> {
  const response = await apiClient.get<
    ApiResponse<
      Array<{
        id: number;
        name: string;
        description: string;
        calculation_type: string;
        provider: string;
        objective: string;
        calculation: string;
        required_csv_columns: Record<string, string>;
        active: boolean;
      }>
    >
  >("/shared/measurement-definitions");

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch measurements");
  }

  return response.data.data;
}
