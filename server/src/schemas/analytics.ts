import { z } from "zod";

// Enum schemas
export const AssessmentTypeEnum = z.enum(["onsite", "desktop"]);

export const AxisTypeEnum = z.enum([
  "business_unit",
  "region",
  "site",
  "asset_group",
  "work_group",
  "role",
  "role_level",
  "section",
  "step",
  "question",
]);

export const AxisTypeDesktopEnum = z.enum([
  "business_unit",
  "region",
  "site",
  "asset_group",
  "work_group",
  "role",
  "role_level",
]);

export const QuestionnaireTypeEnum = z.enum(["presite", "onsite"]);

// Params schemas
export const ProgramIdParamsSchema = z.object({
  programId: z.coerce.number(),
});

// Querystring schemas
export const HeatmapFiltersQuerystringSchema = z.object({
  companyId: z.string(),
  assessmentType: AssessmentTypeEnum,
});

export const OnsiteHeatmapQuerystringSchema = z.object({
  companyId: z.string(),
  questionnaireId: z.coerce.number(),
  assessmentId: z.coerce.number().optional(),
  xAxis: AxisTypeEnum.optional(),
  yAxis: AxisTypeEnum.optional(),
});

export const DesktopHeatmapQuerystringSchema = z.object({
  companyId: z.string(),
  assessmentId: z.coerce.number().optional(),
  xAxis: AxisTypeDesktopEnum.optional(),
});

export const OnsiteGeographicalMapQuerystringSchema = z.object({
  companyId: z.string(),
  questionnaireId: z.coerce.number(),
  assessmentId: z.coerce.number().optional(),
});

export const DesktopGeographicalMapQuerystringSchema = z.object({
  companyId: z.string(),
  assessmentId: z.coerce.number().optional(),
});

export const GeographicalMapFiltersQuerystringSchema = z.object({
  companyId: z.string(),
  assessmentType: AssessmentTypeEnum,
});

export const ProgramInterviewsQuerystringSchema = z.object({
  questionnaireType: QuestionnaireTypeEnum,
});

// Heatmap response schemas
const HeatmapDataPointSchema = z.object({
  x: z.string(),
  y: z.string(),
  value: z.number().nullable(),
  sampleSize: z.number(),
  // metadata: z.any(),
});

const HeatmapMetricDataSchema = z.object({
  data: z.array(HeatmapDataPointSchema),
  values: z.array(z.number().nullable()),
});

const HeatmapMetricsSchema = z.object({
  average_score: HeatmapMetricDataSchema,
  total_interviews: HeatmapMetricDataSchema,
  completion_rate: HeatmapMetricDataSchema,
  total_actions: HeatmapMetricDataSchema,
});

const HeatmapConfigSchema = z.object({
  xAxis: AxisTypeEnum,
  yAxis: AxisTypeEnum,
  questionnaireId: z.number().optional(),
  assessmentId: z.number().nullable().optional(),
});

export const OnsiteHeatmapResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    xLabels: z.array(z.string()),
    yLabels: z.array(z.string()),
    metrics: HeatmapMetricsSchema,
    config: HeatmapConfigSchema,
  }),
});

// Desktop heatmap schemas
const DesktopHeatmapDataPointSchema = z.object({
  x: z.string(),
  y: z.string(),
  value: z.number().nullable(),
  sampleSize: z.number(),
});

const DesktopAggregationDataSchema = z.object({
  data: z.array(DesktopHeatmapDataPointSchema),
  values: z.array(z.number().nullable()),
});

const DesktopHeatmapAggregationsSchema = z.object({
  sum: DesktopAggregationDataSchema,
  average: DesktopAggregationDataSchema,
  count: DesktopAggregationDataSchema,
});

const DesktopHeatmapConfigSchema = z.object({
  xAxis: AxisTypeDesktopEnum,
  yAxis: z.string(),
  assessmentId: z.number().nullable(),
});

export const DesktopHeatmapResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    xLabels: z.array(z.string()),
    yLabels: z.array(z.string()),
    aggregations: DesktopHeatmapAggregationsSchema,
    config: DesktopHeatmapConfigSchema,
  }),
});

// Shared option schemas (used by multiple filter endpoints)
const AssessmentOptionSchema = z.object({
  id: z.number(),
  name: z.string(),
  questionnaireId: z.number().nullable(),
});

const QuestionnaireOptionSchema = z.object({
  id: z.number(),
  name: z.string(),
  assessmentIds: z.array(z.number()),
});

const MeasurementOptionSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// Heatmap filters schemas
const AxisOptionSchema = z.object({
  value: z.string(),
  category: z.enum(["company", "questionnaire", "measurements"]),
  order: z.number(),
});

const MeasurementDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  unit: z.string().nullable(),
});

