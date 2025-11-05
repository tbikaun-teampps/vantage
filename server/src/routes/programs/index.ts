import { FastifyInstance } from "fastify";
import { ProgramService } from "../../services/ProgramService.js";
import { InterviewsService } from "../../services/InterviewsService.js";
import {
  ProgramPhaseStatus,
  ProgramStatus,
} from "../../types/entities/programs.js";

export async function programRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Programs"];
    }
  });
  // Method to get all programs
  fastify.get(
    "",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            companyId: { type: "string" },
          },
          required: ["companyId"],
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
                    name: { type: "string" },
                    description: { type: "string", nullable: true },
                    status: { type: "string" },
                    presite_questionnaire_id: {
                      type: "number",
                      nullable: true,
                    },
                    onsite_questionnaire_id: { type: "number", nullable: true },
                    measurements_count: { type: "number", nullable: true },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                  },
                  required: [
                    "id",
                    "name",
                    "status",
                    "presite_questionnaire_id",
                    "onsite_questionnaire_id",
                    "measurements_count",
                    "created_at",
                    "updated_at",
                  ],
                },
              },
            },
            required: ["success", "data"],
          },
          401: {
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
      const { companyId } = request.query as { companyId: string };
      const programService = new ProgramService(request.supabaseClient);

      const programs = await programService.getPrograms(companyId);

      return {
        success: true,
        data: programs,
      };
    }
  );

  // Method for creating a program
  fastify.post("", async (request) => {
    const { name, description, company_id } = request.body as {
      name: string;
      description?: string;
      company_id: string;
    };

    const programService = new ProgramService(request.supabaseClient);
    const program = await programService.createProgram({
      name,
      description,
      company_id,
    });

    return {
      success: true,
      data: program,
    };
  });

  // Method for getting a program by ID
  fastify.get(
    "/:programId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
          },
          required: ["programId"],
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
                  description: { type: "string", nullable: true },
                  status: { type: "string" },
                  presite_questionnaire_id: { type: "number", nullable: true },
                  presite_questionnaire: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" },
                    },
                    is_nullable: true,
                  },
                  onsite_questionnaire_id: { type: "number", nullable: true },
                  onsite_questionnaire: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" },
                    },
                    is_nullable: true,
                  },
                  measurements_count: { type: "number", nullable: true },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                  phases: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        name: { type: "string" },
                        status: { type: "string" },
                        sequence_number: { type: "number" },
                        notes: { type: "string", nullable: true },
                        program_id: { type: "number" },
                        planned_start_date: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                        },
                        actual_start_date: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                        },
                        planned_end_date: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                        },
                        actual_end_date: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                        },
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
                required: [
                  "id",
                  "name",
                  "status",
                  "created_at",
                  "updated_at",
                  "presite_questionnaire_id",
                  "presite_questionnaire",
                  "onsite_questionnaire_id",
                  "onsite_questionnaire",
                  "measurements_count",
                  "phases",
                ],
              },
            },
            required: ["success", "data"],
          },
        },
      },
    },
    async (request) => {
      const programId = (request.params as { programId: number }).programId;
      const programService = new ProgramService(request.supabaseClient);
      const program = await programService.getProgramById(programId);

      return {
        success: true,
        data: program,
      };
    }
  );

  // Method for updating a programs details
  fastify.put(
    "/:programId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
          },
          required: ["programId"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            status: { type: "string" },
            presite_questionnaire_id: { type: "number", nullable: true },
            onsite_questionnaire_id: { type: "number", nullable: true },
          },
        },
      },
    },
    async (request) => {
      const programId = (request.params as { programId: number }).programId;
      const {
        name,
        description,
        status,
        presite_questionnaire_id,
        onsite_questionnaire_id,
      } = request.body as {
        name?: string;
        description?: string;
        status?: ProgramStatus;
        presite_questionnaire_id?: number;
        onsite_questionnaire_id?: number;
      };

      const programService = new ProgramService(request.supabaseClient);
      const program = await programService.updateProgram(programId, {
        name,
        description,
        status,
        presite_questionnaire_id,
        onsite_questionnaire_id,
      });

      return {
        success: true,
        data: program,
      };
    }
  );

  // Method for deleting a program
  // TODO: Add cascade delete for related entities.

  // Method for adding a program phase
  fastify.post(
    "/:programId/phases",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
          },
          required: ["programId"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            planned_start_date: { type: "string", format: "date-time" },
            planned_end_date: { type: "string", format: "date-time" },
            activate: { type: "boolean", default: false },
          },
          required: ["name", "planned_start_date", "planned_end_date"],
        },
      },
    },
    async (request) => {
      const programId = (request.params as { programId: number }).programId;
      const { name, planned_start_date, planned_end_date, activate } =
        request.body as {
          name: string;
          planned_start_date: string;
          planned_end_date: string;
          activate?: boolean;
        };

      const programService = new ProgramService(request.supabaseClient);
      const createdPhases = await programService.addPhaseToProgram(
        programId,
        activate,
        {
          name,
          planned_start_date,
          planned_end_date,
        }
      );

      return {
        success: true,
        data: createdPhases,
      };
    }
  );

  // Method for updating a program phase
  fastify.put(
    "/:programId/phases/:phaseId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
            phaseId: { type: "number" },
          },
          required: ["programId", "phaseId"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            status: { type: "string" },
            notes: { type: "string" },
            planned_start_date: { type: "string", format: "date-time" },
            actual_start_date: { type: "string", format: "date-time" },
            planned_end_date: { type: "string", format: "date-time" },
            actual_end_date: { type: "string", format: "date-time" },
          },
        },
      },
    },
    async (request) => {
      const { phaseId } = request.params as {
        phaseId: number;
      };
      const updates = request.body as {
        name?: string;
        status?: ProgramPhaseStatus;
        notes?: string;
        planned_start_date?: string;
        actual_start_date?: string;
        planned_end_date?: string;
        actual_end_date?: string;
      };

      const programService = new ProgramService(request.supabaseClient);
      const phase = await programService.updateProgramPhase(phaseId, updates);
      return {
        success: true,
        data: phase,
      };
    }
  );

  // Method to delete a program phase
  fastify.delete(
    "/:programId/phases/:phaseId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
            phaseId: { type: "number" },
          },
          required: ["programId", "phaseId"],
        },
      },
    },
    async (request) => {
      const { phaseId } = request.params as {
        phaseId: number;
      };

      const programService = new ProgramService(request.supabaseClient);
      await programService.deleteProgramPhase(phaseId);

      return {
        success: true,
      };
    }
  );

  // POST /programs/:programId/interviews - Create interviews for a program phase
  fastify.post(
    "/:programId/interviews",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
          },
          required: ["programId"],
        },
        body: {
          type: "object",
          properties: {
            phaseId: { type: "number" },
            isIndividual: { type: "boolean", default: false },
            roleIds: {
              type: "array",
              items: { type: "number" },
              minItems: 1,
            },
            contactIds: {
              type: "array",
              items: { type: "number" },
            },
            interviewType: {
              type: "string",
              enum: ["onsite", "presite"],
            },
          },
          required: ["phaseId", "roleIds", "contactIds", "interviewType"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                  interviewsCreated: { type: "number" },
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
          401: {
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
      try {
        const programId = (request.params as { programId: number }).programId;
        const {
          phaseId,
          isIndividual = false,
          roleIds,
          contactIds,
          interviewType,
        } = request.body as {
          phaseId: number;
          isIndividual?: boolean;
          roleIds: number[];
          contactIds: number[];
          interviewType: "onsite" | "presite";
        };

        // Get the user ID from the request
        const createdBy = request.user.id;

        // Create authenticated Supabase client using Fastify decorator
        const supabaseClient = request.supabaseClient;

        // Create InterviewsService to handle interview creation logic
        const interviewsService = new InterviewsService(
          supabaseClient,
          createdBy,
          fastify.supabaseAdmin
        );

        // Create ProgramService with InterviewsService dependency
        const programService = new ProgramService(
          supabaseClient,
          interviewsService
        );

        // Call the complex interview creation method
        const result = await programService.createInterviews(
          programId,
          phaseId,
          isIndividual,
          roleIds,
          contactIds,
          interviewType,
          createdBy
        );

        return reply.send({
          success: true,
          data: result,
        });
      } catch (error) {
        fastify.log.error(error);

        // Handle validation errors vs other errors
        if (error instanceof Error) {
          const isValidationError =
            error.message.includes("must be selected") ||
            error.message.includes("questionnaire configured") ||
            error.message.includes("No questions found");

          return reply.status(isValidationError ? 400 : 500).send({
            success: false,
            error: error.message,
          });
        }

        return reply.status(500).send({
          success: false,
          error: "Internal server error",
        });
      }
    }
  );

  // GET /programs/:programId/objectives - Get objectives for a program
  fastify.get(
    "/:programId/objectives",
    {
      schema: {
        description: "Get all objectives for a program",
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
          },
          required: ["programId"],
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
                    created_at: { type: "string" },
                    description: { type: "string", nullable: true },
                    id: { type: "number" },
                    name: { type: "string" },
                    updated_at: { type: "string" },
                  },
                },
                required: [
                  "created_at",
                  "description",
                  "id",
                  "name",
                  "updated_at",
                ],
              },
            },
            required: ["success", "data"],
          },
          401: {
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
      const programId = (request.params as { programId: number }).programId;
      const programService = new ProgramService(request.supabaseClient);

      const objectives =
        await programService.getObjectivesByProgramId(programId);

      return reply.send({
        success: true,
        data: objectives,
      });
    }
  );

  // POST /programs/:programId/objectives - Create objective for a program
  fastify.post(
    "/:programId/objectives",
    {
      schema: {
        description: "Create a new objective for a program",
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
          },
          required: ["programId"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
          },
          required: ["name"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
            },
          },
          401: {
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
      const programId = (request.params as { programId: number }).programId;
      const { name, description } = request.body as {
        name: string;
        description?: string;
      };

      const programService = new ProgramService(request.supabaseClient);
      const objective = await programService.createObjective({
        name,
        description,
        program_id: programId,
      });

      return reply.send({
        success: true,
        data: objective,
      });
    }
  );

  // PUT /programs/:programId/objectives/:objectiveId - Update objective
  fastify.put(
    "/:programId/objectives/:objectiveId",
    {
      schema: {
        description: "Update a program objective",
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
            objectiveId: { type: "number" },
          },
          required: ["programId", "objectiveId"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
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
          401: {
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
      const { objectiveId } = request.params as {
        programId: number;
        objectiveId: number;
      };
      const updates = request.body as {
        name?: string;
        description?: string;
      };

      const programService = new ProgramService(request.supabaseClient);
      const objective = await programService.updateObjective(
        objectiveId,
        updates
      );

      return reply.send({
        success: true,
        data: objective,
      });
    }
  );

  // DELETE /programs/:programId/objectives/:objectiveId - Delete objective
  fastify.delete(
    "/:programId/objectives/:objectiveId",
    {
      schema: {
        description: "Delete a program objective",
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
            objectiveId: { type: "number" },
          },
          required: ["programId", "objectiveId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
          401: {
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
      const { objectiveId } = request.params as {
        programId: number;
        objectiveId: number;
      };

      const programService = new ProgramService(request.supabaseClient);
      await programService.deleteObjective(objectiveId);

      return reply.send({
        success: true,
      });
    }
  );

  // GET /programs/:programId/objectives/count - Get objective count
  fastify.get(
    "/:programId/objectives/count",
    {
      schema: {
        description: "Get the count of objectives for a program",
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
          },
          required: ["programId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "number" },
            },
          },
          401: {
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
      const programId = (request.params as { programId: number }).programId;
      const programService = new ProgramService(request.supabaseClient);

      const count = await programService.getObjectiveCount(programId);

      return reply.send({
        success: true,
        data: count,
      });
    }
  );

  fastify.get(
    "/:programId/measurements",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            includeDefinitions: { type: "boolean", default: false },
          },
        },
      },
    },
    async (request) => {
      const programId = (request.params as { programId: number }).programId;
      const { includeDefinitions } = request.query as {
        includeDefinitions: boolean;
      };
      const programService = new ProgramService(request.supabaseClient);

      const measurements = await programService.getProgramMeasurements(
        programId,
        includeDefinitions
      );

      return {
        success: true,
        data: measurements,
      };
    }
  );

  fastify.get("/:programId/measurements/available", async (request) => {
    const programId = (request.params as { programId: number }).programId;
    const programService = new ProgramService(request.supabaseClient);

    const measurements =
      await programService.getAvailableProgramMeasurements(programId);

    return {
      success: true,
      data: measurements,
    };
  });

  fastify.post("/:programId/measurement-definitions", async (request) => {
    const programId = (request.params as { programId: number }).programId;
    const { measurementDefinitionIds } = request.body as {
      measurementDefinitionIds: number[];
    };
    const programService = new ProgramService(request.supabaseClient);

    const data = await programService.addMeasurementDefinitionsToProgram(
      programId,
      measurementDefinitionIds
    );

    return {
      success: true,
      data,
    };
  });

  fastify.delete(
    "/:programId/measurement-definitions/:measurementDefinitionId",
    async (request) => {
      const programId = (request.params as { programId: number }).programId;
      const measurementDefinitionId = (
        request.params as { measurementDefinitionId: number }
      ).measurementDefinitionId;
      const programService = new ProgramService(request.supabaseClient);

      await programService.removeMeasurementDefinitionFromProgram(
        programId,
        measurementDefinitionId
      );

      return {
        success: true,
      };
    }
  );

  fastify.get(
    "/:programId/phases/:phaseId/calculated-measurements",
    async (request) => {
      const phaseId = (request.params as { phaseId: number }).phaseId;
      const programService = new ProgramService(request.supabaseClient);

      const measurements =
        await programService.getCalculatedMeasurementsForProgramPhase(phaseId);

      return {
        success: true,
        data: measurements,
      };
    }
  );

  fastify.get(
    "/:programId/phases/:phaseId/calculated-measurement",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            measurementId: { type: "number" },
            location: {
              type: "object",
              properties: {
                business_unit_id: { type: "string", nullable: true },
                region_id: { type: "string", nullable: true },
                site_id: { type: "string", nullable: true },
                asset_group_id: { type: "string", nullable: true },
                work_group_id: { type: "string", nullable: true },
                role_id: { type: "string", nullable: true },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const phaseId = (request.params as { phaseId: number }).phaseId;
      const { measurementId, location } = request.query as {
        measurementId?: number;
        location?: Record<string, string | null>;
      };
      const programService = new ProgramService(request.supabaseClient);

      const measurement =
        await programService.getCalculatedMeasurementForProgramPhase(
          phaseId,
          measurementId,
          location
        );

      return {
        success: true,
        data: measurement,
      };
    }
  );

  // POST endpoint to create a new measurement data
  fastify.post(
    "/:programId/phases/:phaseId/measurement-data",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
            phaseId: { type: "number" },
          },
          required: ["programId", "phaseId"],
        },
        body: {
          type: "object",
          properties: {
            measurement_definition_id: { type: "number" },
            calculated_value: { type: "number" },
            business_unit_id: { type: "number" },
            region_id: { type: "number" },
            site_id: { type: "number" },
            asset_group_id: { type: "number" },
            work_group_id: { type: "number" },
            role_id: { type: "number" },
          },
          required: ["measurement_definition_id", "calculated_value"],
        },
      },
    },
    async (request) => {
      const { phaseId } = request.params as { phaseId: number };
      const {
        measurement_definition_id,
        calculated_value,
        business_unit_id,
        region_id,
        site_id,
        asset_group_id,
        work_group_id,
        role_id,
      } = request.body as {
        measurement_definition_id: number;
        calculated_value: number;
        business_unit_id?: number;
        region_id?: number;
        site_id?: number;
        asset_group_id?: number;
        work_group_id?: number;
        role_id?: number;
      };

      const programService = new ProgramService(request.supabaseClient);

      const measurement = await programService.createCalculatedMeasurement({
        program_phase_id: phaseId,
        measurement_definition_id,
        calculated_value,
        business_unit_id,
        region_id,
        site_id,
        asset_group_id,
        work_group_id,
        role_id,
      });

      return {
        success: true,
        data: measurement,
      };
    }
  );

  // PUT endpoint to update an existing measurement data
  fastify.put(
    "/:programId/phases/:phaseId/measurement-data/:measurementId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
            phaseId: { type: "number" },
            measurementId: { type: "number" },
          },
          required: ["programId", "phaseId", "measurementId"],
        },
        body: {
          type: "object",
          properties: {
            calculated_value: { type: "number" },
          },
          required: ["calculated_value"],
        },
      },
    },
    async (request) => {
      const { measurementId } = request.params as { measurementId: number };
      const { calculated_value } = request.body as { calculated_value: number };

      const programService = new ProgramService(request.supabaseClient);
      const measurement = await programService.updateCalculatedMeasurement(
        measurementId,
        calculated_value
      );

      return {
        success: true,
        data: measurement,
      };
    }
  );

  // DELETE endpoint to remove a measurement data
  fastify.delete(
    "/:programId/phases/:phaseId/measurement-data/:measurementId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
            phaseId: { type: "number" },
            measurementId: { type: "number" },
          },
          required: ["programId", "phaseId", "measurementId"],
        },
      },
    },
    async (request) => {
      const { measurementId } = request.params as { measurementId: number };

      const programService = new ProgramService(request.supabaseClient);
      await programService.deleteCalculatedMeasurement(measurementId);

      return {
        success: true,
      };
    }
  );
}
