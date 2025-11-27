import { z } from "zod";

// Querystring schema for interview-related endpoints (invitation, reminder, summary)
export const InterviewIdQuerystringSchema = z.object({
  interviewId: z.coerce.number(),
});

// Body schema for team member invitation
export const InviteTeamMemberBodySchema = z.object({
  email: z.email(),
  name: z.string().optional(),
  role: z.string().optional(),
  company_name: z.string().optional(),
  invite_link: z.string().optional(),
});

// Body schema for test email
export const TestEmailBodySchema = z.object({
  to: z.email(),
  message: z.string().optional(),
});

// Success response schema with messageId
export const EmailSuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  messageId: z.string().optional(),
});

// Error response schema for 400 errors (no messageId, uses message field)
export const EmailErrorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Export all schemas as a collection
export const EmailSchemas = {
  InterviewIdQuerystringSchema,
  InviteTeamMemberBodySchema,
  TestEmailBodySchema,
  EmailSuccessResponseSchema,
  EmailErrorResponseSchema,
};
