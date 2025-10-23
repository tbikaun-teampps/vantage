import type { paths } from ".";

export type OverallGeographicalMapFiltersResponseData =
  paths["/analytics/overall/geographical-map/filters"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type OverallOnsiteGeographicalMapResponseData =
  paths["/analytics/geographical-map/overall-onsite"]["get"]["responses"][200]["content"]["application/json"]["data"];

  export type OverallDesktopGeographicalMapResponseData =
  paths["/analytics/geographical-map/overall-desktop"]["get"]["responses"][200]["content"]["application/json"]["data"];
