import { z } from "zod";

// POST create interviews for a program phase
export const CreateInterviewsParamsSchema = z.object({
  programId: z.coerce.number(),
});

export const CreateInterviewsBodySchema = z.object({
  phaseId: z.number(),
  isIndividual: z.boolean().default(false).optional(),
  roleIds: z.array(z.number()).min(1),
  contactIds: z.array(z.number()),
  interviewType: z.enum(["onsite", "presite"]),
});

export const CreateInterviewsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    success: z.boolean(),
    message: z.string(),
    interviewsCreated: z.number(),
  }),
});

// Error response schema for 400 validation errors
export const CreateInterviewsError400Schema = z.object({
  success: z.boolean(),
  error: z.string(),
});
