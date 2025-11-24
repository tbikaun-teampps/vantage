import type {
  CompanyImportResponseData,
  GetCompaniesResponseData,
  GetCompanyByIdResponseData,
  CreateCompanyBodyData,
  CreateCompanyResponseData,
  UpdateCompanyBodyData,
  UpdateCompanyResponseData,
  GetCompanyTreeResponseData,
  GetCompanyEntitiesResponseData,
  GetCompanyEntitiesParams,
  CreateCompanyEntityBodyData,
  CreateCompanyEntityResponseData,
  CreateCompanyEntityParams,
  UpdateCompanyEntityResponseData,
  UpdateCompanyEntityBodyData,
  UpdateCompanyEntityParams,
  DeleteCompanyEntityParams,
  GetTeamResponseData,
  AddTeamMemberBodyData,
  AddTeamMemberResponseData,
  UpdateTeamMemberBodyData,
  UpdateTeamMemberResponseData,
  GetCompanyInterviewResponseActionsResponseData,
  UploadCompanyIconResponseData,
  UpdateCompanyBrandingBodyData,
  UpdateCompanyBrandingResponseData,
  BusinessUnitEntity,
  RegionEntity,
  SiteEntity,
  AssetGroupEntity,
} from "@/types/api/companies";
import type { TreeNodeType } from "@/types/company";
import { apiClient } from "./client";
import type { ApiResponse } from "./utils";

// Map TreeNodeType to API EntityType (with hyphens)
type EntityType =
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
export async function getCompanies(): Promise<GetCompaniesResponseData> {
  const response =
    await apiClient.get<ApiResponse<GetCompaniesResponseData>>("/companies");

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch companies");
  }

  return response.data.data;
}

export async function getCompanyById(
  companyId: string
): Promise<GetCompanyByIdResponseData> {
  const response = await apiClient.get<ApiResponse<GetCompanyByIdResponseData>>(
    `/companies/${companyId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch company");
  }

  return response.data.data;
}

export async function createCompany(
  data: CreateCompanyBodyData
): Promise<CreateCompanyResponseData> {
  const response = await apiClient.post<ApiResponse<CreateCompanyResponseData>>(
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
  data: UpdateCompanyBodyData
): Promise<UpdateCompanyResponseData> {
  const response = await apiClient.put<ApiResponse<UpdateCompanyResponseData>>(
    `/companies/${companyId}`,
    data
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update company");
  }

  return response.data.data;
}

export async function deleteCompany(companyId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/companies/${companyId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete company");
  }
}

// Company tree
export async function getCompanyTree(
  companyId: string
): Promise<GetCompanyTreeResponseData> {
  const response = await apiClient.get<ApiResponse<GetCompanyTreeResponseData>>(
    `/companies/${companyId}/tree`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch company tree");
  }

  return response.data.data;
}

// Generic entity operations
async function getEntities(
  companyId: string,
  params: GetCompanyEntitiesParams
): Promise<GetCompanyEntitiesResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetCompanyEntitiesResponseData>
  >(`/companies/${companyId}/entities`, {
    params,
  });

  if (!response.data.success) {
    throw new Error(response.data.error || `Failed to fetch ${params.type}`);
  }

  return response.data.data;
}

export async function createEntity(
  companyId: string,
  params: CreateCompanyEntityParams,
  data: CreateCompanyEntityBodyData
): Promise<CreateCompanyEntityResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateCompanyEntityResponseData>
  >(`/companies/${companyId}/entities`, data, {
    params,
  });

  if (!response.data.success) {
    throw new Error(response.data.error || `Failed to create ${params.type}`);
  }

  return response.data.data;
}

export async function updateEntity(
  companyId: string,
  entityId: string | number,
  params: UpdateCompanyEntityParams,
  data: UpdateCompanyEntityBodyData
): Promise<UpdateCompanyEntityResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateCompanyEntityResponseData>
  >(`/companies/${companyId}/entities/${entityId}`, data, {
    params,
  });

  if (!response.data.success) {
    throw new Error(response.data.error || `Failed to update ${params.type}`);
  }

  return response.data.data;
}

export async function deleteEntity(
  companyId: string,
  entityId: string | number,
  params: DeleteCompanyEntityParams
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/companies/${companyId}/entities/${entityId}`,
    {
      params,
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || `Failed to delete ${params.type}`);
  }
}

// Convenience functions for specific entity types
// These now have proper type inference from the discriminated union
export async function getBusinessUnits(
  companyId: string
): Promise<BusinessUnitEntity[]> {
  const entities = await getEntities(companyId, { type: "business-units" });
  return entities.filter(
    (e): e is BusinessUnitEntity => e.entity_type === "business_unit"
  );
}

export async function getRegions(companyId: string): Promise<RegionEntity[]> {
  const entities = await getEntities(companyId, { type: "regions" });
  return entities.filter((e): e is RegionEntity => e.entity_type === "region");
}

export async function getSites(companyId: string): Promise<SiteEntity[]> {
  const entities = await getEntities(companyId, { type: "sites" });
  return entities.filter((e): e is SiteEntity => e.entity_type === "site");
}

export async function getAssetGroups(
  companyId: string
): Promise<AssetGroupEntity[]> {
  const entities = await getEntities(companyId, { type: "asset-groups" });
  return entities.filter(
    (e): e is AssetGroupEntity => e.entity_type === "asset_group"
  );
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
): Promise<CompanyImportResponseData> {
  const formData = new FormData();
  formData.append("file", data.file);

  const response = await apiClient.post<ApiResponse<CompanyImportResponseData>>(
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

export async function getTeamMembers(
  companyId: string
): Promise<GetTeamResponseData> {
  const response = await apiClient.get<ApiResponse<GetTeamResponseData>>(
    `/companies/${companyId}/team`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch team members");
  }

  return response.data.data;
}

export async function addTeamMember(
  companyId: string,
  data: AddTeamMemberBodyData
): Promise<AddTeamMemberResponseData> {
  const response = await apiClient.post<ApiResponse<AddTeamMemberResponseData>>(
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
  data: UpdateTeamMemberBodyData
): Promise<UpdateTeamMemberResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateTeamMemberResponseData>
  >(`/companies/${companyId}/team/${userId}`, data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update team member");
  }

  return response.data.data;
}

export async function removeTeamMember(
  companyId: string,
  userId: string
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/companies/${companyId}/team/${userId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to remove team member");
  }
}

export async function getCompanyInterviewResponseActions(
  companyId: string
): Promise<GetCompanyInterviewResponseActionsResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetCompanyInterviewResponseActionsResponseData>
  >(`/companies/${companyId}/actions`);

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
): Promise<UploadCompanyIconResponseData> {
  const formData = new FormData();
  formData.append("icon", file);

  const response = await apiClient.post<
    ApiResponse<UploadCompanyIconResponseData>
  >(`/companies/${companyId}/icon`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to upload company icon");
  }

  return response.data.data;
}

export async function removeCompanyIcon(companyId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/companies/${companyId}/icon`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to remove company icon");
  }
}

// Company Branding Management
export async function updateCompanyBranding(
  companyId: string,
  data: UpdateCompanyBrandingBodyData
): Promise<UpdateCompanyBrandingResponseData> {
  const response = await apiClient.patch<
    ApiResponse<UpdateCompanyBrandingResponseData>
  >(`/companies/${companyId}/branding`, data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update company branding");
  }

  return response.data.data;
}
