import { FastifyInstance } from "fastify";
import { commonResponseSchemas } from "../../schemas/common.js";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";
import {
  CreateQuestionnaireQuestionData,
  UpdateQuestionnaireQuestionData,
  CreateQuestionPartData,
  UpdateQuestionPartData,
} from "../../types/entities/questionnaires.js";
import {
  InternalServerError,
  NotFoundError,
} from "../../plugins/errorHandler.js";

/**
 * Validate question part options based on answer type
 * - Boolean: { true_label: string, false_label: string }
 * - Number: { min: number, max: number, decimal_places: number }
 * - Percentage: { } - uses 0-100 by default
 * - Scale : { min: number, max: number, step: number }
 * - Labelled Scale: { labels: Array<{ value: number, label: string }> }
 *
 * @param answerType
 * @param options
 */
function validateQuestionPartOptions(answerType: string, options: any): void {
  switch (answerType) {
    case "labelled_scale":
      if (
        !options ||
        !Array.isArray((options as any).labels) ||
        (options as any).labels.length === 0
      ) {
        throw new Error(
          "Invalid options for labelled_scale. 'labels' array is required."
        );
      }
      break;
    case "scale":
      if (
        !options ||
        typeof (options as any).min !== "number" ||
        typeof (options as any).max !== "number" ||
        typeof (options as any).step !== "number"
      ) {
        throw new Error(
          "Invalid options for scale. 'min', 'max', and 'step' numbers are required."
        );
      }
      break;
    case "boolean":
      if (
        !options ||
        typeof (options as any).true_label !== "string" ||
        typeof (options as any).false_label !== "string"
      ) {
        throw new Error(
          "Invalid options for boolean. 'true_label' and 'false_label' strings are required."
        );
      }
      break;
    case "number":
      if (
        !options ||
        typeof (options as any).min !== "number" ||
        typeof (options as any).max !== "number" ||
        typeof (options as any).decimal_places !== "number"
      ) {
        throw new Error(
          "Invalid options for number. 'min', 'max', and 'decimal_places' numbers are required."
        );
      }
      break;
    case "percentage":
      // No specific options required
      break;
    case "text":
      // No specific options required
      break;
    default:
      throw new Error("Invalid answer type");
  }
}

