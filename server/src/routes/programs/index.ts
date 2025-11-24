import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ProgramService } from "../../services/ProgramService.js";
import { InterviewsService } from "../../services/InterviewsService.js";
import {
  ProgramPhaseStatus,
  ProgramStatus,
} from "../../types/entities/programs.js";
import {
  GetProgramsQuerySchema,
  GetProgramsResponseSchema,
  CreateProgramBodySchema,
  CreateProgramResponseSchema,
  GetProgramByIdParamsSchema,
  GetProgramByIdResponseSchema,
  UpdateProgramParamsSchema,
  UpdateProgramBodySchema,
  UpdateProgramResponseSchema,
} from "../../schemas/programs/index.js";
import {
  AddProgramPhaseParamsSchema,
  AddProgramPhaseBodySchema,
  AddProgramPhaseResponseSchema,
  UpdateProgramPhaseParamsSchema,
  UpdateProgramPhaseBodySchema,
  UpdateProgramPhaseResponseSchema,
  DeleteProgramPhaseParamsSchema,
  DeleteProgramPhaseResponseSchema,
} from "../../schemas/programs/phases.js";
import {
  GetObjectivesParamsSchema,
  GetObjectivesResponseSchema,
  CreateObjectiveParamsSchema,
  CreateObjectiveBodySchema,
  CreateObjectiveResponseSchema,
  UpdateObjectiveParamsSchema,
  UpdateObjectiveBodySchema,
  UpdateObjectiveResponseSchema,
  DeleteObjectiveParamsSchema,
  DeleteObjectiveResponseSchema,
  GetObjectiveCountParamsSchema,
  GetObjectiveCountResponseSchema,
} from "../../schemas/programs/objectives.js";
import {
  GetMeasurementsParamsSchema,
  GetMeasurementsQuerySchema,
  GetMeasurementsResponseSchema,
  GetAllowedMeasurementDefinitionsParamsSchema,
  GetAllowedMeasurementDefinitionsResponseSchema,
  GetAvailableMeasurementsParamsSchema,
  GetAvailableMeasurementsResponseSchema,
  AddMeasurementDefinitionsParamsSchema,
  AddMeasurementDefinitionsBodySchema,
  AddMeasurementDefinitionsResponseSchema,
  RemoveMeasurementDefinitionParamsSchema,
  RemoveMeasurementDefinitionResponseSchema,
  GetCalculatedMeasurementsParamsSchema,
  GetCalculatedMeasurementsQuerySchema,
  GetCalculatedMeasurementsResponseSchema,
  GetCalculatedMeasurementParamsSchema,
  GetCalculatedMeasurementQuerySchema,
  GetCalculatedMeasurementResponseSchema,
  CreateMeasurementDataParamsSchema,
  CreateMeasurementDataBodySchema,
  CreateMeasurementDataResponseSchema,
  UpdateMeasurementDataParamsSchema,
  UpdateMeasurementDataBodySchema,
  UpdateMeasurementDataResponseSchema,
  DeleteMeasurementDataParamsSchema,
  DeleteMeasurementDataResponseSchema,
} from "../../schemas/programs/measurements.js";
import {
  CreateInterviewsParamsSchema,
  CreateInterviewsBodySchema,
  CreateInterviewsResponseSchema,
  CreateInterviewsError400Schema,
} from "../../schemas/programs/interviews.js";
import { Error401Schema, Error500Schema } from "../../schemas/errors.js";

