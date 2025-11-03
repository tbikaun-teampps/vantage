import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRatingScales,
  createRatingScale,
  createRatingScalesBatch,
  updateRatingScale,
  deleteRatingScale,
} from "@/lib/api/questionnaires";
import type {
  QuestionnaireRatingScale,
  CreateQuestionnaireRatingScaleData,
  UpdateQuestionnaireRatingScaleData,
  QuestionnaireWithStructure,
} from "@/types/assessment";
import { questionsKeys } from "./useQuestions";

// Query key factory for rating scales
export const ratingScalesKeys = {
  all: ["questionnaire", "rating-scales"] as const,
  byQuestionnaire: (id: number) => [...ratingScalesKeys.all, id] as const,
};

// Import questionnaire keys for cache invalidation
const questionnaireKeys = {
  all: ["questionnaires"] as const,
  details: () => [...questionnaireKeys.all, "detail"] as const,
  detail: (id: number) => [...questionnaireKeys.details(), id] as const,
};

// Hook for rating scales with lazy loading
export function useQuestionnaireRatingScales(
  questionnaireId: number,
  enabled = true
) {
  return useQuery({
    queryKey: ratingScalesKeys.byQuestionnaire(questionnaireId),
    queryFn: (): Promise<QuestionnaireRatingScale[]> =>
      getRatingScales(questionnaireId),
    staleTime: 10 * 60 * 1000, // 10 minutes - rating scales don't change often
    enabled: enabled && !!questionnaireId,
  });
}

// Rating scale mutation hooks
export function useRatingScaleActions(questionnaireId: number) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({
      questionnaireId,
      ratingData,
    }: {
      questionnaireId: number;
      ratingData: CreateQuestionnaireRatingScaleData;
    }) => createRatingScale(questionnaireId, ratingData),
    onSuccess: (newRatingScale) => {
      // Update the rating scales cache
      queryClient.setQueryData(
        ratingScalesKeys.byQuestionnaire(questionnaireId),
        (old: QuestionnaireRatingScale[] = []) => [...old, newRatingScale]
      );

      // Update questionnaire detail cache if it exists
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old || old.id !== questionnaireId) return old;
          return {
            ...old,
            questionnaire_rating_scales: [...(old.questionnaire_rating_scales || []), newRatingScale],
          };
        }
      );

      // Invalidate questions cache to ensure questions tab reflects rating scale addition
      queryClient.invalidateQueries({
        queryKey: questionsKeys.all,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: UpdateQuestionnaireRatingScaleData;
    }) => updateRatingScale(id, updates),
    onSuccess: (updatedRatingScale, { id }) => {
      // Update the rating scales cache
      queryClient.setQueryData(
        ratingScalesKeys.byQuestionnaire(questionnaireId),
        (old: QuestionnaireRatingScale[] = []) =>
          old.map((scale) => (scale.id === id ? updatedRatingScale : scale))
      );

      // Update questionnaire detail cache if it exists
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old || old.id !== questionnaireId) return null;
          return {
            ...old,
            questionnaire_rating_scales: (old.questionnaire_rating_scales || []).map((scale) =>
              scale.id === id ? updatedRatingScale : scale
            ),
          };
        }
      );

      // Invalidate questions cache to ensure questions tab reflects rating scale update
      queryClient.invalidateQueries({
        queryKey: questionsKeys.all,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRatingScale(id),
    onSuccess: (_, id) => {
      // Update the rating scales cache
      queryClient.setQueryData(
        ratingScalesKeys.byQuestionnaire(questionnaireId),
        (old: QuestionnaireRatingScale[] = []) =>
          old.filter((scale) => scale.id !== id)
      );

      // Update questionnaire detail cache if it exists
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old || old.id !== questionnaireId) return null;
          return {
            ...old,
            questionnaire_rating_scales: (old.questionnaire_rating_scales || []).filter(
              (scale) => scale.id !== id
            ),
          };
        }
      );

      // Invalidate questions cache to ensure questions tab reflects rating scale deletion
      queryClient.invalidateQueries({
        queryKey: questionsKeys.all,
      });
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: (scales: CreateQuestionnaireRatingScaleData[]) =>
      createRatingScalesBatch(questionnaireId, scales),
    onSuccess: (newRatingScales) => {
      // Update the rating scales cache
      queryClient.setQueryData(
        ratingScalesKeys.byQuestionnaire(questionnaireId),
        (old: QuestionnaireRatingScale[] = []) => [...old, ...newRatingScales]
      );

      // Update questionnaire detail cache if it exists
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: QuestionnaireWithStructure | null) => {
          if (!old || old.id !== questionnaireId) return old;
          return {
            ...old,
            questionnaire_rating_scales: [...(old.questionnaire_rating_scales || []), ...newRatingScales],
          };
        }
      );

      // Invalidate questions cache to ensure questions tab reflects rating scale addition
      queryClient.invalidateQueries({
        queryKey: questionsKeys.all,
      });
    },
  });

  return {
    createRatingScale: createMutation.mutateAsync,
    isCreatingRatingScale: createMutation.isPending,
    createRatingScaleError: createMutation.error,

    createRatingScalesBatch: createBatchMutation.mutateAsync,
    isCreatingRatingScalesBatch: createBatchMutation.isPending,
    createRatingScalesBatchError: createBatchMutation.error,

    updateRatingScale: updateMutation.mutateAsync,
    isUpdatingRatingScale: updateMutation.isPending,
    updateRatingScaleError: updateMutation.error,

    deleteRatingScale: deleteMutation.mutateAsync,
    isDeletingRatingScale: deleteMutation.isPending,
    deleteRatingScaleError: deleteMutation.error,
  };
}

// Hook specifically for the rating scales tab with lazy loading
export function useRatingScalesTab(questionnaireId: number, isActive = false) {
  const {
    data: ratingScales,
    isLoading,
    error,
    refetch,
  } = useQuestionnaireRatingScales(questionnaireId, isActive);

  // Get rating scale actions
  const actions = useRatingScaleActions(questionnaireId);

  // Calculate completion status
  const isComplete = ratingScales && ratingScales.length > 0;

  return {
    // Data
    ratingScales: ratingScales || [],
    isLoading,
    error,
    refetch,
    isComplete,

    // Actions
    ...actions,

    // For backwards compatibility with existing components
    ratings: ratingScales || [],
  };
}
