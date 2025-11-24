import type { ContactableEntityType } from "@/types/api/companies";
import { apiClient } from "./client";
import type {
  GetContactsByRoleResponseData,
  GetEntityContactsResponseData,
  LinkContactToEntityBodyData,
  LinkContactToEntityResponseData,
  UpdateContactBodyData,
  UpdateContactResponseData,
} from "@/types/api/companies";
import type { ApiResponse } from "./utils";

// Map frontend entity types (with underscores) to backend API types (with hyphens)
const entityTypeToApi: Record<ContactableEntityType, string> = {
  company: "company",
  business_unit: "business-unit",
  region: "region",
  site: "site",
  asset_group: "asset-group",
  work_group: "work-group",
  role: "role",
};

/**
 * Convert frontend entity type to API format
 */
function toApiEntityType(entityType: ContactableEntityType): string {
  return entityTypeToApi[entityType];
}

/**
 * Get contacts for a specific entity (business unit, region, site, etc.)
 */
export async function getEntityContacts(
  companyId: string,
  entityType: ContactableEntityType,
  entityId: string | number
): Promise<GetEntityContactsResponseData> {
  const apiEntityType = toApiEntityType(entityType);
  const response = await apiClient.get<
    ApiResponse<GetEntityContactsResponseData>
  >(`/companies/${companyId}/contacts/${apiEntityType}/${entityId}`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || `Failed to fetch ${entityType} contacts`
    );
  }

  return response.data.data;
}

/**
 * Create a new contact and link it to an entity
 */
export async function createAndLinkContact(
  companyId: string,
  entityType: ContactableEntityType,
  entityId: string | number,
  data: LinkContactToEntityBodyData
): Promise<LinkContactToEntityResponseData> {
  const apiEntityType = toApiEntityType(entityType);
  const response = await apiClient.post<
    ApiResponse<LinkContactToEntityResponseData>
  >(`/companies/${companyId}/contacts/${apiEntityType}/${entityId}`, data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create contact");
  }

  return response.data.data;
}

/**
 * Update an existing contact
 */
export async function updateContact(
  companyId: string,
  contactId: number,
  updates: UpdateContactBodyData
): Promise<UpdateContactResponseData> {
  const response = await apiClient.put<ApiResponse<UpdateContactResponseData>>(
    `/companies/${companyId}/contacts/${contactId}`,
    updates
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update contact");
  }

  return response.data.data;
}

/**
 * Unlink contact from entity (and delete if no other links exist)
 */
export async function unlinkContact(
  companyId: string,
  entityType: ContactableEntityType,
  entityId: string | number,
  contactId: number
): Promise<void> {
  const apiEntityType = toApiEntityType(entityType);
  const response = await apiClient.delete<ApiResponse<void>>(
    `/companies/${companyId}/contacts/${apiEntityType}/${entityId}/${contactId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to unlink contact");
  }
}

/**
 * Get contacts by their role within a company
 */
export async function getContactsByRole(
  companyId: string,
  roleId: number
): Promise<GetContactsByRoleResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetContactsByRoleResponseData>
  >(`/companies/${companyId}/contacts/roles/${roleId}`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch contacts by role");
  }

  return response.data.data;
}
