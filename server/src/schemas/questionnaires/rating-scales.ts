import { z } from "zod";

// Shared rating scale schema (matches database response)
const RatingScaleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  value: z.number(),
  order_index: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  company_id: z.string().optional(),
  created_by: z.string().optional(),
  deleted_at: z.string().nullable().optional(),
  is_deleted: z.boolean().optional(),
  questionnaire_id: z.number().optional(),
});

// GET /:questionnaireId/rating-scales
export const GetRatingScalesParamsSchema = z.object({
  questionnaireId: z.coerce.number(),
});

export const GetRatingScalesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(RatingScaleSchema),
});

// POST /:questionnaireId/rating-scales/batch
export const BatchRatingScalesParamsSchema = z.object({
  questionnaireId: z.coerce.number(),
});

export const BatchRatingScalesBodySchema = z.object({
  scales: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      value: z.number(),
      order_index: z.number(),
    })
  ),
});

export const BatchRatingScalesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(RatingScaleSchema),
});

// POST /:questionnaireId/rating-scale
export const CreateRatingScaleParamsSchema = z.object({
  questionnaireId: z.coerce.number(),
});

export const CreateRatingScaleBodySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  value: z.number(),
});

export const CreateRatingScaleResponseSchema = z.object({
  success: z.boolean(),
  data: RatingScaleSchema,
});

// PUT /rating-scales/:ratingScaleId
export const UpdateRatingScaleParamsSchema = z.object({
  ratingScaleId: z.coerce.number(),
});

export const UpdateRatingScaleBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  value: z.number().optional(),
  order_index: z.number().optional(),
});

export const UpdateRatingScaleResponseSchema = z.object({
  success: z.boolean(),
  data: RatingScaleSchema,
});

// DELETE /rating-scales/:ratingScaleId
export const DeleteRatingScaleParamsSchema = z.object({
  ratingScaleId: z.coerce.number(),
});

export const DeleteRatingScaleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
