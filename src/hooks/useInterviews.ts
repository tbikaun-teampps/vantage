import { useQuery } from "@tanstack/react-query";
import { getInterviews } from "@/lib/api/interviews";
import type {
  InterviewFilters,
} from "@/types/assessment";
import { getInterviewsByAssessmentId } from "@/lib/api/assessments";

// Query key factory for cache management
export const interviewKeys = {
  all: ["interviews"] as const,
  lists: () => [...interviewKeys.all, "list"] as const,
  list: (filters?: InterviewFilters) =>
    [...interviewKeys.lists(), { filters }] as const,
  details: () => [...interviewKeys.all, "detail"] as const,
  detail: (id: number) => [...interviewKeys.details(), id] as const,
  roles: () => [...interviewKeys.all, "roles"] as const,
  rolesByAssessment: (assessmentId: number) =>
    [...interviewKeys.roles(), assessmentId] as const,
};

// Data fetching hooks
export function useInterviews(companyId: string, filters?: InterviewFilters) {
  return useQuery({
    queryKey: interviewKeys.list(filters),
    queryFn: () => getInterviews(companyId, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - moderate changes during interview management
    enabled: !!companyId,
  });
}

export function useInterviewsByAssessment(assessmentId: number) {
  const filters: InterviewFilters = { assessment_id: assessmentId };
  return useQuery({
    queryKey: interviewKeys.list(filters),
    queryFn: () => getInterviewsByAssessmentId(assessmentId),
    staleTime: 2 * 60 * 1000,
    enabled: !!assessmentId,
  });
}