// Onsite filters response schema
const OnsiteHeatmapFiltersDataSchema = z.object({
  options: z.object({
    assessments: z.array(AssessmentOptionSchema),
    questionnaires: z.array(QuestionnaireOptionSchema),
    axes: z.array(AxisOptionSchema),
    metrics: z.array(
      z.enum([
        "average_score",
        "total_interviews",
        "completion_rate",
        "total_actions",
      ])
    ),
    regions: z.array(z.number()).nullable(),
    businessUnits: z.array(z.number()).nullable(),
    sites: z.array(z.number()).nullable(),
    roles: z.array(z.number()).nullable(),
    workGroups: z.array(z.number()).nullable(),
    assetGroups: z.array(z.number()).nullable(),
  }),
});

// Desktop filters response schema
const DesktopHeatmapFiltersDataSchema = z.object({
  options: z.object({
    assessments: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    ),
    axes: z.array(AxisOptionSchema),
    aggregationMethods: z.array(z.enum(["average", "sum", "count"])),
    measurements: z.array(MeasurementDetailSchema),
  }),
});

// Union type for heatmap filters response
export const HeatmapFiltersResponseSchema = z.object({
  success: z.boolean(),
  data: z.union([
    OnsiteHeatmapFiltersDataSchema,
    DesktopHeatmapFiltersDataSchema,
  ]),
});

// Geographical map response schemas
const GeographicalMapPointSchema = z.object({
  name: z.string(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  region: z.string(),
  businessUnit: z.string(),
  score: z.number(),
  interviews: z.number(),
  totalActions: z.number(),
  completionRate: z.number(),
});

export const GeographicalMapResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(GeographicalMapPointSchema),
});

export const DesktopGeographicalMapResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(), // Desktop map has different structure
});

// Geographical map filters response schemas (separate for onsite and desktop)
const OnsiteGeographicalMapFiltersDataSchema = z.object({
  options: z.object({
    assessments: z.array(AssessmentOptionSchema),
    questionnaires: z.array(QuestionnaireOptionSchema),
  }),
});

const DesktopGeographicalMapFiltersDataSchema = z.object({
  options: z.object({
    assessments: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    ),
    measurements: z.array(MeasurementOptionSchema),
    aggregationMethods: z.array(z.enum(["average", "sum", "count"])),
  }),
});

export const GeographicalMapFiltersResponseSchema = z.object({
  success: z.boolean(),
  data: z.union([
    OnsiteGeographicalMapFiltersDataSchema,
    DesktopGeographicalMapFiltersDataSchema,
  ]),
});

// Program interview heatmap schemas
const ProgramInterviewHeatmapDataPointSchema = z.object({
  section: z.string(),
  phaseTransition: z.string(),
  difference: z.number(),
  percentChange: z.number(),
  fromValue: z.number(),
  toValue: z.number(),
  fromPhase: z.string(),
  toPhase: z.string(),
  responseCountChange: z.number(),
  interviewCountChange: z.number(),
});

export const ProgramInterviewHeatmapResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    data: z.array(ProgramInterviewHeatmapDataPointSchema),
    transitions: z.array(z.string()),
    sections: z.array(z.string()),
    metadata: z.object({
      totalResponses: z.number(),
      totalInterviews: z.number(),
    }),
  }),
});

// Program measurements heatmap schemas
const ProgramMeasurementDataPointSchema = z.object({
  measurement: z.string(),
  phaseTransition: z.string(),
  difference: z.number(),
  percentChange: z.number(),
  fromValue: z.number(),
  toValue: z.number(),
  fromPhase: z.string(),
  toPhase: z.string(),
});

export const ProgramMeasurementsHeatmapResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    data: z.array(ProgramMeasurementDataPointSchema),
    measurements: z.array(z.string()),
    transitions: z.array(z.string()),
  }),
});

// Error response for routes that might return errors
export const AnalyticsErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

// Empty data response for program endpoints when no data
export const EmptyProgramDataResponseSchema = z.object({
  data: z.array(z.any()),
  transitions: z.array(z.any()).optional(),
  sections: z.array(z.any()).optional(),
  measurements: z.array(z.any()).optional(),
});

// Export all schemas as a collection
export const AnalyticsSchemas = {
  // Enums
  AssessmentTypeEnum,
  AxisTypeEnum,
  AxisTypeDesktopEnum,
  QuestionnaireTypeEnum,

  // Params
  ProgramIdParamsSchema,

  // Querystring
  HeatmapFiltersQuerystringSchema,
  OnsiteHeatmapQuerystringSchema,
  DesktopHeatmapQuerystringSchema,
  OnsiteGeographicalMapQuerystringSchema,
  DesktopGeographicalMapQuerystringSchema,
  GeographicalMapFiltersQuerystringSchema,
  ProgramInterviewsQuerystringSchema,

  // Responses
  HeatmapFiltersResponseSchema,
  OnsiteHeatmapResponseSchema,
  DesktopHeatmapResponseSchema,
  GeographicalMapResponseSchema,
  DesktopGeographicalMapResponseSchema,
  GeographicalMapFiltersResponseSchema,
  ProgramInterviewHeatmapResponseSchema,
  ProgramMeasurementsHeatmapResponseSchema,
  AnalyticsErrorResponseSchema,
  EmptyProgramDataResponseSchema,
};
