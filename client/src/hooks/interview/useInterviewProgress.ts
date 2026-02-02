import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { GetInterviewProgressResponseData } from "@/types/api/interviews";

export function useInterviewProgress(interviewId: number) {
  return useQuery<GetInterviewProgressResponseData>({
    queryKey: ["interviews", interviewId, "progress"],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: GetInterviewProgressResponseData;
      }>(`/interviews/${interviewId}/progress`);
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds - updated frequently during interview
    enabled: !!interviewId,
  });
}
