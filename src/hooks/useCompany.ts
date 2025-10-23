import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  deleteCompany,
  getCompanies,
  getCompanyTree,
  getBusinessUnits,
  getRegions,
  getSites,
  getAssetGroups,
  createCompany,
  updateCompany,
  createEntity,
  updateEntity,
  deleteEntity,
  getEntityTypeFromTreeNodeType,
  getTeamMembers,
  addTeamMember as addTeamMemberApi,
  updateTeamMember as updateTeamMemberApi,
  removeTeamMember as removeTeamMemberApi,
  type TeamMember,
  type CompanyRole,
} from "@/lib/api/companies";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import type { Company, TreeNodeType } from "@/types/company";

// Helper to convert FormData to JSON object
function formDataToJson(formData: FormData): Record<string, any> {
  const json: Record<string, any> = {};
  formData.forEach((value, key) => {
    // Handle file inputs - skip them or handle separately if needed
    if (value instanceof File) return;
    json[key] = value;
  });
  return json;
}

// Query key factory for cache management
export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  tree: (companyId: string) => [...companyKeys.all, "tree", companyId] as const,
  businessUnits: (companyId: string) =>
    [...companyKeys.all, "business-units", companyId] as const,
  regions: (companyId: string) =>
    [...companyKeys.all, "regions", companyId] as const,
  sites: (companyId: string) =>
    [...companyKeys.all, "sites", companyId] as const,
  assetGroups: (companyId: string) =>
    [...companyKeys.all, "asset-groups", companyId] as const,
  roles: () => [...companyKeys.all, "roles"] as const,
  team: (companyId: string) => [...companyKeys.all, "team", companyId] as const,
};

