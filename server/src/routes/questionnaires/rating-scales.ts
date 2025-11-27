import { FastifyInstance } from "fastify";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";
import { NotFoundError } from "../../plugins/errorHandler.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  GetRatingScalesParamsSchema,
  GetRatingScalesResponseSchema,
  BatchRatingScalesParamsSchema,
  BatchRatingScalesBodySchema,
  BatchRatingScalesResponseSchema,
  CreateRatingScaleParamsSchema,
  CreateRatingScaleBodySchema,
  CreateRatingScaleResponseSchema,
  UpdateRatingScaleParamsSchema,
  UpdateRatingScaleBodySchema,
  UpdateRatingScaleResponseSchema,
  DeleteRatingScaleParamsSchema,
  DeleteRatingScaleResponseSchema,
} from "../../schemas/questionnaires/rating-scales.js";
import {
  Error403Schema,
  Error404Schema,
  Error500Schema,
} from "../../schemas/errors.js";

export async function ratingScalesRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:questionnaireId/rating-scales",
    schema: {
      description: "Get rating scales for a questionnaire",
      params: GetRatingScalesParamsSchema,
      response: {
        200: GetRatingScalesResponseSchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionnaireId } = request.params;
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const ratingScales =
        await questionnaireService.getRatingScalesByQuestionnaireId(
          questionnaireId
        );

      return {
        success: true,
        data: ratingScales,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:questionnaireId/rating-scales/batch",
    schema: {
      description: "Add multiple rating scales to a questionnaire at once",
      params: BatchRatingScalesParamsSchema,
      body: BatchRatingScalesBodySchema,
      response: {
        201: BatchRatingScalesResponseSchema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionnaireId } = request.params;
      const { scales } = request.body;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      await questionnaireService.checkQuestionnaireInUse(questionnaireId);

      const ratingScales = await questionnaireService.createRatingScalesBatch(
        questionnaireId,
        scales
      );

      return {
        success: true,
        data: ratingScales,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:questionnaireId/rating-scale",
    schema: {
      description: "Add a rating scale to a questionnaire",
      params: CreateRatingScaleParamsSchema,
      body: CreateRatingScaleBodySchema,
      response: {
        201: CreateRatingScaleResponseSchema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionnaireId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      await questionnaireService.checkQuestionnaireInUse(questionnaireId);

      const ratingScale = await questionnaireService.createRatingScale(
        questionnaireId,
        request.body
      );

      return {
        success: true,
        data: ratingScale,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/rating-scales/:ratingScaleId",
    schema: {
      description: "Update a rating scale in a questionnaire",
      params: UpdateRatingScaleParamsSchema,
      body: UpdateRatingScaleBodySchema,
      response: {
        200: UpdateRatingScaleResponseSchema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const { ratingScaleId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      // Get the rating scale to find its questionnaire_id
      const { data: existingRatingScale, error: fetchError } =
        await request.supabaseClient
          .from("questionnaire_rating_scales")
          .select("questionnaire_id")
          .eq("id", ratingScaleId)
          .eq("is_deleted", false)
          .single();

      if (fetchError || !existingRatingScale) {
        throw new NotFoundError("Rating scale not found");
      }

      await questionnaireService.checkQuestionnaireInUse(
        existingRatingScale.questionnaire_id
      );

      // Check if rating scale is being used by questions when modifying the value
      const body = request.body;
      const isValueUpdate = body.value !== undefined;

      if (isValueUpdate) {
        await questionnaireService.checkRatingScaleInUse(ratingScaleId);
      }

      const ratingScale = await questionnaireService.updateRatingScale(
        ratingScaleId,
        request.body
      );

      if (!ratingScale) {
        return reply.status(404).send({
          success: false,
          error: "Rating scale not found",
        });
      }

      return {
        success: true,
        data: ratingScale,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/rating-scales/:ratingScaleId",
    schema: {
      description: "Delete a rating scale from a questionnaire",
      params: DeleteRatingScaleParamsSchema,
      response: {
        200: DeleteRatingScaleResponseSchema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const { ratingScaleId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      // Get the rating scale to find its questionnaire_id
      const { data: existingRatingScale, error: fetchError } =
        await request.supabaseClient
          .from("questionnaire_rating_scales")
          .select("questionnaire_id")
          .eq("id", ratingScaleId)
          .eq("is_deleted", false)
          .single();

      if (fetchError || !existingRatingScale) {
        return reply.status(404).send({
          success: false,
          error: "Rating scale not found",
        });
      }

      await questionnaireService.checkQuestionnaireInUse(
        existingRatingScale.questionnaire_id
      );

      // Check if rating scale is being used by questions
      await questionnaireService.checkRatingScaleInUse(ratingScaleId);
      await questionnaireService.deleteRatingScale(ratingScaleId);

      return {
        success: true,
        message: "Rating scale deleted successfully",
      };
    },
  });
}
