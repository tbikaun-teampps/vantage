import { z } from "zod";

export const commonResponseSchemas = {
  successBoolean: z.object({
    success: z.boolean(),
  }),

  errorResponse: z.object({
    success: z.boolean(),
    error: z.string(),
  }),

  messageResponse: z.object({
    success: z.boolean(),
    message: z.string(),
  }),

  responses: {
    400: z.object({
      success: z.boolean(),
      error: z.string(),
    }),
    401: z.object({
      success: z.boolean(),
      error: z.string(),
    }),
    403: z.object({
      success: z.boolean(),
      error: z.string(),
    }),
    404: z.object({
      success: z.boolean(),
      error: z.string(),
    }),
    500: z.object({
      success: z.boolean(),
      error: z.string(),
    }),
  },
};
