import type { paths } from ".";

export type GetDashboardsResponseData =
  paths["/dashboards/{companyId}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type CreateDashboardBodyData =
  paths["/dashboards/{companyId}"]["post"]["requestBody"]["content"]["application/json"];

export type CreateDashboardResponseData =
  paths["/dashboards/{companyId}"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

export type UpdateDashboardBodyData = NonNullable<
  paths["/dashboards/{companyId}/{dashboardId}"]["patch"]["requestBody"]
>["content"]["application/json"];

export type UpdateDashboardResponseData =
  paths["/dashboards/{companyId}/{dashboardId}"]["patch"]["responses"]["200"]["content"]["application/json"]["data"];

// --- WIDGETS ---

export type GetWidgetConfigOptionsResponseData =
  paths["/dashboards/widgets/{companyId}/config-options"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

// --- OLD ----

export type GetActivityWidgetParams =
  paths["/dashboards/widgets/{companyId}/activity"]["get"]["parameters"]["query"];

export type GetActivityWidgetResponseData =
  paths["/dashboards/widgets/{companyId}/activity"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetMetricWidgetParams =
  paths["/dashboards/widgets/{companyId}/metrics"]["get"]["parameters"]["query"];

export type GetMetricWidgetResponseData =
  paths["/dashboards/widgets/{companyId}/metrics"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetTableWidgetParams =
  paths["/dashboards/widgets/{companyId}/table"]["get"]["parameters"]["query"];

export type GetTableWidgetResponseData =
  paths["/dashboards/widgets/{companyId}/table"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetActionWidgetParams =
  paths["/dashboards/widgets/{companyId}/actions"]["get"]["parameters"]["query"];

export type GetActionWidgetResponseData =
  paths["/dashboards/widgets/{companyId}/actions"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

// --- DERIVED ---

export type Widget = CreateDashboardBodyData["widgets"][number];

export type WidgetType = Widget["widgetType"];

export type WidgetConfig = Widget["config"];

export type MetricWidgetConfig = WidgetConfig["metric"];

export type EntityWidgetConfig = WidgetConfig["entity"];

export type TableWidgetConfig = WidgetConfig["table"];

// export type ActivityWidgetConfig = WidgetConfig["activity"];

export type ScopeConfig = WidgetConfig["scope"];

export type Dashboard = GetDashboardsResponseData[number];

export type ActivityWidgetEntityType = GetActivityWidgetParams['entityType']