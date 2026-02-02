import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getInterviewResponseEvidence,
  uploadInterviewResponseEvidence,
  deleteInterviewResponseEvidence,
} from "@/lib/api/interviews";

export function useEvidence(responseId?: number) {
  const queryClient = useQueryClient();

  // Fetch evidence for this response
  const {
    data: evidence = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["interview-response-evidence", responseId],
    queryFn: () => getInterviewResponseEvidence(responseId!),
    enabled: !!responseId,
  });

  // Upload evidence mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      uploadInterviewResponseEvidence(responseId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interview-response-evidence", responseId],
      });
      toast.success("Evidence uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload evidence");
    },
  });

  // Delete evidence mutation
  const deleteMutation = useMutation({
    mutationFn: (evidenceId: number) =>
      deleteInterviewResponseEvidence(responseId!, evidenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["interview-response-evidence", responseId],
      });
      toast.success("Evidence deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete evidence");
    },
  });

  return {
    // Data
    evidence,
    isLoading,
    error: error as Error | null,

    // Mutations
    uploadEvidence: uploadMutation.mutateAsync,
    deleteEvidence: deleteMutation.mutateAsync,

    // Mutation states
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
