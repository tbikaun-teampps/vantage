import type { paths } from ".";

export type GetOverallDesktopGeographicalMapResponseData = NotNullable<
  paths["/analytics/geographical-map/overall/desktop"]["get"]["responses"][200]
>["content"]["application/json"]["data"];

export type GetOverallHeatmapFiltersResponseData =
  paths["/analytics/heatmap/overall/filters"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetOverallOnsiteHeatmapParams =
  paths["/analytics/heatmap/overall/onsite"]["get"]["parameters"]["query"];

export type GetOverallOnsiteHeatmapResponseData =
  paths["/analytics/heatmap/overall/onsite"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetOverallDesktopHeatmapParams =
  paths["/analytics/heatmap/overall/desktop"]["get"]["parameters"]["query"];

export type GetOverallDesktopHeatmapResponseData =
  paths["/analytics/heatmap/overall/desktop"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetProgramInterviewHeatmapResponseData =
  paths["/analytics/heatmap/program-interviews/{programId}"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetProgramInterviewHeatmapParams =
  paths["/analytics/heatmap/program-interviews/{programId}"]["get"]["parameters"]["query"];

export type GetProgramMeasurementHeatmapResponseData =
  paths["/analytics/heatmap/program-measurements/{programId}"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetOverallGeographicalMapFiltersResponseData =
  paths["/analytics/geographical-map/overall/filters"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetOverallOnsiteGeographicalMapResponseData =
  paths["/analytics/geographical-map/overall/onsite"]["get"]["responses"][200]["content"]["application/json"]["data"];

// --- Derived ---

// Extract specific filter response variants from the union
export type OnsiteHeatmapFiltersData = Extract<
  GetOverallHeatmapFiltersResponseData,
  { options: { questionnaires: unknown } }
>;

export type DesktopHeatmapFiltersData = Extract<
  GetOverallHeatmapFiltersResponseData,
  { options: { measurements: unknown } }
>;

export type OnsiteGeographicalMapFiltersData = Extract<
  GetOverallGeographicalMapFiltersResponseData,
  { options: { questionnaires: unknown } }
>;

export type DesktopGeographicalMapFiltersData = Extract<
  GetOverallGeographicalMapFiltersResponseData,
  { options: { measurements: unknown } }
>;

export type DesktopHeatmapXAxisOptions = Exclude<
  GetOverallDesktopHeatmapParams["xAxis"],
  undefined
>;
export type OnsiteHeatmapXAxisOptions = Exclude<
  GetOverallOnsiteHeatmapParams["xAxis"],
  undefined
>;

export type OnsiteHeatmapYAxisOptions = Exclude<
  GetOverallOnsiteHeatmapParams["yAxis"],
  undefined
>;
