import { z } from "zod";
import { QuestionPartAnswerTypeEnum } from "./questions";
import { QuestionnaireStatus } from "../../types/entities/questionnaires";
import { WeightedScoringConfigSchema } from "../../validation/weighted-scoring-schema";

export const QuestionnaireStatusEnum: QuestionnaireStatus[] = [
  "draft",
  "published",
  "under_review",
  "archived",
];

export type QuestionnaireItemType = "section" | "step" | "question";
export const QuestionnaireItemTypeEnum: QuestionnaireItemType[] = [
  "section",
  "step",
  "question",
];

// Params and response schema for getting a questionnaire by ID
export const GetQuestionnaireByIdParamsSchema = z.object({
  questionnaireId: z.coerce.number(),
});

export const GetQuestionnaireByIdResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    guidelines: z.string().nullable(),
    status: z.enum(QuestionnaireStatusEnum),
    created_at: z.string(),
    updated_at: z.string(),
    section_count: z.number(),
    step_count: z.number(),
    question_count: z.number(),
    questionnaire_rating_scales: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().nullable(),
        value: z.number(),
        order_index: z.number(),
        questionnaire_id: z.number(),
      })
    ),
    sections: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        order_index: z.number(),
        question_count: z.number(),
        steps: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            order_index: z.number(),
            question_count: z.number(),
            questions: z.array(
              z.object({
                id: z.number(),
                title: z.string(),
                question_text: z.string(),
                context: z.string(),
                question_roles: z.array(
                  z.object({
                    id: z.number(),
                    description: z.string().nullable(),
                    shared_role_id: z.number(),
                    name: z.string(),
                  })
                ),
                rating_scale_mapping: WeightedScoringConfigSchema.nullable(),
                question_rating_scales: z.array(
                  z.object({
                    id: z.number(),
                    name: z.string(),
                    description: z.string().nullable(),
                    questionnaire_rating_scale_id: z.number(),
                    value: z.number(),
                  })
                ),
                question_parts: z
                  .array(
                    z.object({
                      id: z.number(),
                      text: z.string(),
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
                          z.object({})
                        ])
                        .nullable(),
                      order_index: z.number(),
                    })
                  )
                  .nullable(),
              })
            ),
          })
        ),
      })
    ),
  }),
});

// Body and response schema for creating a questionnaire
export const CreateQuestionnaireBodySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  guidelines: z.string().optional(),
  company_id: z.string(),
  status: z.enum(QuestionnaireStatusEnum).optional(),
});

export const CreateQuestionnaireResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    guidelines: z.string().nullable(),
    status: z.enum(QuestionnaireStatusEnum),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

// Param and response schema for deleting a questionnaire
export const DeleteQuestionnaireParamsSchema = z.object({
  questionnaireId: z.coerce.number(),
});

export const DeleteQuestionnaireResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Param, body and response schema for updating a questionnaire
export const UpdateQuestionnaireParamsSchema = z.object({
  questionnaireId: z.coerce.number(),
});

export const UpdateQuestionnaireBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  guidelines: z.string().optional(),
  status: z.enum(QuestionnaireStatusEnum).optional(),
});

export const UpdateQuestionnaireResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    guidelines: z.string().nullable(),
    status: z.enum(QuestionnaireStatusEnum),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

// Param and response schema for duplicating a questionnaire
export const DuplicateQuestionnaireParamsSchema = z.object({
  questionnaireId: z.coerce.number(),
});

export const DuplicateQuestionnaireResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    guidelines: z.string().nullable(),
    status: z.enum(QuestionnaireStatusEnum),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

// Response schema for importing a questionnaire
export const ImportQuestionnaireResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    guidelines: z.string().nullable(),
    status: z.enum(QuestionnaireStatusEnum),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

// Param and response schema for checking questionnaire usage
export const CheckQuestionnaireUsageParamsSchema = z.object({
  questionnaireId: z.coerce.number(),
});

export const CheckQuestionnaireUsageResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    assessmentCount: z.number(),
    assessments: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    ),
    interviewCount: z.number(),
    programCount: z.number(),
    programs: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    ),
    isInUse: z.boolean(),
  }),
});
