import { z } from "zod";
import { FeedbackType } from "../types/entities/feedback";

export const FeedbackTypeEnum: FeedbackType[] = [
  "bug",
  "feature",
  "general",
  "suggestion",
  "post_interview_survey",
] as const;

// Submit feedback request body schema
export const SubmitFeedbackBodySchema = z.object({
  message: z.string(),
  type: z.enum(FeedbackTypeEnum).optional(),
  page_url: z.string().optional(),
});

// Success response schema
export const FeedbackSuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Export all schemas as a collection
export const FeedbackSchemas = {
  SubmitFeedbackBodySchema,
  FeedbackSuccessResponseSchema,
};
