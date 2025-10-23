import { FastifyInstance } from "fastify";
import { ProgramService } from "../services/ProgramService.js";

export async function programRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Programs"];
    }
  });
  // GET /programs - Get all programs
  fastify.get(
    "",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            company_id: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "array",
                items: { type: "object" },
              },
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
      const { company_id } = request.query as { company_id?: string };
      const programService = new ProgramService(request.supabaseClient);

      const programs = await programService.getPrograms(company_id);

      return reply.send({
        success: true,
        data: programs,
      });
    }
  );

  // POST /programs/:id/interviews - Create interviews for a program phase
  fastify.post(
    "/:id/interviews",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
          required: ["id"],
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
        const programId = (request.params as { id: number }).id;
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
        const programService = new ProgramService(supabaseClient);

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

  // GET /programs/:id/objectives - Get objectives for a program
  fastify.get(
    "/:id/objectives",
    {
      schema: {
        description: "Get all objectives for a program",
        params: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "array",
                items: { type: "object" },
              },
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
      const programId = (request.params as { id: number }).id;
      const programService = new ProgramService(request.supabaseClient);

      const objectives = await programService.getObjectivesByProgramId(programId);

      return reply.send({
        success: true,
        data: objectives,
      });
    }
  );

  // POST /programs/:id/objectives - Create objective for a program
  fastify.post(
    "/:id/objectives",
    {
      schema: {
        description: "Create a new objective for a program",
        params: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
          required: ["id"],
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
      const programId = (request.params as { id: number }).id;
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

  // PUT /programs/:id/objectives/:objectiveId - Update objective
  fastify.put(
    "/:id/objectives/:objectiveId",
    {
      schema: {
        description: "Update a program objective",
        params: {
          type: "object",
          properties: {
            id: { type: "number" },
            objectiveId: { type: "number" },
          },
          required: ["id", "objectiveId"],
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
        id: number;
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

  // DELETE /programs/:id/objectives/:objectiveId - Delete objective
  fastify.delete(
    "/:id/objectives/:objectiveId",
    {
      schema: {
        description: "Delete a program objective",
        params: {
          type: "object",
          properties: {
            id: { type: "number" },
            objectiveId: { type: "number" },
          },
          required: ["id", "objectiveId"],
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
        id: number;
        objectiveId: number;
      };

      const programService = new ProgramService(request.supabaseClient);
      await programService.deleteObjective(objectiveId);

      return reply.send({
        success: true,
      });
    }
  );

  // GET /programs/:id/objectives/count - Get objective count
  fastify.get(
    "/:id/objectives/count",
    {
      schema: {
        description: "Get the count of objectives for a program",
        params: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
          required: ["id"],
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
      const programId = (request.params as { id: number }).id;
      const programService = new ProgramService(request.supabaseClient);

      const count = await programService.getObjectiveCount(programId);

      return reply.send({
        success: true,
        data: count,
      });
    }
  );
}
