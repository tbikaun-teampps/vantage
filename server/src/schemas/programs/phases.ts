import { z } from "zod";
import { ProgramPhaseRowSchema } from "./index.js";

// POST add a program phase
export const AddProgramPhaseParamsSchema = z.object({
  programId: z.coerce.number(),
});

export const AddProgramPhaseBodySchema = z.object({
  name: z.string(),
  planned_start_date: z.string(),
  planned_end_date: z.string(),
  activate: z.boolean().default(false).optional(),
});

export const AddProgramPhaseResponseSchema = z.object({
  success: z.boolean(),
  data: ProgramPhaseRowSchema,
});

// PUT update a program phase
export const UpdateProgramPhaseParamsSchema = z.object({
  programId: z.coerce.number(),
  phaseId: z.coerce.number(),
});

export const UpdateProgramPhaseBodySchema = z.object({
  name: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  planned_start_date: z.string().optional(),
  actual_start_date: z.string().optional(),
  planned_end_date: z.string().optional(),
  actual_end_date: z.string().optional(),
});

export const UpdateProgramPhaseResponseSchema = z.object({
  success: z.boolean(),
  data: ProgramPhaseRowSchema,
});

// DELETE a program phase
export const DeleteProgramPhaseParamsSchema = z.object({
  programId: z.coerce.number(),
  phaseId: z.coerce.number(),
});

export const DeleteProgramPhaseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
