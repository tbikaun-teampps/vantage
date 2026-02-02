import type {
  SendInterviewReminderResponse,
  SendInterviewSummaryResponse,
} from "@/types/api/email";
import { apiClient } from "./client";

export async function sendInterviewReminder(
  interviewId: number
): Promise<SendInterviewReminderResponse> {
  try {
    const response = await apiClient.post<SendInterviewReminderResponse>(
      "/emails/send-interview-reminder",
      null,
      {
        params: { interviewId },
      }
    );

    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send interview reminder email",
    };
  }
}

export async function sendInterviewSummary(
  interviewId: number
): Promise<SendInterviewSummaryResponse> {
  try {
    const response = await apiClient.post<SendInterviewSummaryResponse>(
      "/emails/send-interview-summary",
      null,
      { params: { interviewId } }
    );

    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send interview summary email",
    };
  }
}
