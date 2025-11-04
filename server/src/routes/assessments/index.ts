import { FastifyInstance } from "fastify";
import { AssessmentsService } from "../../services/AssessmentsService.js";
import { NotFoundError, BadRequestError } from "../../plugins/errorHandler";

import type {
  CreateAssessmentData,
  UpdateAssessmentData,
} from "../../types/entities/assessments.js";

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

  fastify.get(
    "/:assessmentId",
    {
      schema: {
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: {
          //       type: "object",
          //       properties: {
          //         id: { type: "number" },
          //         created_at: { type: "string", format: "date-time" },
          //         updated_at: { type: "string", format: "date-time" },
          //         name: { type: "string" },
          //         description: { type: "string" },
          //         type: { type: "string" },
          //         status: { type: "string" },
          //         objectives: {
          //           type: "array",
          //           items: {
          //             type: "object",
          //             properties: {
          //               title: { type: "string" },
          //               description: { type: "string" },
          //             },
          //           },
          //         },
          //         questionnaire: {
          //           type: "object",
          //           properties: {
          //             id: { type: "number" },
          //             name: { type: "string" },
          //             description: { type: "string" },
          //             section_count: { type: "number" },
          //             step_count: { type: "number" },
          //             question_count: { type: "number" },
          //             sections: {
          //               type: "array",
          //               items: {
          //                 type: "object",
          //                 properties: {
          //                   id: { type: "number" },
          //                   title: { type: "string" },
          //                   order_index: { type: "number" },
          //                   step_count: { type: "number" },
          //                   question_count: { type: "number" },
          //                   steps: {
          //                     type: "array",
          //                     items: {
          //                       type: "object",
          //                       properties: {
          //                         id: { type: "number" },
          //                         title: { type: "string" },
          //                         order_index: { type: "number" },
          //                         question_count: { type: "number" },
          //                         questions: {
          //                           type: "array",
          //                           items: {
          //                             type: "object",
          //                             properties: {
          //                               id: { type: "number" },
          //                               title: { type: "string" },
          //                               context: { type: "string" },
          //                               order_index: { type: "number" },
          //                               question_text: { type: "string" },
          //                             },
          //                           },
          //                         },
          //                       },
          //                     },
          //                   },
          //                 },
          //               },
          //             },
          //           },
          //         },
          //       },
          //     },
          //   },
          // },
        },
      },
    },
    async (request) => {
      const { assessmentId } = request.params as { assessmentId: number };
      const assessment =
        await request.assessmentsService!.getAssessmentById(assessmentId);

      if (!assessment) {
        throw new NotFoundError("Assessment not found");
      }

      return {
        success: true,
        data: assessment,
      };
    }
  );

  fastify.get("/:assessmentId/interviews", async (request) => {
    const { assessmentId } = request.params as { assessmentId: number };
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
  });
  fastify.get("/:assessmentId/comments", async (request) => {
    const { assessmentId } = request.params as { assessmentId: number };
    const comments =
      await request.assessmentsService!.getCommentsByAssessmentId(assessmentId);

    if (!comments) {
      throw new NotFoundError("Assessment comments not found");
    }

    return {
      success: true,
      data: comments,
    };
  });
  fastify.get("/:assessmentId/evidence", async (request) => {
    const { assessmentId } = request.params as { assessmentId: number };

    const evidence =
      await request.assessmentsService!.getEvidenceByAssessmentId(assessmentId);

    if (!evidence) {
      throw new NotFoundError("Assessment evidence not found");
    }

    return {
      success: true,
      data: evidence,
    };
  });
  fastify.get("/:assessmentId/actions", async (request) => {
    const { assessmentId } = request.params as { assessmentId: number };
    const actions =
      await request.assessmentsService!.getActionsByAssessmentId(assessmentId);

    if (!actions) {
      throw new NotFoundError("Assessment actions not found");
    }

    return {
      success: true,
      data: actions,
    };
  });

  fastify.put(
    "/:assessmentId",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string", nullable: true },
            status: { type: "string" },
            business_unit_id: { type: "number", nullable: true },
            region_id: { type: "number", nullable: true },
            site_id: { type: "number", nullable: true },
            asset_group_id: { type: "number", nullable: true },
            scheduled_at: {
              type: ["string"],
              format: "date-time",
              nullable: true,
            },
            started_at: {
              type: ["string"],
              format: "date-time",
              nullable: true,
            },
            completed_at: {
              type: ["string"],
              format: "date-time",
              nullable: true,
            },
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
                  name: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string" },
                  type: { type: "string" },
                  questionnaire_id: { type: "number" },
                  company_id: { type: "string" },
                  business_unit_id: { type: "number" },
                  region_id: { type: "number" },
                  site_id: { type: "number" },
                  asset_group_id: { type: "number" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                  interview_overview: { type: "string" },
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
    async (request, reply) => {
      const { assessmentId } = request.params as { assessmentId: string };
      const assessment = await request.assessmentsService!.updateAssessment(
        Number(assessmentId),
        request.body as UpdateAssessmentData
      );

      return reply.status(200).send({
        success: true,
        data: assessment,
      });
    }
  );
  fastify.post(
    "/",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "type", "company_id"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            type: { type: "string", enum: ["onsite", "desktop"] },
            questionnaire_id: {
              type: ["number"],
              default: null,
              nullable: true,
            },
            company_id: { type: "string" },
            business_unit_id: {
              type: ["number"],
              default: null,
              nullable: true,
            },
            region_id: { type: ["number"], default: null, nullable: true },
            site_id: { type: ["number"], default: null, nullable: true },
            asset_group_id: { type: ["number"], default: null, nullable: true },
            objectives: {
              type: "array",
              items: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
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
                  name: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string" },
                  type: { type: "string" },
                  questionnaire_id: { type: "number" },
                  company_id: { type: "string" },
                  business_unit_id: { type: "number" },
                  region_id: { type: "number" },
                  site_id: { type: "number" },
                  asset_group_id: { type: "number" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                },
              },
            },
          },
          400: {
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
    async (request, reply) => {
      const body = request.body as CreateAssessmentData;

      // Validate onsite-specific requirements
      if (body.type === "onsite" && !body.questionnaire_id) {
        throw new BadRequestError(
          "questionnaire_id is required for onsite assessments"
        );
      }

      const assessment =
        await request.assessmentsService!.createAssessment(body);

      return reply.status(200).send({
        success: true,
        data: assessment,
      });
    }
  );

  fastify.delete(
    "/:assessmentId",
    {
      schema: {
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
    async (request, reply) => {
      const { assessmentId } = request.params as { assessmentId: string };

      try {
        await request.assessmentsService!.deleteAssessment(
          Number(assessmentId)
        );

        return reply.status(200).send({
          success: true,
          message: "Assessment deleted successfully",
        });
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
    }
  );
  fastify.post(
    "/:assessmentId/duplicate",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  name: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string" },
                  type: { type: "string" },
                  questionnaire_id: { type: "number" },
                  company_id: { type: "string" },
                  business_unit_id: { type: "number" },
                  region_id: { type: "number" },
                  site_id: { type: "number" },
                  asset_group_id: { type: "number" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
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
    async (request, reply) => {
      const { assessmentId } = request.params as { assessmentId: string };

      try {
        const duplicatedAssessment =
          await request.assessmentsService!.duplicateAssessment(
            Number(assessmentId)
          );

        return reply.status(200).send({
          success: true,
          data: duplicatedAssessment,
        });
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
    }
  );
  // Method for getting measurements associated with an assessment
  fastify.get(
    "/:assessmentId/measurements",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            assessmentId: { type: "number" },
          },
          required: ["assessmentId"],
        },
        queryString: {
          includeDefinitions: { type: "boolean", default: false },
        },
        response: {
          // 200: {
          // }
        },
      },
    },
    async (request) => {
      const { assessmentId } = request.params as { assessmentId: number };
      const data =
        await request.assessmentsService!.getMeasurementsByAssessmentId(
          assessmentId
        );

      return { success: true, data };
    }
  );
  // Method for manually adding a measurement to an assessment
  fastify.post(
    "/:assessmentId/measurements",
    {
      schema: {
        body: {
          type: "object",
          required: ["measurement_definition_id", "calculated_value"],
          properties: {
            measurement_definition_id: { type: "number" },
            calculated_value: { type: "number" },
            location: {
              type: "object",
              required: ["id", "type"],
              properties: {
                id: { type: "number" },
                type: {
                  type: "string",
                  enum: [
                    "business_unit",
                    "region",
                    "site",
                    "asset_group",
                    "work_group",
                    "role",
                  ],
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { assessmentId } = request.params as { assessmentId: number };
      const { measurement_definition_id, calculated_value, location } =
        request.body as {
          measurement_definition_id: number;
          calculated_value: number;
          location: {
            id: number;
            type:
              | "business_unit"
              | "region"
              | "site"
              | "asset_group"
              | "work_group"
              | "role";
          };
        };

      if (!measurement_definition_id) {
        throw new BadRequestError("measurement_definition_id is required");
      }

      if (!calculated_value) {
        throw new BadRequestError("calculated_value is required");
      }

      const data = await request.assessmentsService!.addMeasurementToAssessment(
        assessmentId,
        measurement_definition_id,
        calculated_value,
        location
      );

      return { success: true, data };
    }
  );
  // Method for updating a measurement associated with an assessment
  fastify.put(
    "/:assessmentId/measurements/:measurementId",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            calculated_value: { type: "number" },
          },
        },
      },
    },
    async (request) => {
      const { measurementId } = request.params as {
        measurementId: number;
      };
      const updates = request.body as {
        calculated_value?: number;
      };
      if (!updates.calculated_value) {
        throw new BadRequestError("No updates provided");
      }

      // Update the measurement
      const { data: updatedMeasurement, error: updateError } =
        await request.supabaseClient
          .from("measurements_calculated")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", measurementId)
          .select()
          .single();

      if (updateError || !updatedMeasurement) {
        throw new Error("Failed to update measurement");
      }

      return { success: true, data: updatedMeasurement };
    }
  );
  // Method for removing a measurement from an assessment
  fastify.delete(
    "/:assessmentId/measurements/:measurementId",
    async (request) => {
      const { measurementId } = request.params as {
        measurementId: number;
      };
      await request.assessmentsService!.deleteMeasurementFromAssessment(
        measurementId
      );
      return {
        success: true,
        message: "Measurement deleted successfully",
      };
    }
  );

  // Method for getting measurements on an assessment in bar chart format
  fastify.get(
    "/:assessmentId/measurements/bar-charts",
    {
      schema: {
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
                    name: { type: "string" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          label: { type: "string" },
                          value: { type: "number" },
                        },
                        required: ["label", "value"],
                      },
                    },
                  },
                  required: ["name", "data"],
                },
              },
            },
            required: ["success", "data"],
          },
        },
      },
    },
    async (request, reply) => {
      const { assessmentId } = request.params as { assessmentId: number };
      const data =
        await request.assessmentsService!.getMeasurementBarChartsByAssessmentId(
          assessmentId
        );
      return reply.status(200).send({
        success: true,
        data,
      });
    }
  );
}
