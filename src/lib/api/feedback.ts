import { apiClient } from "./client";

export type FeedbackType = "bug" | "feature" | "general" | "suggestion";

export interface FeedbackData {
  message: string;
  type?: FeedbackType;
  page_url?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
}

export async function submitFeedback(
  data: FeedbackData
): Promise<FeedbackResponse> {
  try {
    // Capture page URL client-side if not provided
    const feedbackData = {
      ...data,
      page_url:
        data.page_url ||
        (typeof window !== "undefined" ? window.location.href : ""),
    };

    const response = await apiClient.post<FeedbackResponse>(
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
