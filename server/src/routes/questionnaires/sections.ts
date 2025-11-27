import { FastifyInstance } from "fastify";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";
import {
  InternalServerError,
  NotFoundError,
} from "../../plugins/errorHandler.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  CreateQuestionnaireSectionBodySchema,
  CreateQuestionnaireSectionResponseSchema,
  UpdateQuestionnaireSectionParamsSchema,
  UpdateQuestionnaireSectionBodySchema,
  UpdateQuestionnaireSectionResponseSchema,
  DeleteQuestionnaireSectionParamsSchema,
  DeleteQuestionnaireSectionResponseSchema,
} from "../../schemas/questionnaires/sections.js";
import {
  Error403Schema,
  Error404Schema,
  Error500Schema,
} from "../../schemas/errors.js";
export async function sectionsRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/sections",
    schema: {
      description: "Create a new questionnaire section",
      body: CreateQuestionnaireSectionBodySchema,
      response: {
        201: CreateQuestionnaireSectionResponseSchema,
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
      const { title, questionnaire_id } = request.body;
      await questionnaireService.checkQuestionnaireInUse(questionnaire_id);

      const section = await questionnaireService.createSection(
        questionnaire_id,
        { title }
      );

      return {
        success: true,
        data: section,
      };
    },
  });

  // Update a section in a questionnaire
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/sections/:sectionId",
    schema: {
      description: "Update a section in a questionnaire",
      params: UpdateQuestionnaireSectionParamsSchema,
      body: UpdateQuestionnaireSectionBodySchema,
      response: {
        200: UpdateQuestionnaireSectionResponseSchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { sectionId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const section = await questionnaireService.updateSection(
        sectionId,
        request.body
      );

      if (!section) {
        throw new InternalServerError("Failed to update section");
      }

      return {
        success: true,
        data: section,
      };
    },
  });

  // Delete a section in a questionnaire
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/sections/:sectionId",
    schema: {
      description: "Delete a section in a questionnaire",
      params: DeleteQuestionnaireSectionParamsSchema,
      response: {
        200: DeleteQuestionnaireSectionResponseSchema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { sectionId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      // Get the section to find its questionnaire_id
      const { data: section, error: sectionError } =
        await request.supabaseClient
          .from("questionnaire_sections")
          .select("questionnaire_id")
          .eq("id", sectionId)
          .eq("is_deleted", false)
          .single();

      if (sectionError || !section) {
        throw new NotFoundError("Section not found");
      }

      await questionnaireService.checkQuestionnaireInUse(
        section.questionnaire_id
      );

      const deleted = await questionnaireService.deleteSection(sectionId);

      if (!deleted) {
        throw new InternalServerError("Failed to delete section");
      }

      return {
        success: true,
        message: "Section deleted successfully",
      };
    },
  });
}
