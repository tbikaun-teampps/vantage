import { FastifyInstance } from "fastify";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  CreateQuestionBodySchema,
  CreateQuestionPartBodySchema,
  CreateQuestionPartParamsSchema,
  CreateQuestionPartResponseSchema,
  CreateQuestionResponseSchema,
  DeleteQuestionParamsSchema,
  DeleteQuestionPartParamsSchema,
  DeleteQuestionPartResponseSchema,
  DeleteQuestionResponseSchema,
  DuplicateQuestionParamsSchema,
  DuplicateQuestionPartParamsSchema,
  DuplicateQuestionPartResponseSchema,
  DuplicateQuestionResponseSchema,
  GetQuestionPartsParamsSchema,
  GetQuestionPartsResponseSchema,
  GetQuestionRatingScaleMappingParamsSchema,
  GetQuestionRatingScaleMappingResponseSchema,
  QuestionPart,
  ReorderQuestionPartsBodySchema,
  ReorderQuestionPartsParamsSchema,
  ReorderQuestionPartsResponseSchema,
  UpdateQuestionApplicableRolesBodySchema,
  UpdateQuestionApplicableRolesParamsSchema,
  UpdateQuestionApplicableRolesResponseSchema,
  UpdateQuestionBodySchema,
  UpdateQuestionParamsSchema,
  UpdateQuestionPartBodySchema,
  UpdateQuestionPartParamsSchema,
  UpdateQuestionPartResponseSchema,
  UpdateQuestionRatingScaleMappingBodySchema,
  UpdateQuestionRatingScaleMappingParamsSchema,
  UpdateQuestionRatingScaleMappingResponseSchema,
  UpdateQuestionResponseSchema,
} from "../../schemas/questionnaires/questions.js";
import {
  Error403Schema,
  Error404Schema,
  Error500Schema,
} from "../../schemas/errors.js";
import { z } from "zod";

