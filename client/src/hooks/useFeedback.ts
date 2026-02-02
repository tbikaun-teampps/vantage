import { useMutation } from "@tanstack/react-query";
import { submitFeedback } from "@/lib/api/feedback";
import type { SubmitFeedbackBodyData } from "@/types/api/feedback";

// Hook for feedback mutations
export function useFeedbackActions() {
  const submitFeedbackMutation = useMutation({
    mutationFn: (data: SubmitFeedbackBodyData) => submitFeedback(data),
    onError: (error) => {
      console.error("Failed to submit feedback:", error);
    },
  });

  return {
    // Actions
    submitFeedback: submitFeedbackMutation.mutateAsync,

    // Loading states
    isSubmitting: submitFeedbackMutation.isPending,

    // Error states
    feedbackError: submitFeedbackMutation.error,

    // Reset error states
    resetErrors: () => {
      submitFeedbackMutation.reset();
    },
  };
}
