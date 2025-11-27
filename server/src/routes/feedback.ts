import { FastifyInstance } from "fastify";
import { FeedbackService } from "../services/FeedbackService";
import type { Database } from "../types/database";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  SubmitFeedbackBodySchema,
  FeedbackSuccessResponseSchema,
} from "../schemas/feedback";
import { Error400Schema, Error500Schema } from "../schemas/errors";

export async function feedbackRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Feedback"];
    }
  });

  // Submit feedback
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "",
    schema: {
      description: "Submit user feedback or error report",
      body: SubmitFeedbackBodySchema,
      response: {
        200: FeedbackSuccessResponseSchema,
        400: Error400Schema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const { message, type, page_url } = request.body;

      // Get page URL from request if not provided
      const feedbackPageUrl =
        page_url || request.headers.referer || request.headers.origin || "";

      const feedbackService = new FeedbackService(
        request.supabaseClient,
        request.user.id
      );

      await feedbackService.submitFeedback({
        message,
        type: type as Database["public"]["Enums"]["feedback_types"],
        page_url: feedbackPageUrl,
      });

      return reply.status(200).send({
        success: true,
        message: "Feedback submitted successfully",
      });
    },
  });
}