export async function programRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Programs"];
    }
  });
  // Method to get all programs
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "",
    schema: {
      querystring: GetProgramsQuerySchema,
      response: {
        200: GetProgramsResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId } = request.query;
      const programService = new ProgramService(request.supabaseClient);

      const programs = await programService.getPrograms(companyId);

      return {
        success: true,
        data: programs,
      };
    },
  });

  // Method for creating a program
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "",
    schema: {
      body: CreateProgramBodySchema,
      response: {
        201: CreateProgramResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { name, description, company_id } = request.body;

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
    },
  });

  // Method for getting a program by ID
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:programId",
    schema: {
      params: GetProgramByIdParamsSchema,
      response: {
        200: GetProgramByIdResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { programId } = request.params;
      const programService = new ProgramService(request.supabaseClient);
      const program = await programService.getProgramById(programId);

      return {
        success: true,
        data: program,
      };
    },
  });

  // Method for updating a programs details
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:programId",
    schema: {
      params: UpdateProgramParamsSchema,
      body: UpdateProgramBodySchema,
      response: {
        200: UpdateProgramResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { programId } = request.params;
      const {
        name,
        description,
        status,
        presite_questionnaire_id,
        onsite_questionnaire_id,
      } = request.body;

      const programService = new ProgramService(request.supabaseClient);
      const program = await programService.updateProgram(programId, {
        name,
        description,
        status: status as ProgramStatus | undefined,
        presite_questionnaire_id: presite_questionnaire_id ?? undefined,
        onsite_questionnaire_id: onsite_questionnaire_id ?? undefined,
      });

      return {
        success: true,
        data: program,
      };
    },
  });

  // Method for deleting a program
  // TODO: Add cascade delete for related entities.

  // Method for adding a program phase
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:programId/phases",
    schema: {
      params: AddProgramPhaseParamsSchema,
      body: AddProgramPhaseBodySchema,
      response: {
        201: AddProgramPhaseResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { programId } = request.params;
      const { name, planned_start_date, planned_end_date, activate } =
        request.body;

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
    },
  });

  // Method for updating a program phase
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:programId/phases/:phaseId",
    schema: {
      params: UpdateProgramPhaseParamsSchema,
      body: UpdateProgramPhaseBodySchema,
      response: {
        200: UpdateProgramPhaseResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { phaseId } = request.params;
      const updates = request.body;

      const programService = new ProgramService(request.supabaseClient);
      const phase = await programService.updateProgramPhase(phaseId, {
        ...updates,
        status: updates.status as ProgramPhaseStatus | undefined,
      });
      return {
        success: true,
        data: phase,
      };
    },
  });

  // Method to delete a program phase
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:programId/phases/:phaseId",
    schema: {
      params: DeleteProgramPhaseParamsSchema,
      response: {
        200: DeleteProgramPhaseResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { phaseId } = request.params;

      const programService = new ProgramService(request.supabaseClient);
      await programService.deleteProgramPhase(phaseId);

      return {
        success: true,
        message: "Phase deleted successfully",
      };
    },
  });

  // POST /programs/:programId/interviews - Create interviews for a program phase
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:programId/interviews",
    schema: {
      params: CreateInterviewsParamsSchema,
      body: CreateInterviewsBodySchema,
      response: {
        201: CreateInterviewsResponseSchema,
        400: CreateInterviewsError400Schema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { programId } = request.params;
        const {
          phaseId,
          isIndividual = false,
          roleIds,
          contactIds,
          interviewType,
        } = request.body;

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
    },
  });

  // GET /programs/:programId/objectives - Get objectives for a program
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:programId/objectives",
    schema: {
      description: "Get all objectives for a program",
      params: GetObjectivesParamsSchema,
      response: {
        200: GetObjectivesResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const { programId } = request.params;
      const programService = new ProgramService(request.supabaseClient);

      const objectives =
        await programService.getObjectivesByProgramId(programId);

      return reply.send({
        success: true,
        data: objectives,
      });
    },
  });

  // POST /programs/:programId/objectives - Create objective for a program
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:programId/objectives",
    schema: {
      description: "Create a new objective for a program",
      params: CreateObjectiveParamsSchema,
      body: CreateObjectiveBodySchema,
      response: {
        200: CreateObjectiveResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const { programId } = request.params;
      const { name, description } = request.body;

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
    },
  });

  // PUT /programs/:programId/objectives/:objectiveId - Update objective
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:programId/objectives/:objectiveId",
    schema: {
      description: "Update a program objective",
      params: UpdateObjectiveParamsSchema,
      body: UpdateObjectiveBodySchema,
      response: {
        200: UpdateObjectiveResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const { objectiveId } = request.params;
      const updates = request.body;

      const programService = new ProgramService(request.supabaseClient);
      const objective = await programService.updateObjective(
        objectiveId,
        updates
      );

      return reply.send({
        success: true,
        data: objective,
      });
    },
  });

  // DELETE /programs/:programId/objectives/:objectiveId - Delete objective
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:programId/objectives/:objectiveId",
    schema: {
      description: "Delete a program objective",
      params: DeleteObjectiveParamsSchema,
      response: {
        200: DeleteObjectiveResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const { objectiveId } = request.params;

      const programService = new ProgramService(request.supabaseClient);
      await programService.deleteObjective(objectiveId);

      return reply.send({
        success: true,
        message: "Objective deleted successfully",
      });
    },
  });

  // GET /programs/:programId/objectives/count - Get objective count
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:programId/objectives/count",
    schema: {
      description: "Get the count of objectives for a program",
      params: GetObjectiveCountParamsSchema,
      response: {
        200: GetObjectiveCountResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const { programId } = request.params;
      const programService = new ProgramService(request.supabaseClient);

      const count = await programService.getObjectiveCount(programId);

      return reply.send({
        success: true,
        data: { count },
      });
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:programId/measurements",
    schema: {
      params: GetMeasurementsParamsSchema,
      querystring: GetMeasurementsQuerySchema,
      response: {
        200: GetMeasurementsResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { programId } = request.params;
      const { includeDefinitions } = request.query;
      const programService = new ProgramService(request.supabaseClient);

      const measurements = await programService.getProgramMeasurements(
        programId,
        includeDefinitions
      );

      console.log("measurements:", measurements);

      return {
        success: true,
        data: measurements,
      };
    },
  });

  // GET /programs/:programId/measurement-definitions/allowed - Get allowed measurement definitions for a program
  // These are the measurement definitions linked to the program and constrain the measurements that can be collected
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:programId/measurement-definitions/allowed",
    schema: {
      params: GetAllowedMeasurementDefinitionsParamsSchema,
      response: {
        200: GetAllowedMeasurementDefinitionsResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { programId } = request.params;
      const programService = new ProgramService(request.supabaseClient);

      const measurementDefinitions =
        await programService.getProgramMeasurementDefinitions(programId);

      return {
        success: true,
        data: measurementDefinitions,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:programId/measurements/available",
    schema: {
      params: GetAvailableMeasurementsParamsSchema,
      response: {
        200: GetAvailableMeasurementsResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { programId } = request.params;
      const programService = new ProgramService(request.supabaseClient);

      const measurements =
        await programService.getAvailableProgramMeasurements(programId);

      return {
        success: true,
        data: measurements,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:programId/measurement-definitions",
    schema: {
      params: AddMeasurementDefinitionsParamsSchema,
      body: AddMeasurementDefinitionsBodySchema,
      response: {
        201: AddMeasurementDefinitionsResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { programId } = request.params;
      const { measurementDefinitionIds } = request.body;
      const programService = new ProgramService(request.supabaseClient);

      const data = await programService.addMeasurementDefinitionsToProgram(
        programId,
        measurementDefinitionIds
      );

      return {
        success: true,
        data,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:programId/measurement-definitions/:measurementDefinitionId",
    schema: {
      params: RemoveMeasurementDefinitionParamsSchema,
      response: {
        200: RemoveMeasurementDefinitionResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { programId, measurementDefinitionId } = request.params;
      const programService = new ProgramService(request.supabaseClient);

      await programService.removeMeasurementDefinitionFromProgram(
        programId,
        measurementDefinitionId
      );

      return {
        success: true,
        message: "Measurement definition removed successfully",
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:programId/phases/:phaseId/calculated-measurements",
    schema: {
      params: GetCalculatedMeasurementsParamsSchema,
      querystring: GetCalculatedMeasurementsQuerySchema,
      response: {
        200: GetCalculatedMeasurementsResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { phaseId } = request.params;
      const { measurementDefinitionId } = request.query;
      const programService = new ProgramService(request.supabaseClient);

      const measurements =
        await programService.getCalculatedMeasurementsForProgramPhase({
          programPhaseId: phaseId,
          filters: { measurementDefinitionId },
        });
      return {
        success: true,
        data: measurements,
      };
    },
  });

  // GET endpoint to fetch calculated measurement for a program phase
  // Supports both old format (separate location fields) and new format (location object with id + type)
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:programId/phases/:phaseId/calculated-measurement",
    schema: {
      params: GetCalculatedMeasurementParamsSchema,
      querystring: GetCalculatedMeasurementQuerySchema,
      response: {
        200: GetCalculatedMeasurementResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { phaseId } = request.params;
      const {
        measurementId,
        measurementDefinitionId,
        location_id,
        location_type,
      } = request.query;

      // Reconstruct location object if both parts are provided
      const location =
        location_id && location_type
          ? { id: location_id, type: location_type as any }
          : undefined;

      const programService = new ProgramService(request.supabaseClient);

      const measurement =
        await programService.getCalculatedMeasurementForProgramPhase(
          phaseId,
          measurementId,
          measurementDefinitionId,
          location
        );

      return {
        success: true,
        data: measurement,
      };
    },
  });

  // POST endpoint to create a new measurement data
  // Supports both old format (separate location fields) and new format (location object with id + type)
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:programId/phases/:phaseId/measurement-data",
    schema: {
      params: CreateMeasurementDataParamsSchema,
      body: CreateMeasurementDataBodySchema,
      response: {
        201: CreateMeasurementDataResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { phaseId } = request.params;
      const body = request.body;

      const programService = new ProgramService(request.supabaseClient);

      // Pass the entire body to the service, which handles both formats
      const measurement = await programService.createCalculatedMeasurement({
        program_phase_id: phaseId,
        ...body,
      } as any);

      return {
        success: true,
        data: measurement,
      };
    },
  });

  // PUT endpoint to update an existing measurement data
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:programId/phases/:phaseId/measurement-data/:measurementId",
    schema: {
      params: UpdateMeasurementDataParamsSchema,
      body: UpdateMeasurementDataBodySchema,
      response: {
        200: UpdateMeasurementDataResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { measurementId } = request.params;
      const { calculated_value } = request.body;

      const programService = new ProgramService(request.supabaseClient);
      const measurement = await programService.updateCalculatedMeasurement(
        measurementId,
        calculated_value
      );

      return {
        success: true,
        data: measurement,
      };
    },
  });

  // DELETE endpoint to remove a measurement data
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:programId/phases/:phaseId/measurement-data/:measurementId",
    schema: {
      params: DeleteMeasurementDataParamsSchema,
      response: {
        200: DeleteMeasurementDataResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { measurementId } = request.params;

      const programService = new ProgramService(request.supabaseClient);
      await programService.deleteCalculatedMeasurement(measurementId);

      return {
        success: true,
      };
    },
  });
}
