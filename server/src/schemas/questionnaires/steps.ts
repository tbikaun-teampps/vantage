import { z } from "zod";

// Body schema for creating a questionnaire step
export const CreateQuestionnaireStepBodySchema = z.object({
  questionnaire_section_id: z.number(),
  title: z.string(),
});

// Response schema for creating a questionnaire step
export const CreateQuestionnaireStepResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    title: z.string(),
    questionnaire_section_id: z.number(),
    order_index: z.number(),
    is_deleted: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

// Params, Body, and Response schema for updating a questionnaire step
export const UpdateQuestionnaireStepParamsSchema = z.object({
  stepId: z.coerce.number(),
});

export const UpdateQuestionnaireStepBodySchema = z.object({
  title: z.string(),
});

export const UpdateQuestionnaireStepResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    title: z.string(),
    questionnaire_section_id: z.number(),
    order_index: z.number(),
    is_deleted: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

// Params and Response schema for deleting a questionnaire step
export const DeleteQuestionnaireStepParamsSchema = z.object({
  stepId: z.coerce.number(),
});

export const DeleteQuestionnaireStepResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
