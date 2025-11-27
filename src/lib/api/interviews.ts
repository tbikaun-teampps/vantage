import { apiClient } from "./client";
import type {
  InterviewSummaryResponseData,
  CreateInterviewBodyData,
  CreateInterviewResponseData,
  CreateIndividualInterviewsBodyData,
  CreateIndividualInterviewsResponseData,
  GetInterviewsResponseData,
  GetInterviewsParams,
  UpdateInterviewResponseData,
  UpdateInterviewBodyData,
  GetInterviewResponseActionsResponseData,
  AddInterviewResponseActionBodyData,
  AddInterviewResponseActionResponseData,
  UpdateInterviewResponseActionResponseData,
  UpdateInterviewResponseActionBodyData,
  GetInterviewResponseCommentsResponseData,
  UpdateInterviewResponseCommentResponseData,
  UpdateInterviewResponseCommentBodyData,
  UpdateInterviewResponseBodyData,
  UpdateInterviewResponseResponseData,
  GetInterviewResponseEvidenceResponseData,
  UploadInterviewResponseEvidenceResponseData,
  GetInterviewAssessmentRolesResponseData,
  ValidateAssessmentRolesForQuestionnaireResponseData,
  ValidateAssessmentRolesForQuestionnaireBodyData,
  ValidateProgramQuestionnaireRolesBodyData,
  ValidateProgramQuestionnaireRolesResponseData,
  CompleteInterviewResponseData,
  CompleteInterviewBodyData,
  GetInterviewQuestionByIdResponseData,
} from "@/types/api/interviews";
import type { ApiResponse } from "./utils";

export async function createInterview(
  data: CreateInterviewBodyData
): Promise<CreateInterviewResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateInterviewResponseData>
  >("/interviews", data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create interview");
  }

  return response.data.data;
}

/**
 * Creates one or more individual interviews scoped to individual contacts via email and access code.
 */
export async function createIndividualInterviews(
  data: CreateIndividualInterviewsBodyData
): Promise<CreateIndividualInterviewsResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateIndividualInterviewsResponseData>
  >("/interviews/individual", data);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to create individual interview(s)"
    );
  }

  return response.data.data;
}

export async function getInterviews(
  params: GetInterviewsParams
): Promise<GetInterviewsResponseData> {
  const response = await apiClient.get<ApiResponse<GetInterviewsResponseData>>(
    "/interviews",
    {
      params,
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch interviews");
  }

  return response.data.data;
}

export async function getInterviewSummary(
  interviewId: number
): Promise<InterviewSummaryResponseData> {
  const response = await apiClient.get<
    ApiResponse<InterviewSummaryResponseData>
  >(`/interviews/${interviewId}/summary`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch interview summary");
  }

  return response.data.data;
}

export async function updateInterview(
  interviewId: number,
  updates: UpdateInterviewBodyData
): Promise<UpdateInterviewResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateInterviewResponseData>
  >(`/interviews/${interviewId}`, updates);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update interview");
  }

  return response.data.data;
}

export async function deleteInterview(interviewId: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/interviews/${interviewId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete interview");
  }
}

export async function getInterviewQuestionById(
  interviewId: number,
  questionId: number
): Promise<GetInterviewQuestionByIdResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetInterviewQuestionByIdResponseData>
  >(`/interviews/${interviewId}/questions/${questionId}`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch interview question"
    );
  }

  return response.data.data;
}

// ====== Interview Actions ======

export async function getInterviewResponseActions(
  responseId: number
): Promise<GetInterviewResponseActionsResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetInterviewResponseActionsResponseData>
  >(`/interviews/responses/${responseId}/actions`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch interview response actions"
    );
  }

  return response.data.data;
}

export async function addInterviewResponseAction(
  responseId: number,
  action: AddInterviewResponseActionBodyData
): Promise<AddInterviewResponseActionResponseData> {
  const response = await apiClient.post<
    ApiResponse<AddInterviewResponseActionResponseData>
  >(`/interviews/responses/${responseId}/actions`, action);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to add interview response action"
    );
  }

  return response.data.data;
}

export async function updateInterviewResponseAction(
  responseId: number,
  actionId: number,
  action: UpdateInterviewResponseActionBodyData
): Promise<UpdateInterviewResponseActionResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateInterviewResponseActionResponseData>
  >(`/interviews/responses/${responseId}/actions/${actionId}`, action);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update interview response action"
    );
  }

  return response.data.data;
}

