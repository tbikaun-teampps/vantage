import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { GetInterviewStructureResponseData } from "@/types/api/interviews";

export function useInterviewStructure(interviewId: number) {
  return useQuery<GetInterviewStructureResponseData>({
    queryKey: ["interviews", interviewId, "structure"],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: GetInterviewStructureResponseData;
      }>(`/interviews/${interviewId}/structure`);
      return response.data.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - structure rarely changes
    enabled: !!interviewId,
  });
}
