import {
  createInterview,
  createIndividualInterviews,
  deleteInterview,
  updateInterview,
} from "@/lib/api/interviews";
import type {
  CreateInterviewData,
  InterviewWithResponses,
  UpdateInterviewData,
} from "@/types/assessment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { interviewKeys } from "../useInterviews";

// Interview CRUD operations
export function useInterviewActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateInterviewData) => {
      return createInterview(data);
    },
    onSuccess: () => {
      // Invalidate relevant interview lists - let them refetch fresh data
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
    },
  });

  const createIndividualInterviewsMutation = useMutation({
    mutationFn: (data: any) => {
      return createIndividualInterviews(data);
    },
    onSuccess: () => {
      // Invalidate relevant interview lists - let them refetch fresh data
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: UpdateInterviewData;
    }) => {
      return updateInterview(id, updates);
    },
    onSuccess: async (_, { id, updates }) => {
      // Invalidate the interview summary
      queryClient.invalidateQueries({ queryKey: ["interview-summary", id] });
      // Invalidate and refetch the specific interview detail
      queryClient.invalidateQueries({ queryKey: interviewKeys.detail(id) });

      // Update cache optimistically in lists
      queryClient.setQueriesData(
        { queryKey: interviewKeys.lists() },
        (old: InterviewWithResponses[] | undefined) => {
          if (!old) return old;
          return old.map((interview) =>
            interview.id === id ? { ...interview, ...updates } : interview
          );
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteInterview(id),
    onSuccess: (_, id) => {
      // Remove from all lists
      queryClient.setQueriesData(
        { queryKey: interviewKeys.lists() },
        (old: InterviewWithResponses[] | undefined) => {
          if (!old) return old;
          return old.filter((interview) => interview.id !== id);
        }
      );

      // Remove summary query
      queryClient.removeQueries({ queryKey: ["interview-summary", id] });
      // Remove detail query
      queryClient.removeQueries({ queryKey: interviewKeys.detail(id) });
    },
  });

  return {
    createInterview: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,

    createIndividualInterviews: createIndividualInterviewsMutation.mutateAsync,
    isCreatingIndividual: createIndividualInterviewsMutation.isPending,
    createIndividualError: createIndividualInterviewsMutation.error,

    updateInterview: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,

    deleteInterview: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}
