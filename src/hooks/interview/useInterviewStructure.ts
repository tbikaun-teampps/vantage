import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

interface InterviewStructure {
  interview: {
    id: number;
    name: string;
    questionnaire_id: number;
    assessment_id: number;
    is_individual: boolean;
  };
  sections: Array<{
    id: number;
    title: string;
    order_index: number;
    steps: Array<{
      id: number;
      title: string;
      order_index: number;
      questions: Array<{
        id: number;
        title: string;
        order_index: number;
      }>;
    }>;
  }>;
}

export function useInterviewStructure(interviewId: number) {
  return useQuery<InterviewStructure>({
    queryKey: ["interviews", interviewId, "structure"],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: InterviewStructure }>(
        `/interviews/${interviewId}/structure`
      );
      return response.data.data; // Extract data from { success, data } wrapper
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - structure rarely changes
    enabled: !!interviewId,
  });
}
