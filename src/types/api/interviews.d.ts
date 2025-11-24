import type { paths } from ".";

// Types for creating interviews
export type CreateInterviewBodyData =
  paths["/interviews"]["post"]["requestBody"]["content"]["application/json"];

export type CreateInterviewResponseData =
  paths["/interviews"]["post"]["responses"]["200"]["content"]["application/json"]["data"];

// Types for creating individual interviews
export type CreateIndividualInterviewsBodyData =
  paths["/interviews/individual"]["post"]["requestBody"]["content"]["application/json"];

export type CreateIndividualInterviewsResponseData =
  paths["/interviews/individual"]["post"]["responses"]["200"]["content"]["application/json"]["data"];

// Get interviews response type
export type GetInterviewsResponseData =
  paths["/interviews"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetInterviewsParams =
  paths["/interviews"]["get"]["parameters"]["query"];

// Type for interview summary response
export type InterviewSummaryResponseData =
  paths["/interviews/{interviewId}/summary"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

// Types for updating interviews
export type UpdateInterviewBodyData = NonNullable<
  paths["/interviews/{interviewId}"]["put"]["requestBody"]
>["content"]["application/json"];

export type UpdateInterviewResponseData =
  paths["/interviews/{interviewId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

// RESPONSE ACTIONS
export type GetInterviewResponseActionsResponseData =
  paths["/interviews/responses/{responseId}/actions"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type AddInterviewResponseActionBodyData =
  paths["/interviews/responses/{responseId}/actions"]["post"]["requestBody"]["content"]["application/json"];

export type AddInterviewResponseActionResponseData =
  paths["/interviews/responses/{responseId}/actions"]["post"]["responses"]["200"]["content"]["application/json"]["data"];

export type UpdateInterviewResponseActionBodyData = NonNullable<
  paths["/interviews/responses/{responseId}/actions/{actionId}"]["put"]["requestBody"]
>["content"]["application/json"];

export type UpdateInterviewResponseActionResponseData =
  paths["/interviews/responses/{responseId}/actions/{actionId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

// Interview comments

export type GetInterviewResponseCommentsResponseData =
  paths["/interviews/responses/{responseId}/comments"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type UpdateInterviewResponseCommentBodyData =
  paths["/interviews/responses/{responseId}/comments"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateInterviewResponseCommentResponseData =
  paths["/interviews/responses/{responseId}/comments"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

export type UpdateInterviewResponseBodyData = NonNullable<
  paths["/interviews/responses/{responseId}"]["put"]["requestBody"]
>["content"]["application/json"];

export type UpdateInterviewResponseResponseData =
  paths["/interviews/responses/{responseId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetInterviewResponseEvidenceResponseData =
  paths["/interviews/responses/{responseId}/evidence"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type UploadInterviewResponseEvidenceResponseData =
  paths["/interviews/responses/{responseId}/evidence"]["post"]["responses"]["200"]["content"]["application/json"]["data"];

// Miscellaneous

export type GetInterviewAssessmentRolesResponseData =
  paths["/interviews/assessment-roles/{assessmentId}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type ValidateAssessmentRolesForQuestionnaireBodyData =
  paths["/interviews/assessment-roles/validate"]["post"]["requestBody"]["content"]["application/json"];

export type ValidateAssessmentRolesForQuestionnaireResponseData =
  paths["/interviews/assessment-roles/validate"]["post"]["responses"]["200"]["content"]["application/json"]["data"];

export type ValidateProgramQuestionnaireRolesBodyData =
  paths["/interviews/questionnaires/{questionnaireId}/validate-roles"]["post"]["requestBody"]["content"]["application/json"];

export type ValidateProgramQuestionnaireRolesResponseData =
  paths["/interviews/questionnaires/{questionnaireId}/validate-roles"]["post"]["responses"]["200"]["content"]["application/json"]["data"];

export type CompleteInterviewBodyData = NonNullable<
  paths["/interviews/{interviewId}/complete"]["post"]["requestBody"]
>["content"]["application/json"];

export type InterviewFeedback = NotNullable<
  CompleteInterviewBodyData["feedback"]
>;

export type CompleteInterviewResponseData =
  paths["/interviews/{interviewId}/complete"]["post"]["responses"]["200"]["content"]["application/json"];

export type GetInterviewQuestionByIdResponseData =
  paths["/interviews/{interviewId}/questions/{questionId}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

// --- Interview Helpers ---

export type GetInterviewProgressResponseData =
  paths["/interviews/{interviewId}/progress"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetInterviewStructureResponseData =
  paths["/interviews/{interviewId}/structure"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetInterviewSummaryResponseData =
  paths["/interviews/{interviewId}/summary"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

// --- DERIVED ---

export type InterviewAction = GetInterviewResponseActionsResponseData[number];

export type QuestionRatingScaleOptions = NonNullable<
  NonNullable<GetInterviewQuestionByIdResponseData>["options"]
>["rating_scales"];

export type QuestionApplicableRoleOptions = NonNullable<
  NonNullable<GetInterviewQuestionByIdResponseData>["options"]
>["applicable_roles"];