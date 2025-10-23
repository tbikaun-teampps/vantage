import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEntityContacts,
  createAndLinkContact,
  updateContact,
  unlinkContact,
} from "@/lib/api/contacts";
import type {
  Contact,
  ContactFormData,
  ContactableEntityType,
} from "@/types/contact";

/**
 * Query key factory for contact cache management
 *
 * This factory pattern allows us to:
 * - Invalidate all contacts: contactKeys.all
 * - Invalidate company contacts: contactKeys.byCompany(companyId)
 * - Invalidate entity contacts: contactKeys.byEntity(companyId, entityType, entityId)
 */
const contactKeys = {
  all: ["contacts"] as const,
  byCompany: (companyId: string) =>
    [...contactKeys.all, "company", companyId] as const,
  byEntity: (
    companyId: string,
    entityType: ContactableEntityType,
    entityId: string | number
  ) =>
    [
      ...contactKeys.all,
      "entity",
      companyId,
      entityType,
      String(entityId),
    ] as const,
};

/**
 * Fetch contacts for a specific entity (business unit, site, role, etc.)
 */
export function useEntityContacts(
  companyId: string,
  entityType: ContactableEntityType,
  entityId: string | number
) {
  return useQuery({
    queryKey: contactKeys.byEntity(companyId, entityType, entityId),
    queryFn: () => getEntityContacts(companyId, entityType, entityId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!companyId && !!entityId,
  });
}

/**
 * Contact mutation actions (create, update, unlink)
 *
 * Returns methods and states for all contact CRUD operations.
 * Handles cache invalidation automatically.
 */
export function useContactActions(companyId: string) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({
      entityType,
      entityId,
      contactData,
    }: {
      entityType: ContactableEntityType;
      entityId: string | number;
      contactData: ContactFormData;
    }) => createAndLinkContact(companyId, entityType, entityId, contactData),
    onSuccess: (newContact, { entityType, entityId }) => {
      // Optimistically add to entity contacts list
      queryClient.setQueryData(
        contactKeys.byEntity(companyId, entityType, entityId),
        (old: Contact[] | undefined) => {
          if (!old) return [newContact];
          return [...old, newContact];
        }
      );

      // Invalidate company contacts to ensure it includes the new contact
      queryClient.invalidateQueries({
        queryKey: contactKeys.byCompany(companyId),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      contactId,
      contactData,
    }: {
      contactId: number;
      contactData: Partial<ContactFormData>;
    }) => updateContact(companyId, contactId, contactData),
    onSuccess: (updatedContact) => {
      // Update all queries that contain this contact
      queryClient.setQueriesData(
        { queryKey: contactKeys.all },
        (old: Contact[] | undefined) => {
          if (!old) return old;
          return old.map((contact) =>
            contact.id === updatedContact.id ? updatedContact : contact
          );
        }
      );

      // Invalidate to ensure consistency across all lists
      queryClient.invalidateQueries({
        queryKey: contactKeys.byCompany(companyId),
      });
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: ({
      entityType,
      entityId,
      contactId,
    }: {
      companyId: string;
      entityType: ContactableEntityType;
      entityId: string | number;
      contactId: number;
    }) => unlinkContact(companyId, entityType, entityId, contactId),
    onSuccess: (_, { entityType, entityId, contactId }) => {
      // Optimistically remove from entity contacts list
      queryClient.setQueryData(
        contactKeys.byEntity(companyId, entityType, entityId),
        (old: Contact[] | undefined) => {
          if (!old) return old;
          return old.filter((contact) => contact.id !== contactId);
        }
      );

      // Invalidate company contacts (contact might be deleted if no other links)
      queryClient.invalidateQueries({
        queryKey: contactKeys.byCompany(companyId),
      });
    },
  });

  return {
    // Create contact
    createContact: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    // Update contact
    updateContact: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    // Unlink/delete contact
    unlinkContact: unlinkMutation.mutateAsync,
    isUnlinking: unlinkMutation.isPending,
    unlinkError: unlinkMutation.error,
  };
}
