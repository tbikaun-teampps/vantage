import { useQuery } from "@tanstack/react-query";
import { getInterviews } from "@/lib/api/interviews";
import { getInterviewsByAssessmentId } from "@/lib/api/assessments";
import type {
  GetInterviewsParams,
  GetInterviewsResponseData,
} from "@/types/api/interviews";
import type { GetInterviewsByAssessmentIdResponseData } from "@/types/api/assessments";

// Query key factory for cache management
export const interviewKeys = {
  all: ["interviews"] as const,
  lists: () => [...interviewKeys.all, "list"] as const,
  list: (params?: Partial<GetInterviewsParams>) =>
    [...interviewKeys.lists(), { params }] as const,
  details: () => [...interviewKeys.all, "detail"] as const,
  detail: (id: number) => [...interviewKeys.details(), id] as const,
  roles: () => [...interviewKeys.all, "roles"] as const,
  rolesByAssessment: (assessmentId: number) =>
    [...interviewKeys.roles(), assessmentId] as const,
};

// Data fetching hooks
export function useInterviews(params: GetInterviewsParams) {
  return useQuery({
    queryKey: interviewKeys.list(params),
    queryFn: (): Promise<GetInterviewsResponseData> => getInterviews(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - moderate changes during interview management
    enabled: !!params.company_id,
  });
}

export function useInterviewsByAssessment(assessmentId: number) {
  return useQuery({
    queryKey: interviewKeys.list({ assessment_id: assessmentId }),
    queryFn: (): Promise<GetInterviewsByAssessmentIdResponseData> =>
      getInterviewsByAssessmentId(assessmentId),
    staleTime: 2 * 60 * 1000,
    enabled: !!assessmentId,
  });
}
