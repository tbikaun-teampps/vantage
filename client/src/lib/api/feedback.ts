import type {
  SubmitFeedbackBodyData,
  SubmitFeedbackResponse,
} from "@/types/api/feedback";
import { apiClient } from "./client";

export async function submitFeedback(
  data: SubmitFeedbackBodyData
): Promise<SubmitFeedbackResponse> {
  try {
    // Capture page URL client-side if not provided
    const feedbackData = {
      ...data,
      page_url:
        data.page_url ||
        (typeof window !== "undefined" ? window.location.href : ""),
    };

    const response = await apiClient.post<SubmitFeedbackResponse>(
      "/feedback",
      feedbackData
    );

    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to submit feedback",
    };
  }
}