export async function questionsRoutes(fastify: FastifyInstance) {
  // Create a new question in a step
  fastify.post(
    "/questions",
    {
      schema: {
        description: "Create a new question in a step",
        body: {
          type: "object",
          properties: {
            questionnaire_step_id: { type: "number" },
            title: { type: "string" },
            question_text: { type: "string" },
            context: { type: "string" },
            order_index: { type: "number" },
          },
          required: ["questionnaire_step_id", "question_text"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
            },
          },
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const data = request.body as CreateQuestionnaireQuestionData;

      // Get the step to find its questionnaire_id
      const { data: step, error: stepError } = await request.supabaseClient
        .from("questionnaire_steps")
        .select("questionnaire_id")
        .eq("id", data.questionnaire_step_id)
        .eq("is_deleted", false)
        .single();

      if (stepError || !step) {
        throw new NotFoundError("Step not found");
      }

      await questionnaireService.checkQuestionnaireInUse(step.questionnaire_id);

      const question = await questionnaireService.createQuestion(
        data.questionnaire_step_id,
        data
      );
      return {
        success: true,
        data: question,
      };
    }
  );

  // Update a question in a questionnaire
  fastify.put(
    "/questions/:questionId",
    {
      schema: {
        description: "Update a question in a questionnaire",
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
          },
          required: ["questionId"],
        },
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            question_text: { type: "string" },
            context: { type: "string" },
            order_index: { type: "number" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  title: { type: "string" },
                  question_text: { type: "string" },
                  context: { type: "string" },
                  order_index: { type: "number" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                },
              },
            },
          },
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { questionId } = request.params as {
        questionId: string;
      };

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const question = await questionnaireService.updateQuestion(
        parseInt(questionId),
        request.body as UpdateQuestionnaireQuestionData
      );

      if (!question) {
        throw new NotFoundError("Question not found");
      }

      return {
        success: true,
        data: question,
      };
    }
  );

  // Delete a question in a questionnaire
  fastify.delete(
    "/questions/:questionId",
    {
      schema: {
        description: "Delete a question in a questionnaire",
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
          },
          required: ["questionId"],
        },
        response: {
          200: commonResponseSchemas.messageResponse,
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { questionId } = request.params as {
        questionId: string;
      };

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      // Get the question to find its questionnaire_id
      const { data: question, error: questionError } =
        await request.supabaseClient
          .from("questionnaire_questions")
          .select("questionnaire_id")
          .eq("id", parseInt(questionId))
          .eq("is_deleted", false)
          .single();

      if (questionError || !question) {
        throw new NotFoundError("Question not found");
      }

      await questionnaireService.checkQuestionnaireInUse(
        question.questionnaire_id
      );
      const deleted = await questionnaireService.deleteQuestion(
        parseInt(questionId)
      );

      if (!deleted) {
        throw new NotFoundError("Question not found");
      }

      return {
        success: true,
        message: "Question deleted successfully",
      };
    }
  );

  // Duplicate a question in a questionnaire
  fastify.post(
    "/questions/:questionId/duplicate",
    {
      schema: {
        description: "Duplicate a question in a questionnaire",
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
          },
          required: ["questionId"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
            },
          },
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { questionId } = request.params as {
        questionId: string;
      };

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      // Get the question to find its questionnaire_id
      const { data: question, error: questionError } =
        await request.supabaseClient
          .from("questionnaire_questions")
          .select("questionnaire_id")
          .eq("id", parseInt(questionId))
          .eq("is_deleted", false)
          .single();

      if (questionError || !question) {
        throw new NotFoundError("Question not found");
      }

      await questionnaireService.checkQuestionnaireInUse(
        question.questionnaire_id
      );

      const duplicatedQuestion = await questionnaireService.duplicateQuestion(
        parseInt(questionId)
      );

      if (!duplicatedQuestion) {
        throw new NotFoundError("Question not found");
      }

      return {
        success: true,
        data: duplicatedQuestion,
      };
    }
  );
  // Add rating scale to a question
  fastify.post(
    "/questions/:questionId/rating-scales",
    {
      schema: {
        description: "Add rating scale to a question",
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
          },
          required: ["questionId"],
        },
        body: {
          type: "object",
          properties: {
            questionnaire_rating_scale_id: { type: "number" },
            description: { type: "string" },
          },
          required: ["questionnaire_rating_scale_id", "description"],
        },
        response: {
          // 201: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: { type: "object" },
          //   },
          // },
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { questionId } = request.params as {
        questionId: string;
      };

      const { questionnaire_rating_scale_id, description } = request.body as {
        questionnaire_rating_scale_id: number;
        description: string;
      };

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      // Get the question to find its questionnaire_id
      const { data: question, error: questionError } =
        await request.supabaseClient
          .from("questionnaire_questions")
          .select("questionnaire_id")
          .eq("id", parseInt(questionId))
          .eq("is_deleted", false)
          .single();

      if (questionError || !question) {
        throw new NotFoundError("Question not found");
      }

      await questionnaireService.checkQuestionnaireInUse(
        question.questionnaire_id
      );

      const ratingScale = await questionnaireService.addQuestionRatingScale(
        parseInt(questionId),
        questionnaire_rating_scale_id,
        description
      );

      if (!ratingScale) {
        throw new InternalServerError(
          "Failed to associate rating scale to question"
        );
      }

      return {
        success: true,
        data: ratingScale,
      };
    }
  );
  fastify.put(
    "/questions/:questionId/rating-scales/:questionRatingScaleId",
    {
      schema: {
        description: "Update a question rating scale",
        params: {
          type: "object",
          properties: {
            questionRatingScaleId: { type: "string" },
          },
          required: ["questionRatingScaleId"],
        },
        body: {
          type: "object",
          properties: {
            description: { type: "string" },
          },
          required: ["description"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  description: { type: "string" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                  questionnaire_rating_scale_id: { type: "number" },
                  questionnaire_question_id: { type: "number" },
                  questionnaire_id: { type: "number" },
                },
              },
            },
          },
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { questionRatingScaleId } = request.params as {
        questionRatingScaleId: string;
      };

      const { description } = request.body as {
        description: string;
      };

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const ratingScale = await questionnaireService.updateQuestionRatingScale(
        parseInt(questionRatingScaleId),
        description
      );

      if (!ratingScale) {
        throw new InternalServerError("Failed to update question rating scale");
      }

      return {
        success: true,
        data: ratingScale,
      };
    }
  );
  fastify.delete(
    "/questions/:questionId/rating-scales/:questionRatingScaleId",
    {
      schema: {
        description: "Delete a question rating scale",
        params: {
          type: "object",
          properties: {
            questionRatingScaleId: { type: "string" },
          },
          required: ["questionRatingScaleId"],
        },
        response: {
          200: commonResponseSchemas.messageResponse,
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { questionRatingScaleId } = request.params as {
        questionRatingScaleId: string;
      };

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      // Get the question rating scale to find its questionnaire_id
      const { data: questionRatingScale, error: fetchError } =
        await request.supabaseClient
          .from("questionnaire_question_rating_scales")
          .select("questionnaire_id")
          .eq("id", parseInt(questionRatingScaleId))
          .eq("is_deleted", false)
          .single();

      if (fetchError || !questionRatingScale) {
        throw new NotFoundError("Question rating scale not found");
      }

      await questionnaireService.checkQuestionnaireInUse(
        questionRatingScale.questionnaire_id
      );

      await questionnaireService.deleteQuestionRatingScale(
        parseInt(questionRatingScaleId)
      );

      return {
        success: true,
        message: "Question rating scale deleted successfully",
      };
    }
  );
  fastify.post(
    "/questions/:questionId/add-questionnaire-rating-scales",
    {
      schema: {
        description:
          "Add all rating scales from the questionnaire to a question",
        body: {
          type: "object",
          properties: {
            questionnaireId: { type: "number" },
            questionId: { type: "number" },
          },
          required: ["questionnaireId", "questionId"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
            },
          },
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { questionnaireId, questionId } = request.body as {
        questionnaireId: number;
        questionId: number;
      };

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      await questionnaireService.checkQuestionnaireInUse(questionnaireId);

      const ratingScales =
        await questionnaireService.addQuestionnaireRatingScaleToQuestion(
          questionnaireId,
          questionId
        );

      if (!ratingScales) {
        throw new InternalServerError(
          "Failed to associate rating scales to question"
        );
      }

      return {
        success: true,
        data: ratingScales,
      };
    }
  );
  fastify.put(
    "/questions/:questionId/applicable-roles",
    {
      schema: {
        description: "Update applicable roles for a question",
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
          },
          required: ["questionId"],
        },
        body: {
          type: "object",
          properties: {
            shared_role_ids: {
              type: "array",
              items: { type: "number" },
            },
          },
          required: ["shared_role_ids"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    shared_role_id: { type: "number" },
                    name: { type: "string" },
                    description: { type: "string" },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                    questionnaire_question_id: { type: "number" },
                  },
                },
              },
            },
          },
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { questionId } = request.params as { questionId: string };
      const { shared_role_ids } = request.body as {
        shared_role_ids: number[];
      };

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      // Get the question to find its questionnaire_id
      const { data: question, error: questionError } =
        await request.supabaseClient
          .from("questionnaire_questions")
          .select("questionnaire_id")
          .eq("id", parseInt(questionId))
          .eq("is_deleted", false)
          .single();

      if (questionError || !question) {
        throw new NotFoundError("Question not found");
      }

      await questionnaireService.checkQuestionnaireInUse(
        question.questionnaire_id
      );

      const updatedQuestion =
        await questionnaireService.updateQuestionApplicableRoles(
          parseInt(questionId),
          shared_role_ids
        );

      if (!updatedQuestion || updatedQuestion.length === 0) {
        throw new InternalServerError("Unable to update applicable roles");
      }

      return {
        success: true,
        data: updatedQuestion,
      };
    }
  );

  // Question parts
  fastify.get("/questions/:questionId/parts", async (request) => {
    const { questionId } = request.params as {
      questionId: string;
    };

    const questionnaireService = new QuestionnaireService(
      request.supabaseClient,
      request.user.id
    );

    const parts = await questionnaireService.getQuestionParts(
      parseInt(questionId)
    );

    return {
      success: true,
      data: parts,
    };
  });
  fastify.post(
    "/questions/:questionId/parts",
    {
      schema: {
        description: "Add a new question part to a question",
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
          },
          required: ["questionId"],
        },
        body: {
          type: "object",
          properties: {
            text: { type: "string" },
            order_index: { type: "number" },
            options: { type: "object" },
            answer_type: {
              type: "string",
              enum: [
                "text",
                "labelled_scale",
                "scale",
                "boolean",
                "percentage",
                "number",
              ],
            },
          },
          required: ["text", "order_index", "answer_type", "options"],
        },
      },
    },
    async (request) => {
      const { questionId } = request.params as {
        questionId: number;
      };
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const body = request.body as Omit<
        CreateQuestionPartData,
        "questionnaire_question_id"
      >;

      // Validate options
      validateQuestionPartOptions(body.answer_type, body.options);

      const data: CreateQuestionPartData = {
        ...body,
        questionnaire_question_id: questionId,
      };

      const part = await questionnaireService.createQuestionPart(data);

      return {
        success: true,
        data: part,
      };
    }
  );

  fastify.put(
    "/questions/:questionId/parts/:partId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
            partId: { type: "string" },
          },
          required: ["questionId", "partId"],
        },
        body: {
          type: "object",
          properties: {
            text: { type: "string" },
            order_index: { type: "number" },
            options: { type: "object" },
            answer_type: {
              type: "string",
              enum: [
                "text",
                "labelled_scale",
                "scale",
                "boolean",
                "percentage",
                "number",
              ],
            },
          },
        },
      },
    },
    async (request) => {
      const { partId } = request.params as { partId: number };
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const updates = request.body as UpdateQuestionPartData;

      // Validate options if provided
      if (updates.answer_type && updates.options) {
        validateQuestionPartOptions(updates.answer_type, updates.options);
      }

      const part = await questionnaireService.updateQuestionPart(
        partId,
        updates
      );

      return {
        success: true,
        data: part,
      };
    }
  );

  fastify.delete(
    "/questions/:questionId/parts/:partId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
            partId: { type: "string" },
          },
          required: ["questionId", "partId"],
        },
      },
    },
    async (request) => {
      const { partId } = request.params as { partId: number };
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const part = await questionnaireService.deleteQuestionPart(partId);

      return {
        success: true,
        data: part,
      };
    }
  );

  fastify.post(
    "/questions/:questionId/parts/:partId/duplicate",
    {
      schema: {
        description: "Duplicate a question part",
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
            partId: { type: "string" },
          },
          required: ["questionId", "partId"],
        },
      },
    },
    async (request) => {
      const { partId } = request.params as {
        partId: number;
      };
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const newPart = await questionnaireService.duplicateQuestionPart(partId);

      return {
        success: true,
        data: newPart,
      };
    }
  );

  fastify.put(
    "/questions/:questionId/parts/reorder",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
          },
          required: ["questionId"],
        },
        body: {
          type: "object",
          properties: {
            questionId: { type: "number" },
            partIdsInOrder: {
              type: "array",
              items: { type: "number" },
            },
          },
          required: ["questionId", "partIdsInOrder"],
        },
      },
    },
    async (request) => {
      const { questionId } = request.params as {
        questionId: number;
      };
      const { partIdsInOrder } = request.body as {
        partIdsInOrder: number[];
      };
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const newPart = await questionnaireService.reorderQuestionParts(
        questionId,
        partIdsInOrder
      );

      return {
        success: true,
        data: newPart,
      };
    }
  );

  fastify.get(
    "/questions/:questionId/rating-scale-mapping",
    async (request) => {
      const { questionId } = request.params as { questionId: string };

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const mapping = await questionnaireService.getQuestionRatingScaleMapping(
        parseInt(questionId)
      );

      return {
        success: true,
        data: mapping,
      };
    }
  );

  // Update question rating scale mapping
  fastify.put(
    "/questions/:questionId/rating-scale-mapping",
    {
      schema: {
        description: "Update the rating scale mapping for a question",
        params: {
          type: "object",
          properties: {
            questionId: { type: "string" },
          },
          required: ["questionId"],
        },
        body: {
          type: "object",
          properties: {
            rating_scale_mapping: { type: "object" },
          },
          required: ["rating_scale_mapping"],
        },
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: { type: "object" },
          //   },
          // },
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { questionId } = request.params as { questionId: string };
      const { rating_scale_mapping } = request.body as {
        rating_scale_mapping: object;
      };

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      const updatedQuestion =
        await questionnaireService.updateQuestionRatingScaleMapping(
          parseInt(questionId),
          rating_scale_mapping as any
        );

      return {
        success: true,
        data: updatedQuestion,
      };
    }
  );
}
