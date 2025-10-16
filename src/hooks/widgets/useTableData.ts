import { useQuery } from "@tanstack/react-query";
import type { WidgetConfig } from "@/hooks/useDashboardLayouts";
import { getTableData } from "@/lib/api/widgets";
import { useCompanyFromUrl } from "../useCompanyFromUrl";

export function useTableData(config?: WidgetConfig) {
  const companyId = useCompanyFromUrl();
  return useQuery({
    queryKey: ["widget", "table", config, companyId],
    queryFn: async () => {
      if (!config?.table?.entityType || !companyId) {
        throw new Error("Table config and companyId are required");
      }
      const entityType = config.table.entityType as "actions" | "recommendations" | "comments";
      return await getTableData(
        companyId,
        entityType,
        config.scope?.assessmentId,
        config.scope?.programId
      );
    },
    enabled: !!config?.table?.entityType && !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
