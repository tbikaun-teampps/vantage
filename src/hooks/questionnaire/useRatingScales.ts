import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRatingScales,
  createRatingScale,
  createRatingScalesBatch,
  updateRatingScale,
  deleteRatingScale,
} from "@/lib/api/questionnaires";
import { questionsKeys } from "./useQuestions";
import type {
  BatchCreateQuestionnaireRatingScalesBodyData,
  CreateQuestionnaireRatingScaleBodyData,
  GetQuestionnaireByIdResponseData,
  GetQuestionnaireRatingScalesResponseData,
  UpdateRatingScaleBodyData,
} from "@/types/api/questionnaire";
import { questionnaireKeys } from "../useQuestionnaires";
import { toast } from "sonner";

// Query key factory for rating scales
const ratingScalesKeys = {
  all: ["questionnaire", "rating-scales"] as const,
  byQuestionnaire: (id: number) => [...ratingScalesKeys.all, id] as const,
};

// Hook for rating scales with lazy loading
function useQuestionnaireRatingScales(questionnaireId: number, enabled = true) {
  return useQuery({
    queryKey: ratingScalesKeys.byQuestionnaire(questionnaireId),
    queryFn: (): Promise<GetQuestionnaireRatingScalesResponseData> =>
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
      ratingData: CreateQuestionnaireRatingScaleBodyData;
    }) => createRatingScale(questionnaireId, ratingData),
    onSuccess: (newRatingScale) => {
      // Update the rating scales cache
      queryClient.setQueryData(
        ratingScalesKeys.byQuestionnaire(questionnaireId),
        (old: GetQuestionnaireRatingScalesResponseData = []) => [
          ...old,
          newRatingScale,
        ]
      );

      // Update questionnaire detail cache if it exists
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: GetQuestionnaireByIdResponseData) => {
          if (!old || old.id !== questionnaireId) return old;
          return {
            ...old,
            questionnaire_rating_scales: [
              ...(old.questionnaire_rating_scales || []),
              newRatingScale,
            ],
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
      updates: UpdateRatingScaleBodyData;
    }) => updateRatingScale(id, updates),
    onSuccess: (updatedRatingScale, { id }) => {
      // Update the rating scales cache
      queryClient.setQueryData(
        ratingScalesKeys.byQuestionnaire(questionnaireId),
        (old: GetQuestionnaireRatingScalesResponseData = []) =>
          old.map((scale) => (scale.id === id ? updatedRatingScale : scale))
      );

      // Update questionnaire detail cache if it exists
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: GetQuestionnaireByIdResponseData) => {
          if (!old || old.id !== questionnaireId) return null;
          return {
            ...old,
            questionnaire_rating_scales: (
              old.questionnaire_rating_scales || []
            ).map((scale) => (scale.id === id ? updatedRatingScale : scale)),
          };
        }
      );

      // Invalidate questions cache to ensure questions tab reflects rating scale update
      queryClient.invalidateQueries({
        queryKey: questionsKeys.all,
      });
    },
    onError: (error) => {
      console.error("Error updating rating scale:", error);
      toast.error("Failed to update rating scale. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRatingScale(id),
    onSuccess: (_, id) => {
      // Update the rating scales cache
      queryClient.setQueryData(
        ratingScalesKeys.byQuestionnaire(questionnaireId),
        (old: GetQuestionnaireRatingScalesResponseData = []) =>
          old.filter((scale) => scale.id !== id)
      );

      // Update questionnaire detail cache if it exists
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: GetQuestionnaireByIdResponseData) => {
          if (!old || old.id !== questionnaireId) return null;
          return {
            ...old,
            questionnaire_rating_scales: (
              old.questionnaire_rating_scales || []
            ).filter((scale) => scale.id !== id),
          };
        }
      );

      // Invalidate questions cache to ensure questions tab reflects rating scale deletion
      queryClient.invalidateQueries({
        queryKey: questionsKeys.all,
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete rating scale.");
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: (data: BatchCreateQuestionnaireRatingScalesBodyData) =>
      createRatingScalesBatch(questionnaireId, data),
    onSuccess: (newRatingScales) => {
      // Update the rating scales cache
      queryClient.setQueryData(
        ratingScalesKeys.byQuestionnaire(questionnaireId),
        (old: GetQuestionnaireRatingScalesResponseData = []) => [
          ...old,
          ...newRatingScales,
        ]
      );

      // Update questionnaire detail cache if it exists
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.details() },
        (old: GetQuestionnaireByIdResponseData) => {
          if (!old || old.id !== questionnaireId) return old;
          return {
            ...old,
            questionnaire_rating_scales: [
              ...(old.questionnaire_rating_scales || []),
              ...newRatingScales,
            ],
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
