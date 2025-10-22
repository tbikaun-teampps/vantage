import type { WidgetType } from "@/components/dashboard/widgets/types";
import { useCompanyFromUrl } from "../useCompanyFromUrl";
import { useQuery } from "@tanstack/react-query";
import { getMetricData, getActivityData, getActionsData, getTableData } from "@/lib/api/widgets";
import type { WidgetConfig } from "../useDashboardLayouts";

export { useMetricData } from "./useMetricData";
export { useTableData } from "./useTableData";

function hasValidConfig(config: WidgetConfig | undefined): boolean {
  if (!config || Object.keys(config).length === 0) return false;
  // Could add more specific validation per widget type if needed
  return true;
}

export function useWidgetData(widgetType: WidgetType, config: WidgetConfig) {
  const companyId = useCompanyFromUrl();
  const isConfigured = hasValidConfig(config);

  if (!companyId) {
    throw new Error("Company ID is required to fetch widget data");
  }

  console.log("fetching widget data:", { widgetType, config, companyId });

  const metricQuery = useQuery({
    queryKey: ["widget", "metric", config, companyId],
    queryFn: async () => {
      console.log("Query function starting");
      try {
        if (!config?.metric?.metricType) {
          throw new Error("Metric type is required");
        }
        const result = await getMetricData(companyId, config.metric.metricType, config.metric.title);
        console.log("Query function completed:", result);
        return result;
      } catch (error) {
        console.log("Query function error:", error);
        throw error;
      }
    },
    enabled: widgetType === "metric" && isConfigured && !!companyId && !!config?.metric?.metricType,
    retry: false, // Disable retries to see errors faster,
  });

  const activityQuery = useQuery({
    queryKey: ["widget", "activity", config, companyId],
    queryFn: () => {
      if (!config?.entity?.entityType) {
        throw new Error("Entity type is required");
      }
      const entityType = config.entity.entityType as "interviews" | "assessments" | "programs";
      return getActivityData(companyId, entityType);
    },
    enabled: widgetType === "activity" && isConfigured && !!companyId && !!config?.entity?.entityType,
  });

  const actionsQuery = useQuery({
    queryKey: ["widget", "actions", config, companyId],
    queryFn: () => getActionsData(companyId),
    enabled: widgetType === "actions" && isConfigured && !!companyId,
  });

  const tableQuery = useQuery({
    queryKey: ["widget", "table", config, companyId],
    queryFn: () => {
      if (!config?.table?.entityType) {
        throw new Error("Table entity type is required");
      }
      const entityType = config.table.entityType as "actions" | "recommendations" | "comments";
      return getTableData(
        companyId,
        entityType,
        config.scope?.assessmentId,
        config.scope?.programId
      );
    },
    enabled: widgetType === "table" && isConfigured && !!companyId && !!config?.table?.entityType,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Return the appropriate query result based on widgetType;
  switch (widgetType) {
    case "metric":
      return metricQuery;
    case "activity":
      return activityQuery;
    case "table":
      return tableQuery;
    case "actions":
      return actionsQuery;
    default:
      throw new Error(`Unsupported widget type: ${widgetType}`);
  }
}
