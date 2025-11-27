import { z } from "zod";

type WidgetType = "metric" | "chart" | "activity" | "actions" | "table";

const WidgetTypeEnum: WidgetType[] = [
  "metric",
  "chart",
  "activity",
  "actions",
  "table",
];

type MetricWidgetType =
  | "generated-actions"
  | "generated-recommendations"
  | "worst-performing-domain"
  | "high-risk-areas"
  | "assessment-activity";

const MetricWidgetTypeEnum: MetricWidgetType[] = [
  "generated-actions",
  "generated-recommendations",
  "worst-performing-domain",
  "high-risk-areas",
  "assessment-activity",
];

const MetricConfigSchema = z.object({
  metricType: z.enum(MetricWidgetTypeEnum),
  title: z.string().optional(),
  description: z.string().optional(),
  value: z.union([z.number(), z.string()]).optional(),
  trend: z.number().optional(),
  status: z.enum(["up", "down", "neutral"]).optional(),
  badges: z
    .array(
      z.object({
        text: z.string(),
        color: z.string().optional(),
        borderColor: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .optional(),
  secondaryMetrics: z
    .array(
      z.object({
        value: z.union([z.number(), z.string()]),
        label: z.string(),
        icon: z.string().optional(),
      })
    )
    .optional(),
  subtitle: z.string().optional(),
  phaseBadge: z
    .object({
      text: z.string(),
      color: z.string().optional(),
      borderColor: z.string().optional(),
      icon: z.string().optional(),
    })
    .optional(),
});

const EntityConfigSchema = z.object({
  entityType: z.enum(["interviews", "assessments", "programs"]),
});

const TableConfigSchema = z.object({
  entityType: z.enum(["actions", "recommendations", "comments"]),
});

const ScopeConfigSchema = z.object({
  assessmentId: z.number().optional(),
  programId: z.number().optional(),
  interviewId: z.number().optional(),
});

const WidgetConfigSchema = z.object({
  title: z.string().optional(),
  metric: MetricConfigSchema.optional(),
  entity: EntityConfigSchema.optional(),
  table: TableConfigSchema.optional(),
  scope: ScopeConfigSchema.optional(),
});

// Reusable schema for widget configuration
const WidgetSchema = z.object({
  id: z.string(), // NOTE: this id is not in the DB its in JSON
  widgetType: z.enum(WidgetTypeEnum),
  config: WidgetConfigSchema, // Flexible object for widget config
});

// Reusable schema for layout configuration
const LayoutSchema = z.object({
  i: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});

// Reusable schema for dashboard data
export const DashboardSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  widgets: z.array(WidgetSchema), // Json type from database
  layout: z.array(LayoutSchema), // Json type from database
});

// GET all dashboards for a company
export const GetDashboardsParamsSchema = z.object({
  companyId: z.string(),
});

export const GetDashboardsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(DashboardSchema),
});

// GET a specific dashboard by ID
export const GetDashboardByIdParamsSchema = z.object({
  companyId: z.string(),
  dashboardId: z.coerce.number(),
});

export const GetDashboardByIdResponseSchema = z.object({
  success: z.boolean(),
  data: DashboardSchema,
});

// POST create new dashboard
export const CreateDashboardParamsSchema = z.object({
  companyId: z.string(),
});

export const CreateDashboardBodySchema = z.object({
  name: z.string(),
  widgets: z.array(WidgetSchema),
  layout: z.array(LayoutSchema),
});

export const CreateDashboardResponseSchema = z.object({
  success: z.boolean(),
  data: DashboardSchema,
});

// PATCH update dashboard
export const UpdateDashboardParamsSchema = z.object({
  companyId: z.string(),
  dashboardId: z.coerce.number(),
});

export const UpdateDashboardBodySchema = z.object({
  name: z.string().optional(),
  widgets: z.array(WidgetSchema).optional(),
  layout: z.array(LayoutSchema).optional(),
});

export const UpdateDashboardResponseSchema = z.object({
  success: z.boolean(),
  data: DashboardSchema,
});

// DELETE soft delete dashboard
export const DeleteDashboardParamsSchema = z.object({
  companyId: z.string(),
  dashboardId: z.coerce.number(),
});

export const DeleteDashboardResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
