import { FastifyInstance } from "fastify";
import { AssessmentsService } from "../../services/AssessmentsService.js";
import { NotFoundError, BadRequestError } from "../../plugins/errorHandler";
import { z } from "zod";

import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  Error400Schema,
  Error404Schema,
  Error500Schema,
} from "../../schemas/errors.js";
import {
  AssessmentMeasurementDefinition,
  AssessmentMeasurementDefinitionsSchema,
  AssessmentStatusEnum,
  AssessmentTypeEnum,
} from "../../schemas/assessments.js";
import { InterviewStatusEnum } from "../../schemas/interviews.js";
import { LocationTypeEnum } from "../../schemas/company.js";

export async function assessmentsRouter(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Assessments"];
    }
  });
  // Attach service to all routes in this router
  fastify.addHook("preHandler", async (request) => {
    request.assessmentsService = new AssessmentsService(
      request.supabaseClient,
      request.user.id
    );
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:assessmentId",
    schema: {
      description: "Get assessment by ID",
      params: z.object({
        assessmentId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            id: z.number(),
            name: z.string(),
            description: z.string().nullable(),
            type: z.enum(AssessmentTypeEnum),
            status: z.enum(AssessmentStatusEnum),
            questionnaire_id: z.number().nullable(),
            program_phase_id: z.number().nullable(),
            company_id: z.string(),
            created_at: z.string(),
            updated_at: z.string(),
            interview_overview: z.string().nullable(),
            location: z.object({
              business_unit: z
                .object({
                  id: z.number(),
                  name: z.string(),
                })
                .nullable(),
              region: z
                .object({
                  id: z.number(),
                  name: z.string(),
                })
                .nullable(),
              site: z
                .object({
                  id: z.number(),
                  name: z.string(),
                })
                .nullable(),
              asset_group: z
                .object({
                  id: z.number(),
                  name: z.string(),
                })
                .nullable(),
            }),
            objectives: z.array(
              z.object({
                id: z.number(),
                title: z.string(),
                description: z.string().nullable(),
              })
            ),
            questionnaire: z
              .object({
                id: z.number(),
                name: z.string(),
                description: z.string().nullable(),
                section_count: z.number(),
                step_count: z.number(),
                question_count: z.number(),
                sections: z.array(
                  z.object({
                    id: z.number(),
                    title: z.string(),
                    order_index: z.number(),
                    step_count: z.number(),
                    question_count: z.number(),
                    steps: z.array(
                      z.object({
                        id: z.number(),
                        title: z.string(),
                        order_index: z.number(),
                        question_count: z.number(),
                        questions: z.array(
                          z.object({
                            id: z.number(),
                            title: z.string(),
                            context: z.string(),
                            order_index: z.number(),
                            question_text: z.string(),
                          })
                        ),
                      })
                    ),
                  })
                ),
              })
              .optional(),
          }),
        }),
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const assessment = await request.assessmentsService!.getAssessmentById(
        request.params.assessmentId
      );

      if (!assessment) {
        throw new NotFoundError("Assessment not found");
      }

      return {
        success: true,
        data: assessment,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:assessmentId/interviews",
    schema: {
      description: "Get interviews for a specific assessment",
      params: z.object({
        assessmentId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(
            // z.object({
            //   id: z.number(),
            //   assessment_id: z.number(),
            //   interviewer_id: z.string(),
            //   interviewee_id: z.string(),
            //   scheduled_at: z.string().nullable(),
            //   started_at: z.string().nullable(),
            //   completed_at: z.string().nullable(),
            //   status: z.string(),
            //   created_at: z.string(),
            //   updated_at: z.string(),
            // })
            z.object({
              id: z.number(),
              name: z.string(),
              is_individual: z.boolean(),
              enabled: z.boolean(),
              access_code: z.string().nullable(),
              created_at: z.string(),
              updated_at: z.string(),
              due_at: z.string().nullable(),
              assessment: z.object({
                id: z.number(),
                name: z.string(),
                type: z.enum(["onsite", "desktop"]),
              }),
              program: z
                .object({
                  id: z.number(),
                  name: z.string(),
                  program_phase_id: z.number(),
                  program_phase_name: z.string().nullable(),
                })
                .nullable(),
              completion_rate: z.number(),
              average_score: z.number(),
              min_rating_value: z.number(),
              max_rating_value: z.number(),
              status: z.enum(InterviewStatusEnum),
              interview_roles: z.array(
                z.object({
                  role: z.object({
                    shared_role: z
                      .object({ id: z.number(), name: z.string() })
                      .nullable(),
                  }),
                })
              ),
              interviewee: z
                .object({
                  full_name: z.string().nullable(),
                  email: z.string(),
                  role: z.string(),
                })
                .nullable(),
              interviewer: z
                .object({
                  full_name: z.string().nullable(),
                  email: z.string(),
                })
                .nullable(),
              // responses: z.array(z.any()).optional(), // TODO: Only present if detailed=true, define structure
            })
          ),
        }),
      },
    },
    handler: async (request) => {
      const { assessmentId } = request.params;
      const interviews =
        await request.assessmentsService!.getInterviewsByAssessmentId(
          assessmentId
        );

      if (!interviews) {
        throw new NotFoundError("Assessment interviews not found");
      }

      return {
        success: true,
        data: interviews,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:assessmentId/comments",
    schema: {
      description: "Get comments for a specific assessment",
      params: z.object({
        assessmentId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(
            z.object({
              id: z.number(),
              comments: z.string().nullable(),
              created_at: z.string(),
              updated_at: z.string(),
              created_by: z
                .object({
                  full_name: z.string().nullable(),
                  email: z.string(),
                })
                .nullable(),
              interview_id: z.number(),
              interview_name: z.string(),
              question_id: z.number(),
              question_title: z.string(),
              domain_name: z.string(),
              subdomain_name: z.string(),
            })
          ),
        }),
      },
    },
    handler: async (request) => {
      const { assessmentId } = request.params;
      const comments =
        await request.assessmentsService!.getCommentsByAssessmentId(
          assessmentId
        );

      if (!comments) {
        throw new NotFoundError("Assessment comments not found");
      }

      return {
        success: true,
        data: comments,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:assessmentId/evidence",
    schema: {
      description: "Get evidence for a specific assessment",
      params: z.object({
        assessmentId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(
            z.object({
              id: z.number(),
              uploaded_at: z.string(),
              file_name: z.string(),
              file_size: z.number(),
              file_type: z.string(),
              file_path: z.string(),
              interview_id: z.number(),
              interview_name: z.string(),
              question_id: z.number(),
              question_title: z.string(),
              publicUrl: z.string(),
            })
          ),
        }),
      },
    },
    handler: async (request) => {
      const evidence =
        await request.assessmentsService!.getEvidenceByAssessmentId(
          request.params.assessmentId
        );

      if (!evidence) {
        throw new NotFoundError("Assessment evidence not found");
      }

      return {
        success: true,
        data: evidence,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:assessmentId/actions",
    schema: {
      description: "Get actions for a specific assessment",
      params: z.object({
        assessmentId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(
            z.object({
              id: z.number(),
              title: z.string().nullable(),
              description: z.string(),
              created_at: z.string(),
              updated_at: z.string(),
              created_by: z
                .object({
                  full_name: z.string().nullable(),
                  email: z.string(),
                })
                .nullable(),
              rating_score: z.number().nullable(),
              question_id: z.number(),
              question_title: z.string(),
              interview_id: z.number(),
              interview_name: z.string(),
            })
          ),
        }),
      },
    },
    handler: async (request) => {
      const actions =
        await request.assessmentsService!.getActionsByAssessmentId(
          request.params.assessmentId
        );

      if (!actions) {
        throw new NotFoundError("Assessment actions not found");
      }

      return {
        success: true,
        data: actions,
      };
    },
  });

  // Method for updating an assessment by ID
  // NOTE: If the status is toggled to 'completed', it will trigger recommendation generation
  // logic.
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:assessmentId",
    schema: {
      description: "Update an assessment by ID",
      params: z.object({
        assessmentId: z.coerce.number(),
      }),
      body: z.object({
        name: z.string().optional(),
        description: z.string().nullable().optional(),
        status: z.enum(AssessmentStatusEnum).optional(),
        business_unit_id: z.coerce.number().nullable().optional(),
        region_id: z.coerce.number().nullable().optional(),
        site_id: z.coerce.number().nullable().optional(),
        asset_group_id: z.coerce.number().nullable().optional(),
        scheduled_at: z.string().nullable().optional(),
        started_at: z.string().nullable().optional(),
        completed_at: z.string().nullable().optional(),
        interview_overview: z.string().nullable().optional(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            id: z.number(),
            name: z.string(),
            description: z.string().nullable(),
            status: z.enum(AssessmentStatusEnum),
            type: z.string(),
            questionnaire_id: z.number().nullable(),
            company_id: z.string(),
            business_unit_id: z.number().nullable(),
            region_id: z.number().nullable(),
            site_id: z.number().nullable(),
            asset_group_id: z.number().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
            interview_overview: z.string().nullable(),
          }),
        }),
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const assessment = await request.assessmentsService!.updateAssessment(
        request.params.assessmentId,
        request.body
      );
      return {
        success: true,
        data: assessment,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      description: "Create a new assessment",
      body: z.object({
        name: z.string(),
        description: z.string().nullable().optional(),
        type: z.enum(AssessmentTypeEnum),
        questionnaire_id: z.coerce.number().nullable().optional(),
        company_id: z.string(),
        business_unit_id: z.coerce.number().nullable().optional(),
        region_id: z.coerce.number().nullable().optional(),
        site_id: z.coerce.number().nullable().optional(),
        asset_group_id: z.coerce.number().nullable().optional(),
        objectives: z
          .array(
            z.object({
              title: z.string(),
              description: z.string().nullable().optional(),
            })
          )
          .optional(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            id: z.number(),
            name: z.string(),
            description: z.string().nullable(),
            status: z.enum(AssessmentStatusEnum),
            type: z.enum(AssessmentTypeEnum),
            questionnaire_id: z.number().nullable(),
            company_id: z.string(),
            business_unit_id: z.number().nullable(),
            region_id: z.number().nullable(),
            site_id: z.number().nullable(),
            asset_group_id: z.number().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
        }),
        400: Error400Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const body = request.body;

      // Validate onsite-specific requirements
      if (body.type === "onsite" && !body.questionnaire_id) {
        throw new BadRequestError(
          "questionnaire_id is required for onsite assessments"
        );
      }

      const assessment =
        await request.assessmentsService!.createAssessment(body);

      return {
        success: true,
        data: assessment,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:assessmentId",
    schema: {
      description: "Delete an assessment by ID",
      params: z.object({
        assessmentId: z.coerce.number(),
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
      try {
        await request.assessmentsService!.deleteAssessment(
          request.params.assessmentId
        );

        return {
          success: true,
          message: "Assessment deleted successfully",
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to delete assessment";

        // Check if it's a not found error
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("No rows")
        ) {
          throw new NotFoundError("Assessment not found");
        }

        // Re-throw to let the error handler catch it
        throw error;
      }
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:assessmentId/duplicate",
    schema: {
      description: "Duplicate an assessment by ID",
      params: z.object({
        assessmentId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            id: z.number(),
            name: z.string(),
            description: z.string().nullable(),
            status: z.enum(AssessmentStatusEnum),
            type: z.enum(AssessmentTypeEnum),
            questionnaire_id: z.number().nullable(),
            company_id: z.string(),
            business_unit_id: z.number().nullable(),
            region_id: z.number().nullable(),
            site_id: z.number().nullable(),
            asset_group_id: z.number().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
        }),
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      try {
        const duplicatedAssessment =
          await request.assessmentsService!.duplicateAssessment(
            request.params.assessmentId
          );

        return {
          success: true,
          data: duplicatedAssessment,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to duplicate assessment";

        // Check if it's a not found error
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("Assessment not found")
        ) {
          throw new NotFoundError("Assessment not found");
        }

        // Re-throw to let the error handler catch it
        throw error;
      }
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:assessmentId/measurement-definitions",
    schema: {
      description:
        "Get all measurement definitions with usage info for a specific assessment",
      params: z.object({
        assessmentId: z.coerce.number(),
      }),
      response: {
        200: AssessmentMeasurementDefinitionsSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const data =
        await request.assessmentsService!.getMeasurmentsDefinitionsByAssessmentId(
          request.params.assessmentId
        );
      const parsedData = data.map((d) =>
        AssessmentMeasurementDefinition.parse(d)
      );
      return { success: true, data: parsedData };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:assessmentId/measurements",
    schema: {
      description: "Get measurement instances for a specific assessment",
      params: z.object({
        assessmentId: z.coerce.number(),
      }),
      query: z.object({
        includeDefinitions: z.boolean().optional().default(false),
      }),
      response: {
        // TODO: Complete measurement schema
        200: z.object({
          success: z.boolean(),
          data: z.array(
            z.object({
              id: z.number(),
              created_at: z.string(),
              updated_at: z.string(),
              data_source: z.string().nullable(),
              calculated_value: z.number(),
              calculation_metadata: z.any().nullable(),
              program_phase_id: z.number().nullable(),
              created_by: z.string(),
              assessment_id: z.number().nullable(),
              measurement_name: z.string(),
              measurement_description: z.string().nullable(),
              measurement_definition_id: z.number(),
              measurement_min_value: z.number().nullable(),
              measurement_max_value: z.number().nullable(),
              measurement_unit: z.string().nullable(),
              // is_in_use: z.boolean(),
              company_id: z.string(),
              business_unit_id: z.number().nullable(),
              region_id: z.number().nullable(),
              site_id: z.number().nullable(),
              asset_group_id: z.number().nullable(),
              work_group_id: z.number().nullable(),
              role_id: z.number().nullable(),
              business_unit: z
                .object({
                  name: z.string(),
                })
                .nullable(),
              region: z
                .object({
                  name: z.string(),
                })
                .nullable(),
              site: z
                .object({
                  name: z.string(),
                })
                .nullable(),
              asset_group: z
                .object({
                  name: z.string(),
                })
                .nullable(),
              work_group: z
                .object({
                  name: z.string(),
                })
                .nullable(),
              role: z
                .object({
                  name: z.string(),
                })
                .nullable(),
            })
          ),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const data =
        await request.assessmentsService!.getMeasurementsByAssessmentId(
          request.params.assessmentId
        );

      return { success: true, data };
    },
  });

  // Method for manually adding a measurement to an assessment
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:assessmentId/measurements",
    schema: {
      description: "Add a measurement to a specific assessment",
      params: z.object({
        assessmentId: z.coerce.number(),
      }),
      body: z.object({
        measurement_definition_id: z.coerce.number(),
        calculated_value: z.number(),
        location: z.object({
          id: z.coerce.number(),
          type: z.enum(LocationTypeEnum),
        }),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            id: z.number(),
            created_at: z.string(),
            updated_at: z.string(),
            data_source: z.string().nullable(),
            calculated_value: z.number(),
            calculation_metadata: z.any().nullable(),
            program_phase_id: z.number().nullable(),
            created_by: z.string(),
            assessment_id: z.number().nullable(),
            measurement_name: z.string(),
            measurement_description: z.string().nullable(),
            business_unit: z
              .object({
                name: z.string(),
              })
              .nullable(),
            region: z
              .object({
                name: z.string(),
              })
              .nullable(),
            site: z
              .object({
                name: z.string(),
              })
              .nullable(),
            asset_group: z
              .object({
                name: z.string(),
              })
              .nullable(),
            work_group: z
              .object({
                name: z.string(),
              })
              .nullable(),
            role: z
              .object({
                name: z.string(),
              })
              .nullable(),
          }),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const data = await request.assessmentsService!.addMeasurementToAssessment(
        request.params.assessmentId,
        request.body.measurement_definition_id,
        request.body.calculated_value,
        request.body.location
      );

      return { success: true, data };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:assessmentId/measurements/:measurementId",
    schema: {
      description: "Update a measurement for a specific assessment",
      params: z.object({
        assessmentId: z.coerce.number(),
        measurementId: z.coerce.number(),
      }),
      body: z.object({
        calculated_value: z.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            id: z.number(),
            created_at: z.string(),
            updated_at: z.string(),
            data_source: z.string().nullable(),
            calculated_value: z.number(),
            calculation_metadata: z.any().nullable(),
            program_phase_id: z.number().nullable(),
            created_by: z.string(),
            assessment_id: z.number().nullable(),
            measurement_name: z.string(),
            measurement_description: z.string().nullable(),
            business_unit: z
              .object({
                name: z.string(),
              })
              .nullable(),
            region: z
              .object({
                name: z.string(),
              })
              .nullable(),
            site: z
              .object({
                name: z.string(),
              })
              .nullable(),
            asset_group: z
              .object({
                name: z.string(),
              })
              .nullable(),
            work_group: z
              .object({
                name: z.string(),
              })
              .nullable(),
            role: z
              .object({
                name: z.string(),
              })
              .nullable(),
          }),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const updatedMeasurement =
        await request.assessmentsService!.updateMeasurement(
          request.params.measurementId,
          request.body.calculated_value
        );
      return { success: true, data: updatedMeasurement };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:assessmentId/measurements/:measurementId",
    schema: {
      description: "Delete a measurement from a specific assessment",
      params: z.object({
        assessmentId: z.coerce.number(),
        measurementId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      await request.assessmentsService!.deleteMeasurementFromAssessment(
        request.params.measurementId
      );
      return {
        success: true,
        message: "Measurement deleted successfully",
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:assessmentId/measurements/bar-charts",
    schema: {
      description: "Get measurement bar chart data for a specific assessment",
      params: z.object({
        assessmentId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(
            z.object({
              name: z.string(),
              data: z.array(
                z.object({
                  label: z.string(),
                  value: z.number(),
                })
              ),
            })
          ),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const data =
        await request.assessmentsService!.getMeasurementBarChartsByAssessmentId(
          request.params.assessmentId
        );
      return {
        success: true,
        data,
      };
    },
  });
}
