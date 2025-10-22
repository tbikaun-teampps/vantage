import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

interface InterviewProgress {
  status: "pending" | "in_progress" | "completed";
  previous_status?: "pending" | "in_progress" | "completed";
  total_questions: number;
  answered_questions: number;
  progress_percentage: number;
  responses: Record<
    number,
    {
      id: number;
      rating_score: number | null;
      is_applicable: boolean;
      has_roles: boolean;
      is_unknown: boolean;
    }
  >;
}

export function useInterviewProgress(interviewId: number) {
  return useQuery<InterviewProgress>({
    queryKey: ["interviews", interviewId, "progress"],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: InterviewProgress;
      }>(`/interviews/${interviewId}/progress`);
      return response.data.data; // Extract data from { success, data } wrapper
    },
    staleTime: 30 * 1000, // 30 seconds - updated frequently during interview
    enabled: !!interviewId,
  });
}
