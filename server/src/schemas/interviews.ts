import { z } from "zod";
import { InterviewStatus } from "../types/entities/interviews";
import { QuestionPartAnswerTypeEnum } from "./questionnaires/questions";

export const InterviewStatusEnum: InterviewStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
];

export const InterviewSummarySchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      id: z.number(),
      name: z.string(),
      status: z.enum(InterviewStatusEnum),
      notes: z.string().nullable(),
      is_individual: z.boolean(),
      overview: z.string().nullable(),
      due_at: z.string().nullable(),
      interviewer: z
        .object({
          full_name: z.string().nullable(),
          email: z.email(),
        })
        .nullable(),
      interviewee: z
        .object({
          full_name: z.string().nullable(),
          email: z.email(),
        })
        .nullable(),
      assessment: z
        .object({
          id: z.number().nullable(),
          name: z.string(),
        })
        .nullable(),
      company: z
        .object({
          name: z.string(),
          icon_url: z.string().nullable(),
          branding: z
            .object({
              primary: z.string().nullable(),
              secondary: z.string().nullable(),
              accent: z.string().nullable(),
            })
            .nullable(),
        })
        .nullable(),
      interview_roles: z.array(
        z
          .object({
            role: z
              .object({
                id: z.number(),
                shared_role: z
                  .object({
                    name: z.string(),
                  })
                  .nullable(),
              })
              .nullable(),
          })
          .nullable()
      ),
    })
    .nullable(),
});

export const InterviewQuestion = z
  .object({
    id: z.number(),
    title: z.string(),
    context: z.string(),
    breadcrumbs: z.object({
      section: z.string(),
      step: z.string(),
      question: z.string(),
    }),
    question_text: z.string(),
    question_parts: z
      .array(
        z.object({
          id: z.number(),
          text: z.string(),
          order_index: z.number(),
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
        })
      )
      .optional(),
    response: z
      .object({
        id: z.number(),
        rating_score: z.number().nullable(),
        is_unknown: z.boolean(),
        question_part_responses: z
          .array(
            z.object({
              id: z.number(),
              answer_value: z.string(),
              question_part_id: z.number(),
            })
          )
          .optional(),
        response_roles: z.array(
          z.object({
            id: z.number(),
            role: z.object({
              id: z.number(),
            }),
          })
        ),
      })
      .nullable(),
    options: z
      .object({
        applicable_roles: z.record(
          z.string(),
          z.array(
            z.object({
              id: z.number(),
              shared_role_id: z.number(),
              name: z.string(),
              description: z.string().nullable(),
              path: z.string(),
            })
          )
        ),
        rating_scales: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            value: z.number(),
            description: z.string(),
          })
        ),
      })
      .optional(),
  })
  .nullable();

export const InterviewQuestionSchema = z.object({
  success: z.boolean(),
  data: InterviewQuestion,
});

export const IndividualInterviewSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      contact: z.object({
        id: z.number(),
        full_name: z.string(),
        email: z.string(),
      }),
      id: z.number(),
      questionnaire_id: z.number().nullable(),
      name: z.string(),
      notes: z.string().nullable(),
      status: z.enum(InterviewStatusEnum),
      is_individual: z.boolean(),
      enabled: z.boolean(),
      assessment_id: z.number().nullable(),
      created_at: z.string(),
      updated_at: z.string(),
    })
  ),
});
