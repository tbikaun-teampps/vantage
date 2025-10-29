import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInterviewResponse } from "@/lib/api/interviews";
import { toast } from "sonner";

interface SaveResponseData {
  interviewId: number;
  responseId: number;
  questionId: number;
  rating_score?: number | null;
  role_ids?: number[] | null;
  is_unknown?: boolean | null;
  question_part_answers?: Array<{
    question_part_id: number;
    answer_value: string;
  }> | null;
}

interface InterviewProgress {
  status: "pending" | "in_progress" | "completed";
  previous_status?: "pending" | "in_progress" | "completed";
  total_questions: number;
  answered_questions: number;
  progress_percentage: number;
}

export function useSaveInterviewResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      responseId,
      rating_score,
      role_ids,
      is_unknown,
      question_part_answers,
    }: SaveResponseData) => {
      return updateInterviewResponse(responseId, {
        rating_score,
        role_ids,
        is_unknown,
        question_part_answers,
      });
    },
    onSuccess: async (_, variables) => {
      // Force immediate refetch of the question cache to ensure UI updates with saved values
      await queryClient.refetchQueries({
        queryKey: [
          "interviews",
          variables.interviewId,
          "questions",
          variables.questionId,
        ],
      });

      // Refetch progress to get status update with previous_status
      await queryClient.refetchQueries({
        queryKey: ["interviews", variables.interviewId, "progress"],
      });

      // Check for status change and show toast
      const progressData = queryClient.getQueryData<{
        success: boolean;
        data: InterviewProgress;
      }>(["interviews", variables.interviewId, "progress"]);

      if (progressData?.data?.previous_status) {
        const previousStatus = progressData.data.previous_status;
        const currentStatus = progressData.data.status;

        // Show appropriate toast based on status transition
        if (previousStatus === "pending" && currentStatus === "in_progress") {
          toast.success("Interview started! 🎯");
        } else if (
          previousStatus === "in_progress" &&
          currentStatus === "completed"
        ) {
          toast.success("Interview completed! ✅");
        } else if (
          previousStatus === "completed" &&
          currentStatus === "in_progress"
        ) {
          toast.info("Interview reopened");
        } else if (
          previousStatus === "in_progress" &&
          currentStatus === "pending"
        ) {
          toast.info("All responses cleared");
        }
      }
    },
    onError: (error) => {
      toast.error(
        error?.response?.data.error ??
          "Failed to save response. Please try again."
      );
    },
  });
}
