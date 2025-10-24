import type { paths } from ".";

export type ProgramListResponseData =
  paths["/programs"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type ProgramListItem = ProgramListResponseData[number];

export type ProgramDetailResponseData =
  paths["/programs/{programId}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type ProgramObjectivesListResponseData =
  paths["/programs/{programId}/objectives"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type ProgramObjectivesListItem =
  ProgramObjectivesListResponseData[number];

export type ProgramMeasurementListResponseData =
  paths["/programs/{programId}/measurements"]["get"]["responses"]["200"]["content"]["application/json"]["data"];
