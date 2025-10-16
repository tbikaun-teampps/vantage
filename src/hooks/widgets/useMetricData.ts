import { useQuery } from "@tanstack/react-query";
import type { MetricConfig } from "@/hooks/useDashboardLayouts";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { getMetricData } from "@/lib/api/widgets";

export function useMetricData(config?: MetricConfig) {
  const companyId = useCompanyFromUrl();

  return useQuery({
    queryKey: ['widget', 'metric', config, companyId],
    queryFn: async () => {
      if (!config || !companyId) {
        throw new Error("Config and companyId are required");
      }
      return await getMetricData(companyId, config.metricType, config.title);
    },
    enabled: !!config && !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}