import {
  AssessmentStatus,
  AssessmentType,
} from "../types/entities/assessments";
import { z } from "zod";

export const AssessmentStatusEnum: AssessmentStatus[] = [
  "draft",
  "active",
  "under_review",
  "completed",
  "archived",
];

export const AssessmentTypeEnum: AssessmentType[] = ["onsite", "desktop"];

export type AssessmentMeasurementDefinitionStatus =
  | "in_use"
  | "available"
  | "unavailable";

export const AssessmentMeasurementDefinitionStatusEnum: AssessmentMeasurementDefinitionStatus[] =
  ["in_use", "available", "unavailable"];

export const AssessmentMeasurementDefinition = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  objective: z.string().nullable(),
  active: z.boolean(),
  is_in_use: z.boolean(),
  instance_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  status: z.enum(AssessmentMeasurementDefinitionStatusEnum),
  // Details
  calculation: z.string().nullable(),
  calculation_type: z.string().nullable(),
  provider: z.string().nullable(),
  unit: z.string().nullable(),
  min_value: z.number().nullable(),
  max_value: z.number().nullable(),
  required_csv_columns: z
    .array(
      z.object({
        name: z.string(),
        data_type: z.string(),
        description: z.string().nullable(),
      })
    )
    .nullable(),
});

export const AssessmentMeasurementDefinitionsSchema = z.object({
  success: z.boolean(),
  data: z.array(AssessmentMeasurementDefinition),
});
