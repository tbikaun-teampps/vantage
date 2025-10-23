import { useQuery } from "@tanstack/react-query";
import { getCompanyInterviewResponseActions } from "@/lib/api/companies";

// Query key factory for cache management
const actionsKeys = {
  all: ["actions"] as const,
  lists: () => [...actionsKeys.all, "list"] as const,
  list: (companyId: string) => [...actionsKeys.lists(), companyId] as const,
};

// Data fetching hook for all actions
export function useActions(companyId: string) {
  return useQuery({
    queryKey: actionsKeys.list(companyId),
    queryFn: () => getCompanyInterviewResponseActions(companyId),
    staleTime: 2 * 60 * 1000, // 2 minutes - moderate changes during action management
    enabled: !!companyId,
  });
}