export async function questionsRoutes(fastify: FastifyInstance) {
  // Create a new question in a step
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/questions",
    schema: {
      description: "Create a new questionnaire question",
      body: CreateQuestionBodySchema,
      response: {
        201: CreateQuestionResponseSchema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const data = request.body;

      const question = await questionnaireService.createQuestion(
        data.questionnaire_step_id,
        data
      );
      return {
        success: true,
        data: question,
      };
    },
  });

  // Update a question in a questionnaire
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/questions/:questionId",
    schema: {
      description: "Update a question in a questionnaire",
      params: UpdateQuestionParamsSchema,
      body: UpdateQuestionBodySchema,
      response: {
        200: UpdateQuestionResponseSchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const question = await questionnaireService.updateQuestion(
        questionId,
        request.body
      );

      return {
        success: true,
        data: question,
      };
    },
  });

  // Delete a question in a questionnaire
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/questions/:questionId",
    schema: {
      description: "Delete a question in a questionnaire",
      params: DeleteQuestionParamsSchema,
      response: {
        200: DeleteQuestionResponseSchema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const deleted = await questionnaireService.deleteQuestion(questionId);

      return {
        success: deleted,
        message: "Question deleted successfully",
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/questions/:questionId/duplicate",
    schema: {
      description: "Duplicate a question in a questionnaire",
      params: DuplicateQuestionParamsSchema,
      response: {
        201: DuplicateQuestionResponseSchema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const duplicatedQuestion =
        await questionnaireService.duplicateQuestion(questionId);

      return {
        success: true,
        data: duplicatedQuestion,
      };
    },
  });
  // Add rating scale to a question
  // DEPRECATED: in favor of adding all questionnaire rating scales to question
  // when the question is added. Users cannot control this at the question level anymore.
  // fastify.post(
  //   "/questions/:questionId/rating-scales",
  //   {
  //     schema: {
  //       description: "Add rating scale to a question",
  //       params: {
  //         type: "object",
  //         properties: {
  //           questionId: { type: "string" },
  //         },
  //         required: ["questionId"],
  //       },
  //       body: {
  //         type: "object",
  //         properties: {
  //           questionnaire_rating_scale_id: { type: "number" },
  //           description: { type: "string" },
  //         },
  //         required: ["questionnaire_rating_scale_id", "description"],
  //       },
  //       response: {
  //         // 201: {
  //         //   type: "object",
  //         //   properties: {
  //         //     success: { type: "boolean" },
  //         //     data: { type: "object" },
  //         //   },
  //         // },
  //         403: commonResponseSchemas.responses[403],
  //         404: commonResponseSchemas.responses[404],
  //         500: commonResponseSchemas.responses[500],
  //       },
  //     },
  //   },
  //   async (request) => {
  //     const { questionId } = request.params as {
  //       questionId: string;
  //     };

  //     const { questionnaire_rating_scale_id, description } = request.body as {
  //       questionnaire_rating_scale_id: number;
  //       description: string;
  //     };

  //     const questionnaireService = new QuestionnaireService(
  //       request.supabaseClient,
  //       request.user.id
  //     );

  //     // Get the question to find its questionnaire_id
  //     const { data: question, error: questionError } =
  //       await request.supabaseClient
  //         .from("questionnaire_questions")
  //         .select("questionnaire_id")
  //         .eq("id", parseInt(questionId))
  //         .eq("is_deleted", false)
  //         .single();

  //     if (questionError || !question) {
  //       throw new NotFoundError("Question not found");
  //     }

  //     await questionnaireService.checkQuestionnaireInUse(
  //       question.questionnaire_id
  //     );

  //     const ratingScale = await questionnaireService.addQuestionRatingScale(
  //       parseInt(questionId),
  //       questionnaire_rating_scale_id,
  //       description
  //     );

  //     if (!ratingScale) {
  //       throw new InternalServerError(
  //         "Failed to associate rating scale to question"
  //       );
  //     }

  //     return {
  //       success: true,
  //       data: ratingScale,
  //     };
  //   }
  // );

  // Update a question rating scale
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/questions/:questionId/rating-scales/:questionRatingScaleId",
    schema: {
      description: "Update a question rating scale",
      params: z.object({
        questionId: z.coerce.number(),
        questionRatingScaleId: z.coerce.number(),
      }),
      body: z.object({
        description: z.string(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            id: z.number(),
            description: z.string(),
            updated_at: z.string(),
          }),
        }),
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const ratingScale = await questionnaireService.updateQuestionRatingScale(
        request.params.questionRatingScaleId,
        request.body.description
      );

      return {
        success: true,
        data: ratingScale,
      };
    },
  });
  // Delete a question rating scale
  // DEPRECATED: users cannot control rating scales at question level anymore.
  // fastify.delete(
  //   "/questions/:questionId/rating-scales/:questionRatingScaleId",
  //   {
  //     schema: {
  //       description: "Delete a question rating scale",
  //       params: {
  //         type: "object",
  //         properties: {
  //           questionRatingScaleId: { type: "string" },
  //         },
  //         required: ["questionRatingScaleId"],
  //       },
  //       response: {
  //         200: commonResponseSchemas.messageResponse,
  //         403: commonResponseSchemas.responses[403],
  //         404: commonResponseSchemas.responses[404],
  //         500: commonResponseSchemas.responses[500],
  //       },
  //     },
  //   },
  //   async (request) => {
  //     const { questionRatingScaleId } = request.params as {
  //       questionRatingScaleId: string;
  //     };

  //     const questionnaireService = new QuestionnaireService(
  //       request.supabaseClient,
  //       request.user.id
  //     );

  //     // Get the question rating scale to find its questionnaire_id
  //     const { data: questionRatingScale, error: fetchError } =
  //       await request.supabaseClient
  //         .from("questionnaire_question_rating_scales")
  //         .select("questionnaire_id")
  //         .eq("id", parseInt(questionRatingScaleId))
  //         .eq("is_deleted", false)
  //         .single();

  //     if (fetchError || !questionRatingScale) {
  //       throw new NotFoundError("Question rating scale not found");
  //     }

  //     await questionnaireService.checkQuestionnaireInUse(
  //       questionRatingScale.questionnaire_id
  //     );

  //     await questionnaireService.deleteQuestionRatingScale(
  //       parseInt(questionRatingScaleId)
  //     );

  //     return {
  //       success: true,
  //       message: "Question rating scale deleted successfully",
  //     };
  //   }
  // );

  // Add all rating scales from questionnaire to a question
  // DEPRECATED: users cannot control rating scales at question level anymore.
  // These are added automatically when the question is created.
  // fastify.post(
  //   "/questions/:questionId/add-questionnaire-rating-scales",
  //   {
  //     schema: {
  //       description:
  //         "Add all rating scales from the questionnaire to a question",
  //       body: {
  //         type: "object",
  //         properties: {
  //           questionnaireId: { type: "number" },
  //           questionId: { type: "number" },
  //         },
  //         required: ["questionnaireId", "questionId"],
  //       },
  //       response: {
  //         201: {
  //           type: "object",
  //           properties: {
  //             success: { type: "boolean" },
  //             data: { type: "array", items: { type: "object" } },
  //           },
  //         },
  //         404: commonResponseSchemas.responses[404],
  //         500: commonResponseSchemas.responses[500],
  //       },
  //     },
  //   },
  //   async (request) => {
  //     const { questionnaireId, questionId } = request.body as {
  //       questionnaireId: number;
  //       questionId: number;
  //     };

  //     const questionnaireService = new QuestionnaireService(
  //       request.supabaseClient,
  //       request.user.id
  //     );

  //     await questionnaireService.checkQuestionnaireInUse(questionnaireId);

  //     const ratingScales =
  //       await questionnaireService.addQuestionnaireRatingScaleToQuestion(
  //         questionnaireId,
  //         questionId
  //       );

  //     if (!ratingScales) {
  //       throw new InternalServerError(
  //         "Failed to associate rating scales to question"
  //       );
  //     }

  //     return {
  //       success: true,
  //       data: ratingScales,
  //     };
  //   }
  // );

  // Update applicable roles for a question
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/questions/:questionId/applicable-roles",
    schema: {
      description: "Update applicable roles for a question",
      params: UpdateQuestionApplicableRolesParamsSchema,
      body: UpdateQuestionApplicableRolesBodySchema,
      response: {
        200: UpdateQuestionApplicableRolesResponseSchema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionId } = request.params;
      const { shared_role_ids } = request.body;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const updatedQuestion =
        await questionnaireService.updateQuestionApplicableRoles(
          questionId,
          shared_role_ids
        );

      return {
        success: true,
        data: updatedQuestion,
      };
    },
  });

  // Get all parts for a question
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/questions/:questionId/parts",
    schema: {
      params: GetQuestionPartsParamsSchema,
      response: {
        200: GetQuestionPartsResponseSchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const parts = await questionnaireService.getQuestionParts(questionId);
      const parsedParts = parts.map((part) => QuestionPart.parse(part));
      return {
        success: true,
        data: parsedParts,
      };
    },
  });

  // Create a new question part
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/questions/:questionId/parts",
    schema: {
      description: "Add a new question part to a question",
      params: CreateQuestionPartParamsSchema,
      body: CreateQuestionPartBodySchema,
      response: {
        201: CreateQuestionPartResponseSchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionId } = request.params;
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const part = await questionnaireService.createQuestionPart(
        questionId,
        request.body
      );

      const parsedData = QuestionPart.parse(part);

      return {
        success: true,
        data: parsedData,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/questions/:questionId/parts/:partId",
    schema: {
      params: UpdateQuestionPartParamsSchema,
      body: UpdateQuestionPartBodySchema,
      response: {
        200: UpdateQuestionPartResponseSchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { partId } = request.params;
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const part = await questionnaireService.updateQuestionPart(
        partId,
        request.body
      );

      const parsedData = QuestionPart.parse(part);
      return {
        success: true,
        data: parsedData,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/questions/:questionId/parts/:partId",
    schema: {
      description: "Delete a question part",
      params: DeleteQuestionPartParamsSchema,
      response: {
        200: DeleteQuestionPartResponseSchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { partId } = request.params as { partId: number };
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const success = await questionnaireService.deleteQuestionPart(partId);

      return {
        success,
        message: "Question part deleted successfully",
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/questions/:questionId/parts/:partId/duplicate",
    schema: {
      description: "Duplicate a question part",
      params: DuplicateQuestionPartParamsSchema,
      response: {
        201: DuplicateQuestionPartResponseSchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { partId } = request.params;
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const newPart = await questionnaireService.duplicateQuestionPart(partId);

      const parsedData = QuestionPart.parse(newPart);
      return {
        success: true,
        data: parsedData,
      };
    },
  });

  // Reorder question parts
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/questions/:questionId/parts/reorder",
    schema: {
      params: ReorderQuestionPartsParamsSchema,
      body: ReorderQuestionPartsBodySchema,
      response: {
        200: ReorderQuestionPartsResponseSchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionId } = request.params;
      const { partIdsInOrder } = request.body;
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      await questionnaireService.reorderQuestionParts(
        questionId,
        partIdsInOrder
      );

      return {
        success: true,
        message: "Question parts reordered successfully",
      };
    },
  });

  // Get question rating scale mapping
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/questions/:questionId/rating-scale-mapping",
    schema: {
      description: "Get the rating scale mapping for a question",
      params: GetQuestionRatingScaleMappingParamsSchema,
      response: {
        200: GetQuestionRatingScaleMappingResponseSchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const mapping =
        await questionnaireService.getQuestionRatingScaleMapping(questionId);

      return {
        success: true,
        data: mapping,
      };
    },
  });

  // Update question rating scale mapping
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/questions/:questionId/rating-scale-mapping",
    schema: {
      description: "Update the rating scale mapping for a question",
      params: UpdateQuestionRatingScaleMappingParamsSchema,
      body: UpdateQuestionRatingScaleMappingBodySchema,
      response: {
        200: UpdateQuestionRatingScaleMappingResponseSchema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionId } = request.params;
      const { rating_scale_mapping } = request.body;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const updatedQuestion =
        await questionnaireService.updateQuestionRatingScaleMapping(
          questionId,
          rating_scale_mapping
        );

      return {
        success: true,
        data: updatedQuestion,
      };
    },
  });
}
