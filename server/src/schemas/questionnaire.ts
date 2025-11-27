import { z } from "zod";
import { commonResponseSchemas } from "./common.js";
import { QuestionnaireStatus } from "../types/entities/questionnaires.js";

// Enum schemas
const QuestionnaireStatusEnum: QuestionnaireStatus[] = [
  "draft",
  "published",
  "under_review",
  "archived",
];

// Params schemas
const QuestionnaireIdParamsSchema = z.object({
  questionnaireId: z.string(),
});

// Body schemas
const QuestionnaireCreateBodySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  guidelines: z.string().optional(),
  company_id: z.string().optional(),
  status: z.enum(QuestionnaireStatusEnum).optional(),
});

const QuestionnaireUpdateBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  guidelines: z.string().optional(),
  status: z.enum(QuestionnaireStatusEnum).optional(),
});

// Response schemas
const QuestionnaireListItemSchema = z.object({
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
});

const QuestionRatingScaleSchema = z.object({
  id: z.number(),
  questionnaire_rating_scale_id: z.number(),
  description: z.string(),
});

const QuestionRoleSchema = z.object({
  id: z.number(),
  shared_role_id: z.number(),
  name: z.string(),
  description: z.string(),
});

const QuestionSchema = z.object({
  id: z.number(),
  question_text: z.string(),
  context: z.string(),
  order_index: z.number(),
  title: z.string(),
  question_rating_scales: z.array(QuestionRatingScaleSchema),
  question_roles: z.array(QuestionRoleSchema),
});

const StepSchema = z.object({
  id: z.number(),
  title: z.string(),
  expanded: z.boolean(),
  order_index: z.number(),
  questions: z.array(QuestionSchema),
});

const SectionSchema = z.object({
  id: z.number(),
  title: z.string(),
  order_index: z.number(),
  expanded: z.boolean(),
  steps: z.array(StepSchema),
});

const QuestionnaireRatingScaleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  value: z.number(),
  order_index: z.number(),
});

const QuestionnaireListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(QuestionnaireListItemSchema),
});

const QuestionnaireDetailResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    guidelines: z.string(),
    status: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    section_count: z.number(),
    step_count: z.number(),
    question_count: z.number(),
    sections: z.array(SectionSchema),
    questionnaire_rating_scales: z.array(QuestionnaireRatingScaleSchema),
  }),
});

const QuestionnaireCreateResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      guidelines: z.string(),
      status: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
    })
  ),
});

// Export all schemas
export const questionnaireSchemas = {
  params: {
    questionnaireId: QuestionnaireIdParamsSchema,
  },

  body: {
    create: QuestionnaireCreateBodySchema,
    update: QuestionnaireUpdateBodySchema,
  },

  responses: {
    questionnaireList: QuestionnaireListResponseSchema,
    questionnaireDetail: QuestionnaireDetailResponseSchema,
    questionnaireCreate: QuestionnaireCreateResponseSchema,

    ...commonResponseSchemas.responses,
  },
};
