import { apiClient } from "./client";

// Types for email service
export interface InviteTeamMemberData {
  email: string;
  name?: string;
  role?: string;
  company_name?: string;
  invite_link?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

export async function sendInterviewReminder(
  interviewId: number
): Promise<EmailResponse> {
  try {
    const response = await apiClient.post<EmailResponse>(
      "/emails/send-interview-reminder",
      null,
      {
        params: { interviewId },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Email service error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send interview reminder email",
    };
  }
}

export async function sendTeamMemberInvite(
  data: InviteTeamMemberData
): Promise<EmailResponse> {
  try {
    const response = await apiClient.post<EmailResponse>(
      "/emails/send-team-member-invite",
      data
    );

    return response.data;
  } catch (error) {
    console.error("Email service error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send team member invite email",
    };
  }
}

export async function sendInterviewSummary(
  interviewId: number
): Promise<EmailResponse> {
  try {
    const response = await apiClient.post<EmailResponse>(
      "/emails/send-interview-summary",
      null,
      { params: { interviewId } }
    );

    return response.data;
  } catch (error) {
    console.error("Email service error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send interview summary email",
    };
  }
}