export async function deleteInterviewResponseAction(
  responseId: number,
  actionId: number
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/interviews/responses/${responseId}/actions/${actionId}`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to delete interview response action"
    );
  }
}

// ====== Interview Response Comments ======

export async function getInterviewResponseComments(
  responseId: number
): Promise<GetInterviewResponseCommentsResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetInterviewResponseCommentsResponseData>
  >(`/interviews/responses/${responseId}/comments`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch interview response comments"
    );
  }

  return response.data.data;
}

export async function updateInterviewResponseComments(
  responseId: number,
  update: UpdateInterviewResponseCommentBodyData
): Promise<UpdateInterviewResponseCommentResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateInterviewResponseCommentResponseData>
  >(`/interviews/responses/${responseId}/comments`, update);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update interview response comments"
    );
  }

  return response.data.data;
}

export async function updateInterviewResponse(
  responseId: number,
  data: UpdateInterviewResponseBodyData
): Promise<UpdateInterviewResponseResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateInterviewResponseResponseData>
  >(`/interviews/responses/${responseId}`, data);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update interview response"
    );
  }

  return response.data.data;
}

// ====== Interview Response Evidence ======

export async function getInterviewResponseEvidence(
  responseId: number
): Promise<GetInterviewResponseEvidenceResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetInterviewResponseEvidenceResponseData>
  >(`/interviews/responses/${responseId}/evidence`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch interview response evidence"
    );
  }

  return response.data.data;
}

export async function uploadInterviewResponseEvidence(
  responseId: number,
  file: File
): Promise<UploadInterviewResponseEvidenceResponseData> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<
    ApiResponse<UploadInterviewResponseEvidenceResponseData>
  >(`/interviews/responses/${responseId}/evidence`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to upload interview response evidence"
    );
  }

  return response.data.data;
}

export async function deleteInterviewResponseEvidence(
  responseId: number,
  evidenceId: number
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/interviews/responses/${responseId}/evidence/${evidenceId}`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to delete interview response evidence"
    );
  }
}

// ====== Interview Creation Helpers ======

export async function getRolesAssociatedWithAssessment(
  assessmentId: number
): Promise<GetInterviewAssessmentRolesResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetInterviewAssessmentRolesResponseData>
  >(`/interviews/assessment-roles/${assessmentId}`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch roles for assessment"
    );
  }

  return response.data.data;
}

/**
 * Validate that an assessment's questionnaire has applicable questions for given role IDs
 */
export async function validateAssessmentRolesForQuestionnaire(
  data: ValidateAssessmentRolesForQuestionnaireBodyData
): Promise<ValidateAssessmentRolesForQuestionnaireResponseData> {
  const response = await apiClient.post<
    ApiResponse<ValidateAssessmentRolesForQuestionnaireResponseData>
  >("/interviews/assessment-roles/validate", data);

  if (!response.data.success) {
    throw new Error(
      response.data.error ||
        "Failed to validate roles for assessment questionnaire"
    );
  }

  return response.data.data;
}

/**
 * Validate that a program questionnaire has applicable questions for given role IDs
 */
export async function validateProgramQuestionnaireRoles(
  questionnaireId: number,
  data: ValidateProgramQuestionnaireRolesBodyData
): Promise<ValidateProgramQuestionnaireRolesResponseData> {
  const response = await apiClient.post<
    ApiResponse<ValidateProgramQuestionnaireRolesResponseData>
  >(`/interviews/questionnaires/${questionnaireId}/validate-roles`, data);

  if (!response.data.success) {
    throw new Error(
      response.data.error ||
        "Failed to validate roles for program questionnaire"
    );
  }

  return response.data.data;
}

/**
 * Mark an interview as completed. For public interviews this will send a summary of the interview to the interviewee.
 */
export async function completeInterview(
  interviewId: number,
  data: CompleteInterviewBodyData
): Promise<CompleteInterviewResponseData> {
  const response = await apiClient.post<
    ApiResponse<CompleteInterviewResponseData>
  >(`/interviews/${interviewId}/complete`, data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to complete interview");
  }

  return response.data.data;
}
