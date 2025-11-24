import { z } from "zod";
import {
  ProgramPhaseStatus,
  ProgramStatus,
} from "../../types/entities/programs";
import { MeasurementProviderEnum } from "../shared";

export const ProgramStatusEnum: ProgramStatus[] = [
  "draft",
  "active",
  "under_review",
  "completed",
  "archived",
];

export const ProgramPhaseStatusEnum: ProgramPhaseStatus[] = [
  "scheduled",
  "in_progress",
  "completed",
  "archived",
];

// Full programs table row
export const ProgramRowSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.enum(ProgramStatusEnum),
  current_sequence_number: z.number(),
  presite_questionnaire_id: z.number().nullable(),
  onsite_questionnaire_id: z.number().nullable(),
  company_id: z.string(),
  created_by: z.string(),
  is_demo: z.boolean(),
});

// Full program_phases table row
export const ProgramPhaseRowSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  name: z.string().nullable(),
  status: z.enum(ProgramPhaseStatusEnum),
  notes: z.string().nullable(),
  planned_start_date: z.string().nullable(),
  actual_start_date: z.string().nullable(),
  planned_end_date: z.string().nullable(),
  actual_end_date: z.string().nullable(),
  program_id: z.number(),
  sequence_number: z.number(),
  locked_for_analysis_at: z.string().nullable(),
  created_by: z.string(),
});

// Full program_objectives table row
export const ProgramObjectiveRowSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  program_id: z.number(),
  created_by: z.string(),
});

// Full program_measurements table row (junction table)
export const ProgramMeasurementRowSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  program_id: z.number(),
  measurement_definition_id: z.number(),
  created_by: z.string(),
});

// Full measurement_definitions table row
export const MeasurementDefinitionFullSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  calculation_type: z.string().nullable(),
  required_csv_columns: z.any().nullable(), // JSON field
  provider: z.enum(MeasurementProviderEnum).nullable(),
  objective: z.string().nullable(),
  unit: z.string().nullable(),
  min_value: z.number().nullable(),
  max_value: z.number().nullable(),
  calculation: z.string().nullable(),
  active: z.boolean(),
});

// Basic measurement_definition (subset of fields)
export const MeasurementDefinitionBasicSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  calculation_type: z.string().nullable(),
  required_csv_columns: z.any().nullable(), // JSON field
  provider: z.enum(MeasurementProviderEnum).nullable(),
  min_value: z.number().nullable(),
  max_value: z.number().nullable(),
  unit: z.string().nullable(),
});

// Measurement definition with only select fields
export const MeasurementDefinitionLimitedSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  objective: z.string().nullable(),
});

// Full measurements_calculated table row with nested relations
export const CalculatedMeasurementWithDefinitionSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  program_phase_id: z.number().nullable(),
  assessment_id: z.number().nullable(),
  measurement_definition_id: z.number(),
  calculated_value: z.number(),
  created_by: z.string(),
  data_source: z.string().nullable(),
  business_unit_id: z.number().nullable(),
  region_id: z.number().nullable(),
  site_id: z.number().nullable(),
  asset_group_id: z.number().nullable(),
  work_group_id: z.number().nullable(),
  role_id: z.number().nullable(),
  calculation_metadata: z.any().nullable(), // JSON field
  measurement_definition: MeasurementDefinitionBasicSchema,
});

// Calculated measurement with location context and all nested relations
export const CalculatedMeasurementWithLocationSchema =
  CalculatedMeasurementWithDefinitionSchema.extend({
    business_unit: z.object({ id: z.number(), name: z.string() }).nullable(),
    region: z.object({ id: z.number(), name: z.string() }).nullable(),
    site: z.object({ id: z.number(), name: z.string() }).nullable(),
    asset_group: z.object({ id: z.number(), name: z.string() }).nullable(),
    work_group: z.object({ id: z.number(), name: z.string() }).nullable(),
    role: z
      .object({
        id: z.number(),
        shared_role: z.object({ id: z.number(), name: z.string() }).nullable(),
      })
      .nullable(),
    location_context: z.string(),
  });

// Program measurement with optional nested definition
export const ProgramMeasurementWithDefinitionSchema =
  ProgramMeasurementRowSchema.extend({
    measurement_definition: MeasurementDefinitionBasicSchema.optional(),
  });

// ============================================
// Route-specific Schemas
// ============================================

// GET all programs
export const GetProgramsQuerySchema = z.object({
  companyId: z.string(),
});

const ProgramListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  presite_questionnaire_id: z.number().nullable(),
  onsite_questionnaire_id: z.number().nullable(),
  measurements_count: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GetProgramsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ProgramListItemSchema),
});

// POST create a program
export const CreateProgramBodySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  company_id: z.string(),
});

export const CreateProgramResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    status: z.enum(ProgramStatusEnum),
    current_sequence_number: z.number(),
    presite_questionnaire_id: z.number().nullable(),
    onsite_questionnaire_id: z.number().nullable(),
  }),
});

// GET program by ID
export const GetProgramByIdParamsSchema = z.object({
  programId: z.coerce.number(),
});

const QuestionnaireBasicSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const ProgramPhaseSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  status: z.string(),
  notes: z.string().nullable(),
  planned_start_date: z.string().nullable(),
  actual_start_date: z.string().nullable(),
  planned_end_date: z.string().nullable(),
  actual_end_date: z.string().nullable(),
  program_id: z.number(),
  sequence_number: z.number(),
  locked_for_analysis_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

const ProgramDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  onsite_questionnaire_id: z.number().nullable(),
  presite_questionnaire_id: z.number().nullable(),
  company: z.object({
    id: z.string(),
    name: z.string(),
  }),
  program_objectives: z.array(z.object({ id: z.number() })),
  program_measurements: z.array(z.object({ id: z.number() })),
  presite_questionnaire: QuestionnaireBasicSchema.nullable(),
  onsite_questionnaire: QuestionnaireBasicSchema.nullable(),
  measurements_count: z.number(),
  objective_count: z.number(),
  objectives: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string().nullable(),
      created_at: z.string(),
      updated_at: z.string(),
    })
  ),
  created_at: z.string(),
  updated_at: z.string(),
  phases: z.array(ProgramPhaseSchema).nullable(),
});

export const GetProgramByIdResponseSchema = z.object({
  success: z.boolean(),
  data: ProgramDetailSchema,
});

// PUT update a program
export const UpdateProgramParamsSchema = z.object({
  programId: z.coerce.number(),
});

export const UpdateProgramBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  presite_questionnaire_id: z.number().nullable().optional(),
  onsite_questionnaire_id: z.number().nullable().optional(),
});

export const UpdateProgramResponseSchema = z.object({
  success: z.boolean(),
  data: ProgramRowSchema,
});
