import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createQuestionPart,
  deleteQuestionPart,
  duplicateQuestionPart,
  getQuestionParts,
  getQuestionRatingScaleMapping,
  reorderQuestionParts,
  updateQuestionPart,
  updateQuestionRatingScaleMapping,
} from "@/lib/api/questionnaires";
import type {
  CreateQuestionPartBodyData,
  GetQuestionPartsResponseData,
  UpdateQuestionPartBodyData,
  UpdateQuestionRatingScaleMappingBodyData,
} from "@/types/api/questionnaire";

// Query key factory for question parts
const questionPartsKeys = {
  all: ["question", "parts"] as const,
  byQuestionId: (id: number) => [...questionPartsKeys.all, id] as const,
};

// Hook for question parts with lazy loading
export function useQuestionParts(questionId: number, enabled = true) {
  return useQuery({
    queryKey: questionPartsKeys.byQuestionId(questionId),
    queryFn: (): Promise<GetQuestionPartsResponseData> =>
      getQuestionParts(questionId),
    staleTime: 10 * 60 * 1000, // 10 minutes - question parts don't change often
    enabled: enabled && !!questionId,
  });
}

export function useQuestionRatingScaleMapping(
  questionId: number,
  enabled = true
) {
  return useQuery({
    queryKey: ["question", "ratingScaleMapping", questionId],
    queryFn: () => getQuestionRatingScaleMapping(questionId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: enabled && !!questionId,
  });
}

// Question parts mutation hooks
export function useQuestionPartsActions(questionId: number) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (partData: CreateQuestionPartBodyData) =>
      createQuestionPart(questionId, partData),
    onSuccess: (newPart) => {
      // Update the question parts cache
      queryClient.setQueryData(
        questionPartsKeys.byQuestionId(questionId),
        (old: GetQuestionPartsResponseData = []) => [...old, newPart]
      );
      // Invalidate rating scale mapping since server auto-creates defaults
      queryClient.invalidateQueries({
        queryKey: ["question", "ratingScaleMapping", questionId],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      partId,
      updates,
    }: {
      partId: number;
      updates: UpdateQuestionPartBodyData;
    }) => updateQuestionPart(questionId, partId, updates),
    onSuccess: (updatedQuestionPart, { partId }) => {
      // Update the question parts cache
      queryClient.setQueryData(
        questionPartsKeys.byQuestionId(questionId),
        (old: GetQuestionPartsResponseData = []) =>
          old.map((part) => (part.id === partId ? updatedQuestionPart : part))
      );
      // Invalidate rating scale mapping in case answer_type or options changed
      queryClient.invalidateQueries({
        queryKey: ["question", "ratingScaleMapping", questionId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (partId: number) => deleteQuestionPart(questionId, partId),
    onSuccess: (_, partId) => {
      // Update the question parts cache
      queryClient.setQueryData(
        questionPartsKeys.byQuestionId(questionId),
        (old: GetQuestionPartsResponseData = []) =>
          old.filter((part) => part.id !== partId)
      );
      // Invalidate rating scale mapping since server removes orphaned entries
      queryClient.invalidateQueries({
        queryKey: ["question", "ratingScaleMapping", questionId],
      });
    },
  });

  const duplicatePartMutation = useMutation({
    mutationFn: (partId: number) => duplicateQuestionPart(questionId, partId),
    onSuccess: (newPart) => {
      console.log("Duplicated part:", newPart);
      // Update the question parts cache
      queryClient.setQueryData(
        questionPartsKeys.byQuestionId(questionId),
        (old: GetQuestionPartsResponseData = []) => [...old, newPart]
      );
      // Invalidate rating scale mapping since server copies/creates scoring config
      queryClient.invalidateQueries({
        queryKey: ["question", "ratingScaleMapping", questionId],
      });
    },
  });

  const reorderPartsMutation = useMutation({
    mutationFn: (partIdsInOrder: number[]) =>
      reorderQuestionParts(questionId, partIdsInOrder),
    onSuccess: () => {
      // Invalidate the question parts query to refetch the updated order
      queryClient.invalidateQueries({
        queryKey: questionPartsKeys.byQuestionId(questionId),
      });
    },
  });

  const updateMappingMutation = useMutation({
    mutationFn: (data: UpdateQuestionRatingScaleMappingBodyData) =>
      updateQuestionRatingScaleMapping(questionId, data),
    onSuccess: () => {
      // Invalidate the question parts query to refetch with new mappings
      queryClient.invalidateQueries({
        queryKey: questionPartsKeys.byQuestionId(questionId),
      });
    },
  });

  return {
    createQuestionPart: createMutation.mutateAsync,
    isCreatingQuestionPart: createMutation.isPending,
    createQuestionPartError: createMutation.error,

    reorderQuestionParts: reorderPartsMutation.mutateAsync,
    isReorderingQuestionParts: reorderPartsMutation.isPending,
    reorderQuestionPartsError: reorderPartsMutation.error,

    updateQuestionPart: updateMutation.mutateAsync,
    isUpdatingQuestionPart: updateMutation.isPending,
    updateQuestionPartError: updateMutation.error,

    deleteQuestionPart: deleteMutation.mutateAsync,
    isDeletingQuestionPart: deleteMutation.isPending,
    deleteQuestionPartError: deleteMutation.error,

    duplicateQuestionPart: duplicatePartMutation.mutateAsync,
    isDuplicatingQuestionPart: duplicatePartMutation.isPending,
    duplicateQuestionPartError: duplicatePartMutation.error,

    updateQuestionRatingScaleMapping: updateMappingMutation.mutateAsync,
    isUpdatingQuestionRatingScaleMapping: updateMappingMutation.isPending,
    updateQuestionRatingScaleMappingError: updateMappingMutation.error,
  };
}
