import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getQuestionnaireById,
  getQuestionnaires,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
  duplicateQuestionnaire,
} from "@/lib/api/questionnaires";
import { settingsKeys } from "@/hooks/questionnaire/useSettings";
import { questionsKeys } from "@/hooks/questionnaire/useQuestions";
import type {
  CreateQuestionnaireBodyData,
  GetQuestionnaireByIdResponseData,
  GetQuestionnairesResponseData,
  UpdateQuestionnaireBodyData,
} from "@/types/api/questionnaire";

// Query key factory for cache management
export const questionnaireKeys = {
  all: ["questionnaires"] as const,
  lists: () => [...questionnaireKeys.all, "list"] as const,
  list: (filters?: string) =>
    [...questionnaireKeys.lists(), { filters }] as const,
  details: () => [...questionnaireKeys.all, "detail"] as const,
  detail: (id: number) => [...questionnaireKeys.details(), id] as const,
  roles: () => [...questionnaireKeys.all, "roles"] as const,
  sharedRoles: () => [...questionnaireKeys.all, "shared-roles"] as const,
  users: () => [...questionnaireKeys.all, "users"] as const,
  usage: (id: number) => [...questionnaireKeys.all, "usage", id] as const,
};

// Data fetching hooks
export function useQuestionnaires(companyId: string) {
  return useQuery({
    queryKey: questionnaireKeys.list(companyId),
    queryFn: (): Promise<GetQuestionnairesResponseData> =>
      getQuestionnaires(companyId),
    staleTime: 15 * 60 * 1000, // 15 minutes - slow-changing questionnaire data
  });
}

export function useQuestionnaireById(id: number) {
  return useQuery({
    queryKey: questionnaireKeys.detail(id),
    queryFn: (): Promise<GetQuestionnaireByIdResponseData> =>
      getQuestionnaireById(id),
    staleTime: 15 * 60 * 1000,
    enabled: !!id,
  });
}

// Mutation hooks with cache updates
export function useQuestionnaireActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateQuestionnaireBodyData) =>
      createQuestionnaire(data),
    onSuccess: (newQuestionnaire) => {
      // Add to questionnaires list
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.lists() },
        (old: GetQuestionnairesResponseData = []) => {
          const newWithCounts = {
            ...newQuestionnaire,
            section_count: 0,
            step_count: 0,
            question_count: 0,
          };
          return [newWithCounts, ...old];
        }
      );

      // Invalidate to get fresh data with counts
      queryClient.invalidateQueries({ queryKey: questionnaireKeys.lists() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: UpdateQuestionnaireBodyData;
    }) => updateQuestionnaire(id, updates),
    onSuccess: (updatedQuestionnaire, { id }) => {
      // Update questionnaire list
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.lists() },
        (old: GetQuestionnairesResponseData = []) =>
          old.map((q) => (q.id === id ? { ...q, ...updatedQuestionnaire } : q))
      );

      // Update questionnaire detail
      queryClient.setQueryData(
        questionnaireKeys.detail(id),
        (old: GetQuestionnaireByIdResponseData | null) =>
          old ? { ...old, ...updatedQuestionnaire } : null
      );

      // Update settings tab cache (used by the settings form)
      queryClient.setQueryData(
        settingsKeys.basic(id),
        (old: GetQuestionnaireByIdResponseData | null) =>
          old ? { ...old, ...updatedQuestionnaire } : null
      );

      // Invalidate all related queries to ensure UI updates everywhere
      queryClient.invalidateQueries({ queryKey: questionnaireKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.basic(id) });
      queryClient.invalidateQueries({ queryKey: questionsKeys.structure(id) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteQuestionnaire(id),
    onSuccess: (_, id) => {
      // Remove from questionnaires list
      queryClient.setQueriesData(
        { queryKey: questionnaireKeys.lists() },
        (old: GetQuestionnairesResponseData = []) =>
          old.filter((q) => q.id !== id)
      );

      // Remove questionnaire detail
      queryClient.removeQueries({ queryKey: questionnaireKeys.detail(id) });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => duplicateQuestionnaire(id),
    onSuccess: () => {
      // Refresh questionnaires list to get the new duplicate
      queryClient.invalidateQueries({ queryKey: questionnaireKeys.lists() });
    },
  });

  return {
    createQuestionnaire: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    updateQuestionnaire: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deleteQuestionnaire: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    duplicateQuestionnaire: duplicateMutation.mutateAsync,
    isDuplicating: duplicateMutation.isPending,
    duplicateError: duplicateMutation.error,
  };
}
