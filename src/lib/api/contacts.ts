import type {
  Contact,
  ContactFormData,
  ContactableEntityType,
} from "@/types/contact";
import { apiClient } from "./client";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
  error?: string;
}

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
 * Get all contacts for a company
 */
export async function getCompanyContacts(
  companyId: string
): Promise<Contact[]> {
  const response = await apiClient.get<ApiResponse<Contact[]>>(
    `/companies/${companyId}/contacts`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch company contacts");
  }

  return response.data.data;
}

/**
 * Get contacts for a specific entity (business unit, region, site, etc.)
 */
export async function getEntityContacts(
  companyId: string,
  entityType: ContactableEntityType,
  entityId: string | number
): Promise<Contact[]> {
  const apiEntityType = toApiEntityType(entityType);
  const response = await apiClient.get<ApiResponse<Contact[]>>(
    `/companies/${companyId}/contacts/${apiEntityType}/${entityId}`
  );

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
  contactData: ContactFormData
): Promise<Contact> {
  const apiEntityType = toApiEntityType(entityType);
  const response = await apiClient.post<ApiResponse<Contact>>(
    `/companies/${companyId}/contacts/${apiEntityType}/${entityId}`,
    contactData
  );

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
  contactData: Partial<ContactFormData>
): Promise<Contact> {
  const response = await apiClient.put<ApiResponse<Contact>>(
    `/companies/${companyId}/contacts/${contactId}`,
    contactData
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
): Promise<{ message: string }> {
  const apiEntityType = toApiEntityType(entityType);
  const response = await apiClient.delete<MessageResponse>(
    `/companies/${companyId}/contacts/${apiEntityType}/${entityId}/${contactId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to unlink contact");
  }

  return { message: response.data.message };
}

/**
 * Get contacts by their role within a company
 */
export async function getContactsByRole(
  companyId: string,
  roleId: number
): Promise<Contact[]> {
  const response = await apiClient.get<ApiResponse<{ contact: Contact }[]>>(
    `/companies/${companyId}/contacts/roles/${roleId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch contacts by role");
  }

  // The backend returns an array of objects with a 'contact' property, so we need to extract the contacts
  return response.data.data.map((item) => item.contact);
}
