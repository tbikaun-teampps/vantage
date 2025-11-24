import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/lib/api/auditlogs";

// Query key factory for audit logs cache management
const auditLogsKeys = {
  all: ["auditLogs"] as const,
  list: (companyId: string) => [...auditLogsKeys.all, companyId] as const,
};

/**
 * Hook to fetch audit logs for a company
 */
export function useAuditLogs(companyId: string) {
  return useQuery({
    queryKey: auditLogsKeys.list(companyId),
    queryFn: () => getAuditLogs(companyId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!companyId,
    refetchOnWindowFocus: true,
  });
}
