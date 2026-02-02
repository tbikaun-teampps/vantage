import type { paths } from ".";
import type { GetInterviewQuestionByIdResponseData } from "./interviews";

export type GetAssessmentByIdResponseData =
  paths["/assessments/{assessmentId}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetCommentsByAssessmentIdResponseData =
  paths["/assessments/{assessmentId}/comments"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetEvidenceByAssessmentIdResponseData =
  paths["/assessments/{assessmentId}/evidence"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetActionsByAssessmentIdResponseData =
  paths["/assessments/{assessmentId}/actions"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetInterviewsByAssessmentIdResponseData =
  paths["/assessments/{assessmentId}/interviews"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type CreateAssessmentBodyData =
  paths["/assessments/"]["post"]["requestBody"]["content"]["application/json"];

export type CreateAssessmentResponseData =
  paths["/assessments/"]["post"]["responses"]["200"]["content"]["application/json"]["data"];

export type UpdateAssessmentBodyData = NonNullable<
  paths["/assessments/{assessmentId}"]["put"]["requestBody"]
>["content"]["application/json"];

export type UpdateAssessmentResponseData =
  paths["/assessments/{assessmentId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

export type DuplicateAssessmentResponseData =
  paths["/assessments/{assessmentId}/duplicate"]["post"]["responses"]["200"]["content"]["application/json"]["data"];

// --- Measurements ---
export type GetAssessmentMeasurementsResponseData =
  paths["/assessments/{assessmentId}/measurements"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type AddAssessmentMeasurementBodyData =
  paths["/assessments/{assessmentId}/measurements"]["post"]["requestBody"]["content"]["application/json"];

export type AddAssessmentMeasurementResponseData =
  paths["/assessments/{assessmentId}/measurements"]["post"]["responses"]["200"]["content"]["application/json"]["data"];

export type UpdateAssessmentMeasurementBodyData =
  paths["/assessments/{assessmentId}/measurements/{measurementId}"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateAssessmentMeasurementResponseData =
  paths["/assessments/{assessmentId}/measurements/{measurementId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetAssessmentMeasurementBarChartResponseData =
  paths["/assessments/{assessmentId}/measurements/bar-charts"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetAssessmentsParams =
  paths["/companies/{companyId}/assessments"]["get"]["parameters"]["query"];

export type GetAssessmentsResponseData =
  paths["/companies/{companyId}/assessments"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetAssessmentMeasurementDefinitionsByIdResponseData =
  paths["/assessments/{assessmentId}/measurement-definitions"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

// --- DERIVED ---

export type AssessmentObjectives = GetAssessmentByIdResponseData["objectives"];

export type AssessmentStatus = GetAssessmentByIdResponseData["status"];

export type AssessmentQuestionnaire =
  GetAssessmentByIdResponseData["questionnaire"];

export type AssessmentLocation = GetAssessmentByIdResponseData["location"];

export interface CreateObjectiveFormData {
  title: string;
  description?: string;
}

export interface CreateAssessmentFormData {
  questionnaire_id?: number;
  name: string;
  description: string | null;
  business_unit_id?: number;
  region_id?: number;
  site_id?: number;
  asset_group_id?: number;
  objectives: CreateObjectiveFormData[];
  type: CreateAssessmentBodyData["type"];
}

export type AssessmentMeasurementInstance =
  GetAssessmentMeasurementsResponseData[number];

export type AssessmentMeasurementDefinition =
  GetAssessmentMeasurementDefinitionsByIdResponseData[number];

export type AssessmentTypeEnum = GetAssessmentByIdResponseData["type"];
export type AssessmentStatusEnum = GetAssessmentByIdResponseData["status"];
