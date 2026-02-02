import { useQuery } from "@tanstack/react-query";
import { getInterviewSummary } from "@/lib/api/interviews";
import type { GetInterviewSummaryResponseData } from "@/types/api/interviews";

export function useInterviewSummary(interviewId: number) {
  return useQuery<GetInterviewSummaryResponseData>({
    queryKey: ["interview-summary", interviewId],
    queryFn: (): Promise<GetInterviewSummaryResponseData> =>
      getInterviewSummary(interviewId),
    staleTime: 30 * 1000, // 30 seconds - metadata changes infrequently
    enabled: !!interviewId,
  });
}