// Data fetching hooks
export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.lists(),
    queryFn: () => getCompanies(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCurrentCompany() {
  const companyId = useCompanyFromUrl();

  const { data: companies, ...query } = useCompanies();

  const currentCompany = useMemo(() => {
    if (!companies || !companyId) return null;
    return companies.find((c) => c.id === companyId) || null;
  }, [companies, companyId]);

  return {
    data: currentCompany,
    ...query,
  };
}

export function useCompanyTree(companyId: string) {
  return useQuery({
    queryKey: companyId
      ? companyKeys.tree(companyId)
      : [...companyKeys.all, "tree", "null"],
    queryFn: () => getCompanyTree(companyId),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes - tree data changes more frequently
  });
}

export function useBusinessUnits(companyId: string | null) {
  return useQuery({
    queryKey: companyId
      ? companyKeys.businessUnits(companyId)
      : [...companyKeys.all, "business-units", "null"],
    queryFn: () => (companyId ? getBusinessUnits(companyId) : []),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRegions(companyId: string | null) {
  return useQuery({
    queryKey: companyId
      ? companyKeys.regions(companyId)
      : [...companyKeys.all, "regions", "null"],
    queryFn: () => (companyId ? getRegions(companyId) : []),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSites(companyId: string | null) {
  return useQuery({
    queryKey: companyId
      ? companyKeys.sites(companyId)
      : [...companyKeys.all, "sites", "null"],
    queryFn: () => (companyId ? getSites(companyId) : []),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAssetGroups(companyId: string | null) {
  return useQuery({
    queryKey: companyId
      ? companyKeys.assetGroups(companyId)
      : [...companyKeys.all, "asset-groups", "null"],
    queryFn: () => (companyId ? getAssetGroups(companyId) : []),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation hooks with cache updates
export function useCompanyActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => {
      const data = formDataToJson(formData);
      return createCompany(data);
    },
    onSuccess: (newCompany) => {
      // Optimistic cache update for companies list
      queryClient.setQueryData(companyKeys.lists(), (old: Company[] = []) =>
        [newCompany, ...old].sort(
          (a, b) =>
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
        )
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      companyId,
      formData,
    }: {
      companyId: string;
      formData: FormData;
    }) => {
      const data = formDataToJson(formData);
      return updateCompany(companyId, data);
    },
    onSuccess: (updatedCompany, { companyId }) => {
      // Update companies list
      queryClient.setQueryData(companyKeys.lists(), (old: Company[] = []) =>
        old.map((c) => (c.id === companyId ? updatedCompany : c))
      );

      // Invalidate tree cache for updated company
      queryClient.invalidateQueries({ queryKey: companyKeys.tree(companyId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (companyId: string) => deleteCompany(companyId),
    onSuccess: (_, companyId) => {
      // Remove from companies list
      queryClient.setQueryData(companyKeys.lists(), (old: Company[] = []) =>
        old.filter((c) => c.id !== companyId)
      );

      // Remove all related cache entries
      queryClient.removeQueries({ queryKey: companyKeys.tree(companyId) });
      queryClient.removeQueries({
        queryKey: companyKeys.businessUnits(companyId),
      });
      queryClient.removeQueries({ queryKey: companyKeys.regions(companyId) });
      queryClient.removeQueries({ queryKey: companyKeys.sites(companyId) });
      queryClient.removeQueries({
        queryKey: companyKeys.assetGroups(companyId),
      });
    },
  });

  return {
    createCompany: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateCompany: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deleteCompany: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}

// Tree node mutation hooks
export function useTreeNodeActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({
      parentType,
      parentId,
      nodeType,
      formData,
      companyId,
    }: {
      parentType: TreeNodeType;
      parentId: number;
      nodeType: TreeNodeType;
      formData: FormData;
      companyId: string;
    }) => {
      const entityType = getEntityTypeFromTreeNodeType(nodeType);
      if (!entityType) {
        throw new Error("Cannot create company node through tree node actions");
      }

      const data = formDataToJson(formData);

      // Add parent relationship based on nodeType
      const parentFieldMap: Record<string, string> = {
        "business-units": "company_id",
        regions: "business_unit_id",
        sites: "region_id",
        "asset-groups": "site_id",
        "work-groups": "asset_group_id",
        roles: "work_group_id",
      };

      const parentField = parentFieldMap[entityType];
      if (parentField) {
        data[parentField] = parentId;
      }

      return createEntity(companyId, entityType, data);
    },
    onSuccess: (_, { companyId }) => {
      // Invalidate tree cache to reload with new node
      queryClient.invalidateQueries({ queryKey: companyKeys.tree(companyId) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      nodeType,
      nodeId,
      formData,
      companyId,
    }: {
      nodeType: TreeNodeType;
      nodeId: number | string;
      formData: FormData;
      companyId: string;
    }) => {
      const data = formDataToJson(formData);

      if (nodeType === "company") {
        return updateCompany(String(nodeId), data);
      }

      const entityType = getEntityTypeFromTreeNodeType(nodeType);
      if (!entityType) {
        throw new Error("Invalid node type");
      }

      return updateEntity(companyId, nodeId, entityType, data);
    },
    onSuccess: (updatedData, { nodeType, nodeId, companyId }) => {
      // If it's a company update, update the companies list
      if (nodeType === "company" && updatedData) {
        queryClient.setQueryData(companyKeys.lists(), (old: Company[] = []) =>
          old.map((c) => (c.id === nodeId ? updatedData : c))
        );
      }

      // Invalidate tree cache to reflect changes
      queryClient.invalidateQueries({ queryKey: companyKeys.tree(companyId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      nodeType,
      nodeId,
      companyId,
    }: {
      nodeType: TreeNodeType;
      nodeId: number | string;
      companyId: string;
    }) => {
      if (nodeType === "company") {
        return deleteCompany(String(nodeId));
      }

      const entityType = getEntityTypeFromTreeNodeType(nodeType);
      if (!entityType) {
        throw new Error("Invalid node type");
      }

      return deleteEntity(companyId, nodeId, entityType);
    },
    onSuccess: (_, { companyId }) => {
      // Invalidate tree cache to reflect deletion
      queryClient.invalidateQueries({ queryKey: companyKeys.tree(companyId) });
    },
  });

  return {
    createTreeNode: createMutation.mutateAsync,
    isCreatingNode: createMutation.isPending,
    createNodeError: createMutation.error,

    updateTreeNode: updateMutation.mutateAsync,
    isUpdatingNode: updateMutation.isPending,
    updateNodeError: updateMutation.error,

    deleteTreeNode: deleteMutation.mutateAsync,
    isDeletingNode: deleteMutation.isPending,
    deleteNodeError: deleteMutation.error,
  };
}

// Team Management Hooks

export function useTeamMembers(companyId: string) {
  return useQuery({
    queryKey: companyKeys.team(companyId),
    queryFn: () => getTeamMembers(companyId),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTeamActions() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: ({
      companyId,
      email,
      role,
    }: {
      companyId: string;
      email: string;
      role: CompanyRole;
    }) => addTeamMemberApi(companyId, { email, role }),
    onSuccess: (_, { companyId }) => {
      // Invalidate team cache to reload with new member
      queryClient.invalidateQueries({ queryKey: companyKeys.team(companyId) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      companyId,
      userId,
      role,
    }: {
      companyId: string;
      userId: string;
      role: CompanyRole;
    }) => updateTeamMemberApi(companyId, userId, { role }),
    onSuccess: (_, { companyId }) => {
      // Invalidate team cache to reflect role change
      queryClient.invalidateQueries({ queryKey: companyKeys.team(companyId) });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({
      companyId,
      userId,
    }: {
      companyId: string;
      userId: string;
    }) => removeTeamMemberApi(companyId, userId),
    onSuccess: (_, { companyId }) => {
      // Invalidate team cache to reflect removal
      queryClient.invalidateQueries({ queryKey: companyKeys.team(companyId) });
    },
  });

  return {
    addTeamMember: addMutation.mutateAsync,
    isAddingMember: addMutation.isPending,
    addMemberError: addMutation.error,

    updateTeamMember: updateMutation.mutateAsync,
    isUpdatingMember: updateMutation.isPending,
    updateMemberError: updateMutation.error,

    removeTeamMember: removeMutation.mutateAsync,
    isRemovingMember: removeMutation.isPending,
    removeMemberError: removeMutation.error,
  };
}

// Re-export types
export type { TeamMember, CompanyRole };
