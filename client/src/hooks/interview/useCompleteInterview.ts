import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeInterview } from "@/lib/api/interviews";
import { toast } from "sonner";
import type { InterviewFeedback } from "@/types/api/interviews";

interface CompleteInterviewData {
  interviewId: number;
  feedback: InterviewFeedback;
}

export function useCompleteInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ interviewId, feedback }: CompleteInterviewData) => {
      return completeInterview(interviewId, feedback);
    },
    onSuccess: async (_, variables) => {
      // Invalidate interview queries to refresh data
      await queryClient.invalidateQueries({
        queryKey: ["interviews", variables.interviewId],
      });

      toast.success("Interview completed successfully");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to complete interview. Please try again."
      );
    },
  });
}
