import { z } from "zod";

// Body schema for creating a questionnaire section
export const CreateQuestionnaireSectionBodySchema = z.object({
  title: z.string(),
  questionnaire_id: z.number(),
});

// Response schema for creating a questionnaire section
export const CreateQuestionnaireSectionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    title: z.string(),
  }),
});

// Params, Body, and Response schema for updating a questionnaire section
export const UpdateQuestionnaireSectionParamsSchema = z.object({
  sectionId: z.coerce.number(),
});

export const UpdateQuestionnaireSectionBodySchema = z.object({
  title: z.string(),
});

export const UpdateQuestionnaireSectionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    title: z.string(),
  }),
});

// Params and Response schema for deleting a questionnaire section
export const DeleteQuestionnaireSectionParamsSchema = z.object({
  sectionId: z.coerce.number(),
});

export const DeleteQuestionnaireSectionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
