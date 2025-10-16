import { useQuery } from "@tanstack/react-query";
import type { WidgetConfig } from "@/hooks/useDashboardLayouts";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { getActivityData } from "@/lib/api/widgets";

export function useActivityData(config?: WidgetConfig) {
  const companyId = useCompanyFromUrl();

  return useQuery({
    queryKey: ["widget", "activity", config, companyId],
    queryFn: async () => {
      if (!config?.entity?.entityType || !companyId) {
        throw new Error("Entity config and companyId are required");
      }
      const entityType = config.entity.entityType as "interviews" | "assessments" | "programs";
      return await getActivityData(companyId, entityType);
    },
    enabled: !!config?.entity?.entityType && !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
