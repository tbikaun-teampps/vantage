import { z } from "zod";
import { InterviewStatus } from "../types/entities/interviews";

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
            role: z.object({
              id: z.number(),
              shared_role: z
                .object({
                  name: z.string(),
                })
                .nullable(),
            }).nullable(),
          })
          .nullable()
      ),
    })
    .nullable(),
});
