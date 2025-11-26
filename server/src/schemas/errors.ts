import { z } from "zod";

const BaseErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string().optional(),
});


export const Error500Schema = BaseErrorSchema;
export const Error400Schema = BaseErrorSchema;
export const Error401Schema = BaseErrorSchema;
export const Error403Schema = BaseErrorSchema;
export const Error404Schema = BaseErrorSchema;

// Extended error schema that includes an array of validation errors
export const ValidationErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  errors: z.array(z.string()).optional(),
});