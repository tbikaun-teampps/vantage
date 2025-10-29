import { z } from "zod";

/**
 * Zod schema for boolean scoring configuration
 * Validates that true and false both map to rating scale level values (integers >= 1)
 */
const BooleanScoringSchema = z.object({
  true: z
    .number()
    .int("Level must be an integer")
    .min(1, "Level must be at least 1"),
  false: z
    .number()
    .int("Level must be an integer")
    .min(1, "Level must be at least 1"),
});

/**
 * Zod schema for labelled scale scoring configuration
 * Validates that all labels map to rating scale level values (integers >= 1)
 */
const LabelledScaleScoringSchema = z.record(
  z.string(),
  z
    .number()
    .int("Level must be an integer")
    .min(1, "Level must be at least 1")
);

/**
 * Zod schema for numeric range
 */
const NumericRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  level: z
    .number()
    .int("Level must be an integer")
    .min(1, "Level must be at least 1"),
});

/**
 * Zod schema for numeric scoring configuration
 * Validates array of ranges with overlap and gap checking
 */
const NumericScoringSchema = z
  .array(NumericRangeSchema)
  .min(1, "At least one range is required")
  .refine(
    (ranges) => {
      // Check for overlapping ranges
      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];

        // Check min <= max
        if (range.min > range.max) {
          return false;
        }

        // Check for overlaps with other ranges
        for (let j = i + 1; j < ranges.length; j++) {
          const otherRange = ranges[j];
          if (
            (range.min >= otherRange.min && range.min <= otherRange.max) ||
            (range.max >= otherRange.min && range.max <= otherRange.max) ||
            (otherRange.min >= range.min && otherRange.min <= range.max)
          ) {
            return false;
          }
        }
      }
      return true;
    },
    {
      message: "Ranges must not overlap and min must be less than or equal to max",
    }
  );

/**
 * Union schema for all scoring types
 */
const PartScoringSchema = z.union([
  BooleanScoringSchema,
  LabelledScaleScoringSchema,
  NumericScoringSchema,
]);

/**
 * Schema for complete weighted scoring configuration
 */
export const WeightedScoringConfigSchema = z.object({
  version: z.literal("weighted"),
  partScoring: z.record(
    z.string(), // partId
    PartScoringSchema
  ).refine(
    (partScoring) => Object.keys(partScoring).length > 0,
    {
      message: "At least one question part must have scoring configured",
    }
  ),
});

/**
 * Infer TypeScript type from Zod schema
 */
export type WeightedScoringConfig = z.infer<typeof WeightedScoringConfigSchema>;

/**
 * Validate weighted scoring configuration
 * @param data - The configuration to validate
 * @returns Validated configuration or throws ZodError
 */
export function validateWeightedScoringConfig(
  data: unknown
): WeightedScoringConfig {
  return WeightedScoringConfigSchema.parse(data);
}

/**
 * Safe validation that returns success/error result
 * @param data - The configuration to validate
 * @returns Object with success flag and either data or error
 */
export function safeValidateWeightedScoringConfig(data: unknown): {
  success: boolean;
  data?: WeightedScoringConfig;
  error?: z.ZodError;
} {
  const result = WeightedScoringConfigSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Format Zod validation errors into user-friendly messages
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}
