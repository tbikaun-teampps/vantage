import type { paths } from ".";

// --- GENERAL ---
export type GetProgramsParams =
  paths["/programs"]["get"]["parameters"]["query"];
export type GetProgramsResponseData =
  paths["/programs"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetProgramByIdResponseData =
  paths["/programs/{programId}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type CreateProgramBodyData =
  paths["/programs"]["post"]["requestBody"]["content"]["application/json"];
export type CreateProgramResponseData =
  paths["/programs"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

export type UpdateProgramBodyData = NonNullable<
  paths["/programs/{programId}"]["put"]["requestBody"]
>["content"]["application/json"];
export type UpdateProgramResponseData =
  paths["/programs/{programId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

// --- OBJECTIVES ---

export type GetProgramObjectivesResponseData =
  paths["/programs/{programId}/objectives"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type CreateProgramObjectiveBodyData =
  paths["/programs/{programId}/objectives"]["post"]["requestBody"]["content"]["application/json"];
export type CreateProgramObjectiveResponseData =
  paths["/programs/{programId}/objectives"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

export type UpdateProgramObjectiveBodyData = NonNullable<
  paths["/programs/{programId}/objectives/{objectiveId}"]["put"]["requestBody"]
>["content"]["application/json"];
export type UpdateProgramObjectiveResponseData =
  paths["/programs/{programId}/objectives/{objectiveId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

// --- QUESTIONNAIRES ---

export type UpdateProgramOnsiteQuestionnaireResponseData =
  paths["/programs/{programId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

export type UpdateProgramPresiteQuestionnaireResponseData =
  paths["/programs/{programId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

// --- PHASES ---

export type CreateProgramPhaseBodyData =
  paths["/programs/{programId}/phases"]["post"]["requestBody"]["content"]["application/json"];
export type CreateProgramPhaseResponseData =
  paths["/programs/{programId}/phases"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

export type UpdateProgramPhaseBodyData = NonNullable<
  paths["/programs/{programId}/phases/{phaseId}"]["put"]["requestBody"]
>["content"]["application/json"];
// export interface UpdatePhaseData {
//   name?: string | null;
//   status?: "scheduled" | "in_progress" | "completed" | "archived";
//   notes?: string | null;
//   planned_start_date?: string | null;
//   actual_start_date?: string | null;
//   planned_end_date?: string | null;
//   actual_end_date?: string | null;
// }
export type UpdateProgramPhaseResponseData =
  paths["/programs/{programId}/phases/{phaseId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

// --- INTERVIEWS ---

export type CreateProgramInterviewsBodyData =
  paths["/programs/{programId}/interviews"]["post"]["requestBody"]["content"]["application/json"];
export type CreateProgramInterviewsResponseData =
  paths["/programs/{programId}/interviews"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

// --- MEASUREMENTS ---

export type GetProgramMeasurementsParams =
  paths["/programs/{programId}/measurements"]["get"]["parameters"]["query"];
export type GetProgramMeasurementsResponseData =
  paths["/programs/{programId}/measurements"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetProgramAvailableMeasurementsResponseData =
  paths["/programs/{programId}/measurements/available"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type AddMeasurementDefinitionsToProgramBodyData =
  paths["/programs/{programId}/measurement-definitions"]["post"]["requestBody"]["content"]["application/json"];
export type AddMeasurementDefinitionsToProgramResponseData =
  paths["/programs/{programId}/measurement-definitions"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

export type GetProgramAllowedMeasurementDefinitionsResponseData =
  paths["/programs/{programId}/measurement-definitions/allowed"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

// --- PHASE MEASUREMENTS ---

export type GetProgramCalculatedMeasurementsParams =
  paths["/programs/{programId}/phases/{phaseId}/calculated-measurements"]["get"]["parameters"]["query"];

export type GetProgramCalculatedMeasurementsResponseData =
  paths["/programs/{programId}/phases/{phaseId}/calculated-measurements"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetProgramPhaseMeasurementsParams =
  paths["/programs/{programId}/phases/{phaseId}/calculated-measurement"]["get"]["parameters"]["query"];

export type GetProgramPhaseMeasurementsResponseData =
  paths["/programs/{programId}/phases/{phaseId}/calculated-measurement"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type CreateProgramPhaseMeasurementBodyData =
  paths["/programs/{programId}/phases/{phaseId}/measurement-data"]["post"]["requestBody"]["content"]["application/json"];

export type CreateProgramPhaseMeasurementResponseData =
  paths["/programs/{programId}/phases/{phaseId}/measurement-data"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

export type UpdateProgramPhaseMeasurementBodyData =
  paths["/programs/{programId}/phases/{phaseId}/measurement-data/{measurementId}"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateProgramPhaseMeasurementResponseData =
  paths["/programs/{programId}/phases/{phaseId}/measurement-data/{measurementId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

// --- DERIVED ---

export type ProgramPhase = NonNullable<
  GetProgramByIdResponseData["phases"]
>[number];

export type ProgramObjective = NonNullable<
  GetProgramByIdResponseData["objectives"]
>[number];

export type ProgramCalculatedMeasurement =
  GetProgramCalculatedMeasurementsResponseData[number];
