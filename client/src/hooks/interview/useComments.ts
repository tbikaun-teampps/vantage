import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getInterviewResponseComments,
  updateInterviewResponseComments,
} from "@/lib/api/interviews";
import type { UpdateInterviewResponseCommentBodyData } from "@/types/api/interviews";

export function useComments(responseId: number) {
  const queryClient = useQueryClient();

  // Fetch comments for this response
  const {
    data: comments = "",
    isLoading,
    error,
  } = useQuery({
    queryKey: ["interview-response-comments", responseId],
    queryFn: () => getInterviewResponseComments(responseId),
    enabled: !!responseId,
  });

  // Update comment mutation
  const updateMutation = useMutation({
    mutationFn: (update: UpdateInterviewResponseCommentBodyData) =>
      updateInterviewResponseComments(responseId, update),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interview-response-comments", responseId],
      });
      toast.success("Comments updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update comment");
    },
  });

  return {
    // Data
    comments,
    isLoading,
    error: error as Error | null,

    // Mutations
    updateComments: (comments: string) =>
      updateMutation.mutateAsync({ comments }),

    // Mutation states
    isUpdating: updateMutation.isPending,
  };
}
