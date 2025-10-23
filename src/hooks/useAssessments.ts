import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AssessmentWithCounts,
  AssessmentWithQuestionnaire,
  AssessmentFilters,
} from "@/types/assessment";
import type { UpdateInput } from "@/types";
import {
  getAssessmentById,
  getAssessments,
  createAssessment as createAssessmentApi,
  updateAssessment as updateAssessmentApi,
  deleteAssessment as deleteAssessmentApi,
  duplicateAssessment as duplicateAssessmentApi,
} from "@/lib/api/assessments";
import { getQuestionnaires } from "@/lib/api/questionnaires";

// Query key factory for assessments
const assessmentKeys = {
  all: ["assessments"] as const,
  lists: () => [...assessmentKeys.all, "list"] as const,
  list: (companyId: string, filters?: AssessmentFilters) =>
    [...assessmentKeys.lists(), { companyId, filters }] as const,
  details: () => [...assessmentKeys.all, "detail"] as const,
  detail: (id: number) => [...assessmentKeys.details(), id] as const,
  questionnaires: (companyId: string) =>
    [...assessmentKeys.all, "questionnaires", companyId] as const,
};

// Hook to fetch assessments with optional filtering
export function useAssessments(companyId: string, filters?: AssessmentFilters) {
  return useQuery({
    queryKey: assessmentKeys.list(companyId, filters),
    queryFn: () => getAssessments(companyId, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes - assessment data changes moderately
    enabled: !!companyId, // Only run if companyId is provided
  });
}

// Hook to fetch a specific assessment by ID with questionnaire structure
export function useAssessmentById(id: number) {
  return useQuery({
    queryKey: assessmentKeys.detail(id),
    queryFn: () => getAssessmentById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id, // Only run if id is provided
  });
}

// Hook to fetch questionnaires for assessment creation
export function useQuestionnaires(companyId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: assessmentKeys.questionnaires(companyId),
    queryFn: () => getQuestionnaires(companyId),
    staleTime: 15 * 60 * 1000, // 15 minutes - questionnaires change infrequently
    enabled,
  });
}

// Hook for assessment mutations (create, update, delete, duplicate)
export function useAssessmentActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createAssessmentApi,
    onSuccess: (newAssessment) => {
      // Invalidate assessment lists that might include this new assessment
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });

      // Set the new assessment in detail cache
      queryClient.setQueryData(
        assessmentKeys.detail(newAssessment.id),
        newAssessment
      );
    },
    onError: (error) => {
      console.error("Failed to create assessment:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateInput<"assessments">;
    }) => updateAssessmentApi(id, data),
    onSuccess: (updatedAssessment, { id }) => {
      // Update the assessment in lists cache
      queryClient.setQueriesData(
        { queryKey: assessmentKeys.lists() },
        (oldData: AssessmentWithCounts[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((assessment) =>
            assessment.id === Number(id)
              ? {
                  ...assessment,
                  ...updatedAssessment,
                }
              : assessment
          );
        }
      );

      // Update the assessment in detail cache
      queryClient.setQueryData(
        assessmentKeys.detail(id),
        (oldData: AssessmentWithQuestionnaire | null | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, ...updatedAssessment };
        }
      );
    },
    onError: (error) => {
      console.error("Failed to update assessment:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAssessmentApi(id),
    onSuccess: (_, deletedId) => {
      // Remove from lists cache
      queryClient.setQueriesData(
        { queryKey: assessmentKeys.lists() },
        (oldData: AssessmentWithCounts[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter(
            (assessment) => assessment.id !== Number(deletedId)
          );
        }
      );

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: assessmentKeys.detail(deletedId) });
    },
    onError: (error) => {
      console.error("Failed to delete assessment:", error);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => duplicateAssessmentApi(id),
    onSuccess: (newAssessment) => {
      // Invalidate lists to show the new duplicated assessment
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });

      // Set the new assessment in detail cache
      queryClient.setQueryData(
        assessmentKeys.detail(newAssessment.id),
        newAssessment
      );
    },
    onError: (error) => {
      console.error("Failed to duplicate assessment:", error);
    },
  });

  return {
    // Actions
    createAssessment: createMutation.mutateAsync,
    updateAssessment: (id: number, data: UpdateInput<"assessments">) =>
      updateMutation.mutateAsync({ id, data }),
    deleteAssessment: deleteMutation.mutateAsync,
    duplicateAssessment: duplicateMutation.mutateAsync,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      duplicateMutation.isPending,

    // Error states
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    duplicateError: duplicateMutation.error,

    // Reset error states
    resetErrors: () => {
      createMutation.reset();
      updateMutation.reset();
      deleteMutation.reset();
      duplicateMutation.reset();
    },
  };
}
