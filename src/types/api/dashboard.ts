import type { paths } from ".";

export type ActivityWidgetResponseData =
  paths["/dashboards/widgets/{companyId}/activity"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type ActivityWidgetListItem =
  ActivityWidgetResponseData["items"][number];
