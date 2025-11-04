import type { paths } from ".";

export type MeasurementDefinitionsResponseData =
  paths["/shared/measurement-definitions"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type MeasurementDefinitionsListItem =
  MeasurementDefinitionsResponseData[number];
