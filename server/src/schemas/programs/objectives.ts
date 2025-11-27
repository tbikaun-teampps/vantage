import { z } from "zod";
import { ProgramObjectiveRowSchema } from "./index.js";

// GET objectives for a program
export const GetObjectivesParamsSchema = z.object({
  programId: z.coerce.number(),
});

const ObjectiveSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GetObjectivesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ObjectiveSchema),
});

// POST create objective for a program
export const CreateObjectiveParamsSchema = z.object({
  programId: z.coerce.number(),
});

export const CreateObjectiveBodySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const CreateObjectiveResponseSchema = z.object({
  success: z.boolean(),
  data: ProgramObjectiveRowSchema,
});

// PUT update objective
export const UpdateObjectiveParamsSchema = z.object({
  programId: z.coerce.number(),
  objectiveId: z.coerce.number(),
});

export const UpdateObjectiveBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const UpdateObjectiveResponseSchema = z.object({
  success: z.boolean(),
  data: ProgramObjectiveRowSchema,
});

// DELETE objective
export const DeleteObjectiveParamsSchema = z.object({
  programId: z.coerce.number(),
  objectiveId: z.coerce.number(),
});

export const DeleteObjectiveResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// GET objective count
export const GetObjectiveCountParamsSchema = z.object({
  programId: z.coerce.number(),
});

export const GetObjectiveCountResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    count: z.number(),
  }),
});
