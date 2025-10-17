import type { Company, CompanyList } from "@/types/api/companies";
import type {
  CompanyTreeNode,
  BusinessUnit,
  Region,
  Site,
  AssetGroup,
  TreeNodeType,
} from "@/types/company";
import { apiClient } from "./client";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

// Map TreeNodeType to API EntityType (with hyphens)
export type EntityType =
  | "business-units"
  | "regions"
  | "sites"
  | "asset-groups"
  | "work-groups"
  | "roles";

const treeNodeTypeToEntityType: Record<
  Exclude<TreeNodeType, "company">,
  EntityType
> = {
  business_unit: "business-units",
  region: "regions",
  site: "sites",
  asset_group: "asset-groups",
  work_group: "work-groups",
  role: "roles",
};

// Company CRUD
export async function getCompanies(): Promise<CompanyList["data"]> {
  const response = await apiClient.get<ApiResponse<CompanyList>>("/companies");

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch companies");
  }

  return response.data.data;
}

export async function getCompanyById(companyId: string): Promise<Company> {
  const response = await apiClient.get<ApiResponse<Company>>(
    `/companies/${companyId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch company");
  }

  return response.data.data;
}

export async function createCompany(data: {
  name: string;
  code?: string;
  description?: string;
}): Promise<Company> {
  const response = await apiClient.post<ApiResponse<Company>>(
    "/companies",
    data
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create company");
  }

  return response.data.data;
}

export async function updateCompany(
  companyId: string,
  data: {
    name?: string;
    code?: string;
    description?: string;
  }
): Promise<Company> {
  const response = await apiClient.put<ApiResponse<Company>>(
    `/companies/${companyId}`,
    data
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update company");
  }

  return response.data.data;
}

export async function deleteCompany(companyId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/companies/${companyId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete company");
  }
}

// Company tree
export async function getCompanyTree(
  companyId: string
): Promise<CompanyTreeNode | null> {
  const response = await apiClient.get<ApiResponse<CompanyTreeNode>>(
    `/companies/${companyId}/tree`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch company tree");
  }

  return response.data.data;
}

// Generic entity operations
export async function getEntities<T = any>(
  companyId: string,
  entityType: EntityType
): Promise<T[]> {
  const response = await apiClient.get<ApiResponse<T[]>>(
    `/companies/${companyId}/entities`,
    {
      params: { type: entityType },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || `Failed to fetch ${entityType}`);
  }

  return response.data.data;
}

export async function createEntity<T = any>(
  companyId: string,
  entityType: EntityType,
  data: any
): Promise<T> {
  const response = await apiClient.post<ApiResponse<T[]>>(
    `/companies/${companyId}/entities`,
    data,
    {
      params: { type: entityType },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || `Failed to create ${entityType}`);
  }

  // API returns array with single item
  return response.data.data[0];
}

export async function updateEntity<T = any>(
  companyId: string,
  entityId: string | number,
  entityType: EntityType,
  data: any
): Promise<T> {
  const response = await apiClient.put<ApiResponse<T[]>>(
    `/companies/${companyId}/entities/${entityId}`,
    data,
    {
      params: { type: entityType },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || `Failed to update ${entityType}`);
  }

  // API returns array with single item
  return response.data.data[0];
}

export async function deleteEntity(
  companyId: string,
  entityId: string | number,
  entityType: EntityType
): Promise<void> {
  const response = await apiClient.delete<MessageResponse>(
    `/companies/${companyId}/entities/${entityId}`,
    {
      params: { type: entityType },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || `Failed to delete ${entityType}`);
  }
}

// Convenience functions for specific entity types
export async function getBusinessUnits(
  companyId: string
): Promise<BusinessUnit[]> {
  return getEntities<BusinessUnit>(companyId, "business-units");
}

export async function getRegions(companyId: string): Promise<Region[]> {
  return getEntities<Region>(companyId, "regions");
}

export async function getSites(companyId: string): Promise<Site[]> {
  return getEntities<Site>(companyId, "sites");
}

export async function getAssetGroups(companyId: string): Promise<AssetGroup[]> {
  return getEntities<AssetGroup>(companyId, "asset-groups");
}

// Tree node operations helper
export function getEntityTypeFromTreeNodeType(
  nodeType: TreeNodeType
): EntityType | null {
  if (nodeType === "company") return null;
  return treeNodeTypeToEntityType[nodeType];
}

// Import company structure from CSV
export async function importCompanyStructure(
  companyId: string,
  data: {
    file: File;
  }
): Promise<Company> {
  const formData = new FormData();
  formData.append("file", data.file);

  const response = await apiClient.post<ApiResponse<Company>>(
    `/companies/${companyId}/import`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to import company structure"
    );
  }

  return response.data.data;
}

// Export company structure as JSON
export async function exportCompanyStructure(companyId: string): Promise<Blob> {
  const response = await apiClient.get(`/companies/${companyId}/export`, {
    responseType: "blob",
  });

  if (response.status !== 200) {
    throw new Error("Failed to export company structure");
  }

  return response.data;
}

// Team Management

// TODO: investigate whether we want to allow interviewees to be on the team so they can have their role promoted in the future.
export type CompanyRole = "owner" | "admin" | "viewer";// | "interviewee";

export interface TeamMember {
  id: number;
  user_id: string;
  company_id: string;
  role: CompanyRole;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

export async function getTeamMembers(companyId: string): Promise<TeamMember[]> {
  const response = await apiClient.get<ApiResponse<TeamMember[]>>(
    `/companies/${companyId}/team`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch team members");
  }

  return response.data.data;
}

export async function addTeamMember(
  companyId: string,
  data: {
    email: string;
    role: CompanyRole;
  }
): Promise<TeamMember> {
  const response = await apiClient.post<ApiResponse<TeamMember>>(
    `/companies/${companyId}/team`,
    data
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to add team member");
  }

  return response.data.data;
}

export async function updateTeamMember(
  companyId: string,
  userId: string,
  data: {
    role: CompanyRole;
  }
): Promise<TeamMember> {
  const response = await apiClient.put<ApiResponse<TeamMember>>(
    `/companies/${companyId}/team/${userId}`,
    data
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update team member");
  }

  return response.data.data;
}

export async function removeTeamMember(
  companyId: string,
  userId: string
): Promise<void> {
  const response = await apiClient.delete<MessageResponse>(
    `/companies/${companyId}/team/${userId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to remove team member");
  }
}

export async function getCompanyInterviewResponseActions(
  companyId: string
): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/companies/${companyId}/actions`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch interview response actions"
    );
  }

  return response.data.data;
}

// Company Icon Management
export async function uploadCompanyIcon(
  companyId: string,
  file: File
): Promise<{ icon_url: string }> {
  const formData = new FormData();
  formData.append("icon", file);

  const response = await apiClient.post<
    ApiResponse<{ icon_url: string }>
  >(
    `/companies/${companyId}/icon`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to upload company icon");
  }

  return response.data.data;
}

export async function removeCompanyIcon(companyId: string): Promise<void> {
  const response = await apiClient.delete<MessageResponse>(
    `/companies/${companyId}/icon`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to remove company icon");
  }
}

// Company Branding Management
export async function updateCompanyBranding(
  companyId: string,
  colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
  }
): Promise<Company> {
  const response = await apiClient.patch<ApiResponse<Company>>(
    `/companies/${companyId}/branding`,
    colors
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update company branding");
  }

  return response.data.data;
}
