import { useQuery } from "@tanstack/react-query";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { getMetricData } from "@/lib/api/widgets";
import type { MetricWidgetConfig } from "@/types/api/dashboard";

export function useMetricData(config?: MetricWidgetConfig) {
  const companyId = useCompanyFromUrl();

  return useQuery({
    queryKey: ["widget", "metric", config, companyId],
    queryFn: async () => {
      if (!config || !companyId) {
        throw new Error("Config and companyId are required");
      }
      return await getMetricData(companyId, {
        metricType: config.metricType,
        title: config.title,
      });
    },
    enabled: !!config && !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
