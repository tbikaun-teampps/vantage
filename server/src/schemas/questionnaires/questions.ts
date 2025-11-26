import { z } from "zod";
import { WeightedScoringConfigSchema } from "../../validation/weighted-scoring-schema";
import { QuestionPartAnswerType } from "../../types/entities/questionnaires";

export const QuestionPartAnswerTypeEnum: QuestionPartAnswerType[] = [
  "number",
  "boolean",
  "scale",
  "labelled_scale",
  "percentage",
];

// Body and response for creating a question
export const CreateQuestionBodySchema = z.object({
  questionnaire_step_id: z.number(),
  title: z.string(),
  question_text: z.string(),
  context: z.string().optional(),
});

export const CreateQuestionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    title: z.string(),
    question_text: z.string(),
    context: z.string(),
    order_index: z.number(),
    questionnaire_step_id: z.number(),
    question_rating_scales: z.array(
      z.object({
        id: z.number(),
        description: z.string(),
        questionnaire_rating_scale_id: z.number(),
        questionnaire_question_id: z.number(),
        name: z.string(),
        value: z.number(),
      })
    ),
  }),
});

// Param, body and response schemas for updating a question
export const UpdateQuestionParamsSchema = z.object({
  questionId: z.coerce.number(),
});

export const UpdateQuestionBodySchema = z.object({
  title: z.string().optional(),
  question_text: z.string().optional(),
  context: z.string().optional(),
  order_index: z.number().optional(),
});

export const UpdateQuestionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    title: z.string(),
    question_text: z.string(),
    context: z.string().nullable(),
    order_index: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

// Param and response schemas for deleting a question
export const DeleteQuestionParamsSchema = z.object({
  questionId: z.coerce.number(),
});

export const DeleteQuestionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Param and response schemas for duplicating a question
export const DuplicateQuestionParamsSchema = z.object({
  questionId: z.coerce.number(),
});

export const DuplicateQuestionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    questionnaire_step_id: z.number(),
    title: z.string(),
    question_text: z.string(),
    context: z.string().nullable(),
    order_index: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

// Param, body and response schemas for updating applicable roles for a question
export const UpdateQuestionApplicableRolesParamsSchema = z.object({
  questionId: z.coerce.number(),
});

export const UpdateQuestionApplicableRolesBodySchema = z.object({
  shared_role_ids: z.array(z.number()),
});

export const UpdateQuestionApplicableRolesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      id: z.number(),
      shared_role_id: z.number(),
      name: z.string(),
      description: z.string().nullable(),
      questionnaire_question_id: z.number(),
    })
  ),
});

// Param and response schemas for getting a questions parts (elements)
export const GetQuestionPartsParamsSchema = z.object({
  questionId: z.coerce.number(),
});

const QuestionPart = z.object({
  id: z.number(),
  answer_type: z.enum(QuestionPartAnswerTypeEnum),
  options: z
    .union([
      z.object({
        labels: z.array(z.string()),
      }),
      z.object({
        max: z.number(),
        min: z.number(),
        step: z.number(),
      }),
      z.object({
        max: z.number(),
        min: z.number(),
        decimal_places: z.number().optional(),
      }),
      z.object({}), // Empty object for answer types that don't require options (e.g., boolean)
    ])
    .nullable(),
  order_index: z.number(),
  text: z.string(),
});

export const GetQuestionPartsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(QuestionPart),
});

// Param, body and response schemas for creating a question part (element)
export const CreateQuestionPartParamsSchema = z.object({
  questionId: z.coerce.number(),
});

export const CreateQuestionPartBodySchema = z.object({
  text: z.string(),
  order_index: z.number(),
  answer_type: z.enum(QuestionPartAnswerTypeEnum),
  options: z.any().default({}),
});

export const CreateQuestionPartResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    questionnaire_question_id: z.number(),
    answer_type: z.enum(QuestionPartAnswerTypeEnum),
    text: z.string(),
    options: z
      .union([
        z.object({
          labels: z.array(z.string()),
        }),
        z.object({
          max: z.number(),
          min: z.number(),
          step: z.number(),
        }),
        z.object({
          max: z.number(),
          min: z.number(),
          decimal_places: z.number().optional(),
        }),
      ])
      .nullable(),
    order_index: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

// Param, body and response schemas for updating a question part (element)
export const UpdateQuestionPartParamsSchema = z.object({
  questionId: z.coerce.number(),
  partId: z.coerce.number(),
});

export const UpdateQuestionPartBodySchema = z.object({
  text: z.string().optional(),
  order_index: z.number().optional(),
  answer_type: z.enum(QuestionPartAnswerTypeEnum).optional(),
  options: z
    .union([
      z.object({
        labels: z.array(z.string()),
      }),
      z.object({
        max: z.number(),
        min: z.number(),
        step: z.number(),
      }),
      z.object({
        max: z.number(),
        min: z.number(),
        decimal_places: z.number().optional(),
      }),
    ])
    .optional(),
});

export const UpdateQuestionPartResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    questionnaire_question_id: z.number(),
    answer_type: z.enum(QuestionPartAnswerTypeEnum),
    text: z.string(),
    options: z
      .union([
        z.object({
          labels: z.array(z.string()),
        }),
        z.object({
          max: z.number(),
          min: z.number(),
          step: z.number(),
        }),
        z.object({
          max: z.number(),
          min: z.number(),
          decimal_places: z.number().optional(),
        }),
      ])
      .nullable(),
    order_index: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

// Param and response schemas for deleting a question part (element)
export const DeleteQuestionPartParamsSchema = z.object({
  questionId: z.coerce.number(),
  partId: z.coerce.number(),
});

export const DeleteQuestionPartResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Param and response schemas for duplicating a question part (element)
export const DuplicateQuestionPartParamsSchema = z.object({
  questionId: z.coerce.number(),
  partId: z.coerce.number(),
});

export const DuplicateQuestionPartResponseSchema = z.object({
  success: z.boolean(),
  data: QuestionPart,
});

// Param, body and response schemas for reordering question parts (elements)
export const ReorderQuestionPartsParamsSchema = z.object({
  questionId: z.coerce.number(),
});

export const ReorderQuestionPartsBodySchema = z.object({
  questionId: z.number(),
  partIdsInOrder: z.array(z.number()),
});

export const ReorderQuestionPartsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Param and response schemas for getting question rating scale mapping
export const GetQuestionRatingScaleMappingParamsSchema = z.object({
  questionId: z.coerce.number(),
});

export const GetQuestionRatingScaleMappingResponseSchema = z.object({
  success: z.boolean(),
  data: WeightedScoringConfigSchema.nullable(),
});

// Param, body and response schemas for updating question rating scale mapping
export const UpdateQuestionRatingScaleMappingParamsSchema = z.object({
  questionId: z.coerce.number(),
});

export const UpdateQuestionRatingScaleMappingBodySchema = z.object({
  rating_scale_mapping: WeightedScoringConfigSchema,
});

export const UpdateQuestionRatingScaleMappingResponseSchema = z.object({
  success: z.boolean(),
  data: WeightedScoringConfigSchema,
});
