import { z } from "zod";
import { AssessmentStatusEnum, AssessmentTypeEnum } from "./assessments";
import { ProgramStatusEnum } from "./programs";
import { InterviewStatusEnum } from "./interviews";

// Common params schema for all widget routes
const WidgetParamsSchema = z.object({
  companyId: z.string(),
});

// GET config options for widget configuration
export const GetConfigOptionsParamsSchema = WidgetParamsSchema;

export const GetConfigOptionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    assessments: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        status: z.enum(AssessmentStatusEnum),
      })
    ),
    programs: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        status: z.enum(ProgramStatusEnum),
      })
    ),
    interviews: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        status: z.enum(InterviewStatusEnum),
      })
    ),
  }),
});

// GET activity data for widgets
export const GetActivityDataParamsSchema = WidgetParamsSchema;

export const GetActivityDataQuerySchema = z.object({
  entityType: z.enum(["interviews", "assessments", "programs"]),
});

export const GetActivityDataResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    total: z.number(),
    breakdown: z.record(z.string(), z.number()),
    scope: z.object({
      assessmentName: z.string().optional(),
      programName: z.string().optional(),
    }),
    items: z.array(
      z.object({
        id: z.number(),
        status: z.enum(AssessmentStatusEnum),
        created_at: z.string(),
        updated_at: z.string(),
        name: z.string(),
        type: z.enum(AssessmentTypeEnum).optional(),
        is_individual: z.boolean().optional(),
        assessment: z
          .object({
            id: z.number(),
            name: z.string(),
          })
          .optional(),
        program_phase: z
          .object({
            id: z.number(),
            name: z.string(),
            program: z.object({
              id: z.number(),
              name: z.string(),
            }),
          })
          .optional(),
      })
    ),
  }),
});

// GET metric data for widgets
export const GetMetricDataParamsSchema = WidgetParamsSchema;

export const GetMetricDataQuerySchema = z.object({
  metricType: z.enum([
    "generated-actions",
    "generated-recommendations",
    "worst-performing-domain",
    "high-risk-areas",
    "assessment-activity",
  ]),
  title: z.string().optional(),
});

export const GetMetricDataResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    title: z.string(),
    metricType: z.string(),
    value: z.union([z.number(), z.string()]),
    phaseBadge: z
      .object({
        text: z.string(),
        color: z.string(),
        borderColor: z.string(),
      })
      .optional(),
    badges: z
      .array(
        z.object({
          text: z.string(),
          color: z.string(),
          borderColor: z.string(),
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
    description: z.string().optional(),
    trend: z.number().optional(),
    status: z.enum(["up", "down", "neutral"]).optional(),
  }),
});

// GET table data for widgets
export const GetTableDataParamsSchema = WidgetParamsSchema;

export const GetTableDataQuerySchema = z.object({
  entityType: z.enum(["actions", "recommendations", "comments"]),
  assessmentId: z.coerce.number().optional(),
  programId: z.coerce.number().optional(),
});

export const GetTableDataResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    rows: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
    columns: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
      })
    ),
    scope: z
      .object({
        assessmentName: z.string().optional(),
        programName: z.string().optional(),
      })
      .optional(),
  }),
});

// GET actions data for widgets
export const GetActionsDataParamsSchema = WidgetParamsSchema;

export const GetActionsDataQuerySchema = z.object({
  entityType: z.string(),
});

export const GetActionsDataResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.string()),
});
