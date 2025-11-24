import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getInterviewResponseActions,
  addInterviewResponseAction,
  updateInterviewResponseAction,
  deleteInterviewResponseAction,
} from "@/lib/api/interviews";
import type { GetInterviewResponseActionsResponseData } from "@/types/api/interviews";

export function useResponseActions(responseId: number) {
  const queryClient = useQueryClient();

  // Fetch actions for this response
  const {
    data: actions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["interview-response-actions", responseId],
    queryFn: (): Promise<GetInterviewResponseActionsResponseData> =>
      getInterviewResponseActions(responseId),
    enabled: !!responseId,
  });

  // Add action mutation
  const addMutation = useMutation({
    mutationFn: (action: { title?: string; description: string }) =>
      addInterviewResponseAction(responseId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interview-response-actions", responseId],
      });
      toast.success("Action added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add action");
    },
  });

  // Update action mutation
  const updateMutation = useMutation({
    mutationFn: ({
      actionId,
      action,
    }: {
      actionId: number;
      action: { title?: string; description?: string };
    }) => updateInterviewResponseAction(responseId, actionId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interview-response-actions", responseId],
      });
      toast.success("Action updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update action");
    },
  });

  // Delete action mutation
  const deleteMutation = useMutation({
    mutationFn: (actionId: number) =>
      deleteInterviewResponseAction(responseId, actionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interview-response-actions", responseId],
      });
      toast.success("Action deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete action");
    },
  });

  return {
    // Data
    actions,
    isLoading,
    error: error as Error | null,

    // Mutations
    addAction: addMutation.mutateAsync,
    updateAction: (
      actionId: number,
      action: { title?: string; description?: string }
    ) => updateMutation.mutateAsync({ actionId, action }),
    deleteAction: deleteMutation.mutateAsync,

    // Mutation states
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
