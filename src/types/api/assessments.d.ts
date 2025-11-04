import type { paths } from ".";

export type UpdateAssessmentData =
  paths["/assessments/{assessmentId}"]["put"]["requestBody"]["content"]["application/json"];

export type MeasurementBarChartsResponseData =
  paths["/assessments/{assessmentId}/measurements/bar-charts"]["get"]["responses"]["200"]["content"]["application/json"]["data"];
