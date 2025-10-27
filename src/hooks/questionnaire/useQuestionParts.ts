import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createQuestionPart,
  deleteQuestionPart,
  duplicateQuestionPart,
  //   getRatingScales,
  //   createRatingScale,
  //   createRatingScalesBatch,
  //   updateRatingScale,
  //   deleteRatingScale,
  getQuestionParts,
  reorderQuestionParts,
  updateQuestionPart,
  updateQuestionRatingScaleMapping,
} from "@/lib/api/questionnaires";
import type {
  QuestionnaireRatingScale,
  //   CreateQuestionnaireRatingScaleData,
  //   UpdateQuestionnaireRatingScaleData,
  //   QuestionnaireWithStructure,
} from "@/types/assessment";

// Query key factory for question parts
export const questionPartsKeys = {
  all: ["question", "parts"] as const,
  byQuestionId: (id: number) => [...questionPartsKeys.all, id] as const,
};

// Hook for question parts with lazy loading
export function useQuestionParts(questionId: number, enabled = true) {
  return useQuery({
    queryKey: questionPartsKeys.byQuestionId(questionId),
    queryFn: (): Promise<any[]> => getQuestionParts(questionId),
    staleTime: 10 * 60 * 1000, // 10 minutes - question parts don't change often
    enabled: enabled && !!questionId,
  });
}

// Question parts mutation hooks
export function useQuestionPartsActions(questionId: number) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (partData: any) => createQuestionPart(questionId, partData),
    onSuccess: (newPart) => {
      // Update the question parts cache
      queryClient.setQueryData(
        questionPartsKeys.byQuestionId(questionId),
        (old: any[] = []) => [...old, newPart]
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ partId, updates }: { partId: number; updates: any }) =>
      updateQuestionPart(questionId, partId, updates),
    onSuccess: (updatedQuestionPart, { partId }) => {
      // Update the question parts cache
      queryClient.setQueryData(
        questionPartsKeys.byQuestionId(questionId),
        (old: any[] = []) =>
          old.map((part) => (part.id === partId ? updatedQuestionPart : part))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (partId: number) => deleteQuestionPart(questionId, partId),
    onSuccess: (_, partId) => {
      // Update the question parts cache
      queryClient.setQueryData(
        questionPartsKeys.byQuestionId(questionId),
        (old: any[] = []) => old.filter((part) => part.id !== partId)
      );
    },
  });

  const duplicatePartMutation = useMutation({
    mutationFn: (partId: number) => duplicateQuestionPart(questionId, partId),
    onSuccess: (newPart) => {
      console.log("Duplicated part:", newPart);
      // Update the question parts cache
      queryClient.setQueryData(
        questionPartsKeys.byQuestionId(questionId),
        (old: any[] = []) => [...old, newPart]
      );
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
    mutationFn: (ratingScaleMapping: Record<string, unknown>) =>
      updateQuestionRatingScaleMapping(questionId, ratingScaleMapping),
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
