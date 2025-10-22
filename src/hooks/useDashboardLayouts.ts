import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentCompany } from "@/hooks/useCompany";
import { useEffect, useRef } from "react";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";
import type { Layout } from "react-grid-layout";
import type { WidgetType } from "@/components/dashboard/widgets/types";
import * as dashboardsApi from "@/lib/api/dashboards";

// Database types
export type DashboardRow = Tables<"dashboards">;
export type DashboardInsert = TablesInsert<"dashboards">;
export type DashboardUpdate = TablesUpdate<"dashboards">;

// Frontend types
export interface MetricConfig {
  metricType:
    | "generated-actions"
    | "generated-recommendations"
    | "worst-performing-domain"
    | "high-risk-areas"
    | "assessment-activity";
  title: string;
  description?: string; // Footer description
  value: number | string; // Main metric value
  trend?: number; // Percentage change (e.g., +15, -5)
  status?: "up" | "down" | "neutral"; // Trend direction
  badges?: Array<{
    text: string;
    color?: string;
    borderColor?: string;
    icon?: string;
  }>; // Action/status badges
  secondaryMetrics?: Array<{
    value: number | string;
    label: string;
    icon?: string;
  }>;
  subtitle?: string; // Text after main value
  phaseBadge?: {
    text: string;
    color?: string;
    borderColor?: string;
    icon?: string;
  }; // Like "discover", "improve", "monitor"
}

// Configuration for action and activity widgets
export interface EntityConfig {
  entityType: "interviews" | "assessments" | "programs";
}

export interface TableConfig {
  entityType: "actions" | "recommendations" | "comments";
}

export interface ScopeConfig {
  assessmentId?: number;
  programId?: number;
  interviewId?: number;
}

// Generic widget configuration interface
export interface WidgetConfig {
  title?: string;
  metric?: MetricConfig;
  entity?: EntityConfig;
  table?: TableConfig;
  scope?: ScopeConfig;
  // Future widget configs can be added here
  // chart?: ChartConfig;
}

export interface DashboardItem {
  id: string;
  widgetType: WidgetType;
  config: WidgetConfig;
}

export interface Dashboard {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  widgets: DashboardItem[];
  layout: Layout[];
  companyId: string;
  createdBy: string;
}

export interface CreateDashboardInput {
  name: string;
  widgets: DashboardItem[];
  layout: Layout[];
}

const createDefaultDashboard = (): CreateDashboardInput => ({
  name: "My Dashboard",
  widgets: [],
  layout: [],
});

// Query key factory for cache management
export const dashboardLayoutKeys = {
  all: ["dashboard-layouts"] as const,
  lists: () => [...dashboardLayoutKeys.all, "list"] as const,
  list: (companyId: string) =>
    [...dashboardLayoutKeys.lists(), companyId] as const,
  detail: (id: number) => [...dashboardLayoutKeys.all, "detail", id] as const,
};

// Transform API response to frontend type
function transformDashboard(row: dashboardsApi.Dashboard): Dashboard {
  return {
    id: row.id,
    name: row.name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    widgets: (row.widgets as unknown as DashboardItem[]) || [],
    layout: (row.layout as unknown as Layout[]) || [],
    companyId: row.company_id,
    createdBy: row.created_by,
  };
}

/**
 * Hook to fetch all dashboards for a company
 */
export function useDashboards(companyId?: string) {
  return useQuery({
    queryKey: companyId ? dashboardLayoutKeys.list(companyId) : [],
    queryFn: async () => {
      if (!companyId) return [];

      const data = await dashboardsApi.getDashboards(companyId);
      return data.map(transformDashboard);
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single dashboard
 */
export function useDashboard(dashboardId?: number, companyId?: string) {
  return useQuery({
    queryKey: dashboardId ? dashboardLayoutKeys.detail(dashboardId) : [],
    queryFn: async () => {
      if (!dashboardId || !companyId) return null;

      const data = await dashboardsApi.getDashboardById(companyId, dashboardId);
      return data ? transformDashboard(data) : null;
    },
    enabled: !!dashboardId && !!companyId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for dashboard CRUD operations with optimistic updates
 */
export function useDashboardActions() {
  const queryClient = useQueryClient();
  const { data: currentCompany } = useCurrentCompany();

  const createMutation = useMutation({
    mutationFn: async (dashboard: CreateDashboardInput) => {
      if (!currentCompany?.id) throw new Error("No company selected");

      const data = await dashboardsApi.createDashboard(
        currentCompany.id,
        dashboard
      );

      return transformDashboard(data);
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

      const updateInput: dashboardsApi.UpdateDashboardInput = {};
      if (updates.name !== undefined) updateInput.name = updates.name;
      if (updates.layout !== undefined) updateInput.layout = updates.layout;
      if (updates.widgets !== undefined) updateInput.widgets = updates.widgets;

      const data = await dashboardsApi.updateDashboard(
        currentCompany.id,
        dashboardId,
        updateInput
      );

      return transformDashboard(data);
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
    widgets: DashboardItem[]
  ) => {
    console.log("updating widgets", widgets);
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
