import { useQuery } from "@tanstack/react-query";
import { getTableData } from "@/lib/api/widgets";
import { useCompanyFromUrl } from "../useCompanyFromUrl";
import type { WidgetConfig } from "@/types/api/dashboard";

export function useTableData(config?: WidgetConfig) {
  const companyId = useCompanyFromUrl();
  return useQuery({
    queryKey: ["widget", "table", config, companyId],
    queryFn: async () => {
      if (!config?.table?.entityType || !companyId) {
        throw new Error("Table config and companyId are required");
      }
      const entityType = config.table.entityType as
        | "actions"
        | "recommendations"
        | "comments";
      return await getTableData(companyId, {
        entityType,
        assessmentId: config.scope?.assessmentId,
        programId: config.scope?.programId,
      });
    },
    enabled: !!config?.table?.entityType && !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
