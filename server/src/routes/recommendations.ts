import { FastifyInstance } from "fastify";
import { RecommendationsService } from "../services/RecommendationsService";
import type { Tables } from "../types/database";

type Recommendation = Tables<"recommendations">;

export async function recommendationsRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Recommendations"];
    }
  });
  fastify.get(
    "/:recommendationId",
    {
      schema: {
        description: "Get recommendation by ID",
        params: {
          type: "object",
          properties: {
            recommendationId: { type: "string" },
          },
          required: ["recommendationId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  content: { type: "string" },
                  context: { type: "string" },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                  status: {
                    type: "string",
                    enum: ["open", "in_progress", "closed"],
                  },
                  program_id: { type: "number" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request) => {
      const { recommendationId } = request.params as {
        recommendationId: string;
      };

      const recommendationService = new RecommendationsService(
        request.supabaseClient
      );
      const recommendation = await recommendationService.getRecommendationById(
        parseInt(recommendationId)
      );

      return {
        success: true,
        data: recommendation,
      };
    }
  );
  fastify.put(
    "/:recommendationId",
    {
      schema: {
        description: "Update recommendation by ID",
        params: {
          type: "object",
          properties: {
            recommendationId: { type: "string" },
          },
          required: ["recommendationId"],
        },
        body: {
          type: "object",
          properties: {
            content: { type: "string" },
            context: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high"] },
            status: {
              type: "string",
              enum: ["open", "in_progress", "closed"],
            },
            program_id: { type: "number" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request) => {
      const { recommendationId } = request.params as {
        recommendationId: string;
      };
      const updates = request.body as Partial<
        Pick<
          Recommendation,
          "content" | "context" | "priority" | "status" | "program_id"
        >
      >;

      const recommendationService = new RecommendationsService(
        request.supabaseClient
      );
      const updatedRecommendation =
        await recommendationService.updateRecommendation(
          parseInt(recommendationId),
          updates
        );

      return {
        success: true,
        data: updatedRecommendation,
      };
    }
  );
  fastify.delete(
    "/:recommendationId",
    {
      schema: {
        description: "Delete recommendation by ID",
        params: {
          type: "object",
          properties: {
            recommendationId: { type: "string" },
          },
          required: ["recommendationId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request) => {
      const { recommendationId } = request.params as {
        recommendationId: string;
      };
      const recommendationService = new RecommendationsService(
        request.supabaseClient
      );
      await recommendationService.deleteRecommendation(
        parseInt(recommendationId)
      );

      return {
        success: true,
        message: "Recommendation deleted successfully",
      };
    }
  );
}
