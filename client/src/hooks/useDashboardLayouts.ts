import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentCompany } from "@/hooks/useCompany";
import { useEffect, useRef } from "react";
import type { Layout } from "react-grid-layout";
import * as dashboardsApi from "@/lib/api/dashboards";
import type {
  CreateDashboardBodyData,
  Dashboard,
  UpdateDashboardBodyData,
  Widget,
} from "@/types/api/dashboard";

const createDefaultDashboard = (): CreateDashboardBodyData => ({
  name: "My Dashboard",
  widgets: [],
  layout: [],
});

// Query key factory for cache management
const dashboardLayoutKeys = {
  all: ["dashboard-layouts"] as const,
  lists: () => [...dashboardLayoutKeys.all, "list"] as const,
  list: (companyId: string) =>
    [...dashboardLayoutKeys.lists(), companyId] as const,
  detail: (id: number) => [...dashboardLayoutKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch all dashboards for a company
 */
function useDashboards(companyId?: string) {
  return useQuery({
    queryKey: companyId ? dashboardLayoutKeys.list(companyId) : [],
    queryFn: async () => {
      if (!companyId) return [];

      return await dashboardsApi.getDashboards(companyId);
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for dashboard CRUD operations with optimistic updates
 */
function useDashboardActions() {
  const queryClient = useQueryClient();
  const { data: currentCompany } = useCurrentCompany();

  const createMutation = useMutation({
    mutationFn: async (dashboard: CreateDashboardBodyData) => {
      if (!currentCompany?.id) throw new Error("No company selected");

      return await dashboardsApi.createDashboard(currentCompany.id, dashboard);
    },
    onSuccess: (newDashboard) => {
      if (!currentCompany?.id) return;

      // Optimistic cache update for dashboards list
      queryClient.setQueryData(
        dashboardLayoutKeys.list(currentCompany.id),
        (old: Dashboard[] = []) => [newDashboard, ...old]
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      dashboardId,
      updates,
    }: {
      dashboardId: number;
      updates: Partial<Dashboard>;
    }) => {
      if (!currentCompany?.id) throw new Error("No company selected");

      const updateInput: UpdateDashboardBodyData = {};
      if (updates.name !== undefined) updateInput.name = updates.name;
      if (updates.layout !== undefined) updateInput.layout = updates.layout;
      if (updates.widgets !== undefined) updateInput.widgets = updates.widgets;

      return await dashboardsApi.updateDashboard(
        currentCompany.id,
        dashboardId,
        updateInput
      );
    },
    onMutate: async ({ dashboardId, updates }) => {
      if (!currentCompany?.id) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: dashboardLayoutKeys.list(currentCompany.id),
      });

      // Snapshot previous value
      const previousDashboards = queryClient.getQueryData<Dashboard[]>(
        dashboardLayoutKeys.list(currentCompany.id)
      );

      // Optimistically update cache
      if (previousDashboards) {
        queryClient.setQueryData(
          dashboardLayoutKeys.list(currentCompany.id),
          previousDashboards.map((dashboard) =>
            dashboard.id === dashboardId
              ? { ...dashboard, ...updates, updatedAt: new Date() }
              : dashboard
          )
        );
      }

      return { previousDashboards };
    },
    onError: (_err, _variables, context) => {
      if (!currentCompany?.id || !context?.previousDashboards) return;

      // Rollback optimistic update
      queryClient.setQueryData(
        dashboardLayoutKeys.list(currentCompany.id),
        context.previousDashboards
      );
    },
    onSuccess: (updatedDashboard) => {
      if (!currentCompany?.id) return;

      // Update individual dashboard cache
      queryClient.setQueryData(
        dashboardLayoutKeys.detail(updatedDashboard.id),
        updatedDashboard
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (dashboardId: number) => {
      if (!currentCompany?.id) throw new Error("No company selected");

      await dashboardsApi.deleteDashboard(currentCompany.id, dashboardId);

      return dashboardId;
    },
    onSuccess: (deletedId) => {
      if (!currentCompany?.id) return;

      // Remove from dashboards list
      queryClient.setQueryData(
        dashboardLayoutKeys.list(currentCompany.id),
        (old: Dashboard[] = []) => old.filter((d) => d.id !== deletedId)
      );

      // Remove individual dashboard cache
      queryClient.removeQueries({
        queryKey: dashboardLayoutKeys.detail(deletedId),
      });
    },
  });

  return {
    createDashboard: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateDashboard: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deleteDashboard: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}

/**
 * Main hook for dashboard layout management
 * Provides unified interface for dashboard state and operations
 */
export function useDashboardLayoutManager() {
  const { data: currentCompany } = useCurrentCompany();
  const companyId = currentCompany?.id;
  const hasCreatedDefaultRef = useRef(false);

  const { data: dashboards = [], isLoading, error } = useDashboards(companyId);

  const {
    createDashboard,
    isCreating,
    createError,
    updateDashboard,
    isUpdating,
    updateError,
    deleteDashboard,
    isDeleting,
    deleteError,
  } = useDashboardActions();

  // Auto-create default dashboard if none exist
  useEffect(() => {
    if (
      !isLoading &&
      dashboards.length === 0 &&
      companyId &&
      !hasCreatedDefaultRef.current
    ) {
      hasCreatedDefaultRef.current = true;
      createDashboard(createDefaultDashboard());
    }
  }, [dashboards.length, isLoading, companyId, createDashboard]);

  // Helper functions for common operations
  const updateDashboardLayout = async (
    dashboardId: number,
    layout: Layout[]
  ) => {
    return updateDashboard({
      dashboardId,
      updates: { layout },
    });
  };

  const updateDashboardWidgets = async (
    dashboardId: number,
    widgets: Widget[]
  ) => {
    return updateDashboard({
      dashboardId,
      updates: { widgets },
    });
  };

  const renameDashboard = async (dashboardId: number, name: string) => {
    return updateDashboard({
      dashboardId,
      updates: { name },
    });
  };

  return {
    // Data
    dashboards,
    isLoading,
    error: error || createError || updateError || deleteError,

    // Actions
    createDashboard,
    updateDashboard,
    deleteDashboard,
    updateDashboardLayout,
    updateDashboardWidgets,
    renameDashboard,

    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
    isProcessing: isCreating || isUpdating || isDeleting,
  };
}
