import { z } from "zod";
import { MeasurementProvider } from "../types/entities/shared";

export const MeasurementProviderEnum: MeasurementProvider[] = ["SAP", "other"];

// Params schema for role ID
export const RoleIdParamsSchema = z.object({
  roleId: z.coerce.number(),
});

// Body schema for creating a role
export const CreateRoleBodySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  companyId: z.string(),
});

// Body schema for updating a role
export const UpdateRoleBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

// Schema for a shared role object
const SharedRoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string().nullable(),
});

// Schema for a shared role with read_only flag (GET response)
const SharedRoleWithReadOnlySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  read_only: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string().nullable(),
});

// Response schema for GET /roles
export const GetRolesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(SharedRoleWithReadOnlySchema),
});

// Response schema for POST /roles (201)
export const CreateRoleResponseSchema = z.object({
  success: z.boolean(),
  data: SharedRoleSchema,
});

// Response schema for PUT /roles/:roleId
export const UpdateRoleResponseSchema = z.object({
  success: z.boolean(),
  data: SharedRoleSchema,
});

// Simple success response schema for DELETE
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

// Params schema for measurement ID
export const MeasurementIdParamsSchema = z.object({
  id: z.coerce.number(),
});

// Schema for measurement definition object
export const MeasurementDefinitionSchema = z.object({
  id: z.number(),
  name: z.string(),
  active: z.boolean(),
  calculation: z.string().nullable(),
  calculation_type: z.string().nullable(),
  description: z.string().nullable(),
  max_value: z.number().nullable(),
  min_value: z.number().nullable(),
  unit: z.string().nullable(),
  objective: z.string().nullable(),
  provider: z.string().nullable(),
  required_csv_columns: z.array(
    z.object({
      name: z.string(),
      data_type: z.string(),
      description: z.string().nullable(),
    })
  ).nullable(), // Database returns Json type
  created_at: z.string(),
  updated_at: z.string(),
});

// Response schema for GET /measurement-definitions
export const GetMeasurementDefinitionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(MeasurementDefinitionSchema),
});

// Response schema for GET /measurement-definitions/:id
export const GetMeasurementDefinitionResponseSchema = z.object({
  success: z.boolean(),
  data: MeasurementDefinitionSchema,
});

// Export all schemas as a collection
export const SharedSchemas = {
  RoleIdParamsSchema,
  CreateRoleBodySchema,
  UpdateRoleBodySchema,
  GetRolesResponseSchema,
  CreateRoleResponseSchema,
  UpdateRoleResponseSchema,
  SuccessResponseSchema,
  MeasurementIdParamsSchema,
  GetMeasurementDefinitionsResponseSchema,
  GetMeasurementDefinitionResponseSchema,
};
