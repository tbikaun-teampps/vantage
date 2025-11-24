import { FastifyInstance } from "fastify";
import { RecommendationsService } from "../services/RecommendationsService";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { Error404Schema, Error500Schema } from "../schemas/errors";
import {
  RecommendationPriorityEnum,
  RecommendationStatusEnum,
} from "../schemas/recommendations";

export async function recommendationsRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Recommendations"];
    }
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:recommendationId",
    schema: {
      description: "Get recommendation by ID",
      params: z.object({
        recommendationId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            id: z.number(),
            content: z.string(),
            context: z.string(),
            priority: z.enum(RecommendationPriorityEnum),
            status: z.enum(RecommendationStatusEnum),
            program_id: z.number().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
        }),
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const recommendationService = new RecommendationsService(
        request.supabaseClient
      );
      const recommendation = await recommendationService.getRecommendationById(
        request.params.recommendationId
      );

      return {
        success: true,
        data: recommendation,
      };
    },
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:recommendationId",
    schema: {
      description: "Update recommendation by ID",
      params: z.object({
        recommendationId: z.coerce.number(),
      }),
      body: z.object({
        content: z.string().optional(),
        context: z.string().optional(),
        priority: z.enum(RecommendationPriorityEnum).optional(),
        status: z.enum(RecommendationStatusEnum).optional(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            id: z.number(),
            content: z.string(),
            context: z.string(),
            priority: z.enum(RecommendationPriorityEnum),
            status: z.enum(RecommendationStatusEnum),
            program_id: z.number().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
        }),
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const recommendationService = new RecommendationsService(
        request.supabaseClient
      );
      const updatedRecommendation =
        await recommendationService.updateRecommendation(
          request.params.recommendationId,
          request.body
        );

      return {
        success: true,
        data: updatedRecommendation,
      };
    },
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:recommendationId",
    schema: {
      description: "Delete recommendation by ID",
      params: z.object({
        recommendationId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const recommendationService = new RecommendationsService(
        request.supabaseClient
      );
      await recommendationService.deleteRecommendation(
        request.params.recommendationId
      );

      return {
        success: true,
        message: "Recommendation deleted successfully",
      };
    },
  });
}
