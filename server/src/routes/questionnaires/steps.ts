import { FastifyInstance } from "fastify";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";
import {
  InternalServerError,
  NotFoundError,
} from "../../plugins/errorHandler.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  CreateQuestionnaireStepBodySchema,
  CreateQuestionnaireStepResponseSchema,
  UpdateQuestionnaireStepParamsSchema,
  UpdateQuestionnaireStepBodySchema,
  UpdateQuestionnaireStepResponseSchema,
  DeleteQuestionnaireStepParamsSchema,
  DeleteQuestionnaireStepResponseSchema,
} from "../../schemas/questionnaires/steps.js";
import {
  Error403Schema,
  Error404Schema,
  Error500Schema,
} from "../../schemas/errors.js";

export async function stepsRoutes(fastify: FastifyInstance) {
  // Method for creating a new step in a questionnaire section
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/steps",
    schema: {
      description: "Create a new step in a section",
      body: CreateQuestionnaireStepBodySchema,
      response: {
        201: CreateQuestionnaireStepResponseSchema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const body = request.body;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      // Get the section to find its questionnaire_id
      const { data: section, error: sectionError } =
        await request.supabaseClient
          .from("questionnaire_sections")
          .select("questionnaire_id")
          .eq("id", body.questionnaire_section_id)
          .eq("is_deleted", false)
          .single();

      if (sectionError || !section) {
        throw new NotFoundError("Section not found");
      }

      await questionnaireService.checkQuestionnaireInUse(
        section.questionnaire_id
      );

      const step = await questionnaireService.createStep(
        body.questionnaire_section_id,
        body
      );

      return reply.status(201).send({
        success: true,
        data: step,
      });
    },
  });

  // method for updating a step in a questionnaire
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/steps/:stepId",
    schema: {
      description: "Update a step in a questionnaire",
      params: UpdateQuestionnaireStepParamsSchema,
      body: UpdateQuestionnaireStepBodySchema,
      response: {
        200: UpdateQuestionnaireStepResponseSchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { stepId } = request.params;
      const body = request.body;
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const step = await questionnaireService.updateStep(stepId, body);

      if (!step) {
        throw new NotFoundError("Step not found");
      }

      return {
        success: true,
        data: step,
      };
    },
  });

  // Delete a step in a questionnaire
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/steps/:stepId",
    schema: {
      description: "Delete a step in a questionnaire",
      params: DeleteQuestionnaireStepParamsSchema,
      response: {
        200: DeleteQuestionnaireStepResponseSchema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { stepId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      // Get the step to find its questionnaire_id
      const { data: step, error: stepError } = await request.supabaseClient
        .from("questionnaire_steps")
        .select("questionnaire_id")
        .eq("id", stepId)
        .eq("is_deleted", false)
        .single();

      if (stepError || !step) {
        throw new NotFoundError("Step not found");
      }

      await questionnaireService.checkQuestionnaireInUse(step.questionnaire_id);

      const deleted = await questionnaireService.deleteStep(stepId);

      if (!deleted) {
        throw new InternalServerError("Failed to delete step");
      }

      return {
        success: true,
        message: "Step deleted successfully",
      };
    },
  });
}
