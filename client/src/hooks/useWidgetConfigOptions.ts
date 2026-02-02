import { useQuery } from "@tanstack/react-query";
import { useCurrentCompany } from "@/hooks/useCompany";
import * as dashboardsApi from "@/lib/api/dashboards";

export function useWidgetConfigOptions() {
  const { data: currentCompany } = useCurrentCompany();
  const companyId = currentCompany?.id;

  return useQuery({
    queryKey: ["widget-config-options", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("No company selected");
      return dashboardsApi.getWidgetConfigOptions(companyId);
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
