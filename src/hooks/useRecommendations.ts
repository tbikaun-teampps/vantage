import { useQuery } from "@tanstack/react-query";
import { getRecommendations } from "@/lib/api/recommendations";

// Query key factory for cache management
const recommendationsKeys = {
  all: ["recommendations"] as const,
  lists: () => [...recommendationsKeys.all, "list"] as const,
  list: (companyId: string) =>
    [...recommendationsKeys.lists(), companyId] as const,
  detail: (id: number) => [...recommendationsKeys.all, "detail", id] as const,
};

// Data fetching hook for all recommendations
export function useRecommendations(companyId: string) {
  return useQuery({
    queryKey: recommendationsKeys.list(companyId),
    queryFn: () => getRecommendations(companyId),
    staleTime: 2 * 60 * 1000, // 2 minutes - moderate changes during recommendation management
    enabled: !!companyId,
  });
}
