import { z } from "zod";
import {
  ProgramMeasurementWithDefinitionSchema,
  MeasurementDefinitionLimitedSchema,
  MeasurementDefinitionFullSchema,
  ProgramMeasurementRowSchema,
  CalculatedMeasurementWithLocationSchema,
  CalculatedMeasurementWithDefinitionSchema,
} from "./index.js";

// GET measurements for a program
export const GetMeasurementsParamsSchema = z.object({
  programId: z.coerce.number(),
});

export const GetMeasurementsQuerySchema = z.object({
  includeDefinitions: z.coerce.boolean().default(false).optional(),
});

export const GetMeasurementsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ProgramMeasurementWithDefinitionSchema),
});

// GET allowed measurement definitions
export const GetAllowedMeasurementDefinitionsParamsSchema = z.object({
  programId: z.coerce.number(),
});

export const GetAllowedMeasurementDefinitionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(MeasurementDefinitionLimitedSchema),
});

// GET available measurements
export const GetAvailableMeasurementsParamsSchema = z.object({
  programId: z.coerce.number(),
});

export const GetAvailableMeasurementsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(MeasurementDefinitionFullSchema),
});

// POST add measurement definitions
export const AddMeasurementDefinitionsParamsSchema = z.object({
  programId: z.coerce.number(),
});

export const AddMeasurementDefinitionsBodySchema = z.object({
  measurementDefinitionIds: z.array(z.number()),
});

export const AddMeasurementDefinitionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ProgramMeasurementRowSchema),
});

// DELETE remove measurement definition
export const RemoveMeasurementDefinitionParamsSchema = z.object({
  programId: z.coerce.number(),
  measurementDefinitionId: z.coerce.number(),
});

export const RemoveMeasurementDefinitionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// GET calculated measurements for a phase
export const GetCalculatedMeasurementsParamsSchema = z.object({
  programId: z.coerce.number(),
  phaseId: z.coerce.number(),
});

export const GetCalculatedMeasurementsQuerySchema = z.object({
  measurementDefinitionId: z.coerce.number().optional(),
  location_type: z.string().optional(),
  location_id: z.coerce.number().optional(),
});

export const GetCalculatedMeasurementsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CalculatedMeasurementWithLocationSchema),
});

// GET single calculated measurement
export const GetCalculatedMeasurementParamsSchema = z.object({
  programId: z.coerce.number(),
  phaseId: z.coerce.number(),
});

export const GetCalculatedMeasurementQuerySchema = z.object({
  measurementId: z.coerce.number().optional(),
  measurementDefinitionId: z.coerce.number().optional(),
  location_id: z.coerce.number().optional(),
  location_type: z.string().optional(),
});

export const GetCalculatedMeasurementResponseSchema = z.object({
  success: z.boolean(),
  data: CalculatedMeasurementWithDefinitionSchema.nullable(),
});

// POST create measurement data
// Supports both old format (separate location fields) and new format (location object)
export const CreateMeasurementDataParamsSchema = z.object({
  programId: z.coerce.number(),
  phaseId: z.coerce.number(),
});

const LocationTypeEnum = z.enum([
  "business_unit",
  "region",
  "site",
  "asset_group",
  "work_group",
  "role",
]);

const LocationObjectSchema = z.object({
  id: z.number(),
  type: LocationTypeEnum,
});

export const CreateMeasurementDataBodySchema = z.object({
  measurement_definition_id: z.number(),
  calculated_value: z.number(),
  // New format: location object
  location: LocationObjectSchema.optional(),
  // Old format: separate fields (backward compatibility)
  business_unit_id: z.number().optional(),
  region_id: z.number().optional(),
  site_id: z.number().optional(),
  asset_group_id: z.number().optional(),
  work_group_id: z.number().optional(),
  role_id: z.number().optional(),
});

export const CreateMeasurementDataResponseSchema = z.object({
  success: z.boolean(),
  data: CalculatedMeasurementWithDefinitionSchema,
});

// PUT update measurement data
export const UpdateMeasurementDataParamsSchema = z.object({
  programId: z.coerce.number(),
  phaseId: z.coerce.number(),
  measurementId: z.coerce.number(),
});

export const UpdateMeasurementDataBodySchema = z.object({
  calculated_value: z.number(),
});

export const UpdateMeasurementDataResponseSchema = z.object({
  success: z.boolean(),
  data: CalculatedMeasurementWithDefinitionSchema,
});

// DELETE measurement data
export const DeleteMeasurementDataParamsSchema = z.object({
  programId: z.coerce.number(),
  phaseId: z.coerce.number(),
  measurementId: z.coerce.number(),
});

export const DeleteMeasurementDataResponseSchema = z.object({
  success: z.boolean(),
});
