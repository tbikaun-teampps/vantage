import { FastifyInstance } from "fastify";
import { InternalServerError } from "../../plugins/errorHandler";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  MeasurementIdParamsSchema,
  GetMeasurementDefinitionsResponseSchema,
  GetMeasurementDefinitionResponseSchema,
  MeasurementDefinitionSchema,
} from "../../schemas/shared";
import { Error500Schema } from "../../schemas/errors";

export async function measurementsRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/measurement-definitions",
    schema: {
      description: "Get all measurement definitions",
      response: {
        200: GetMeasurementDefinitionsResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { data, error } = await request.supabaseClient
        .from("measurement_definitions")
        .select("*");

      if (error || !data || data.length === 0 || data === null) {
        throw new InternalServerError("Failed to fetch measurements");
      }

      const parsedData = data.map((item) =>
        MeasurementDefinitionSchema.parse(item)
      );
      return { success: true, data: parsedData };
    },
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/measurement-definitions/:id",
    schema: {
      description: "Get a single measurement definition by ID",
      params: MeasurementIdParamsSchema,
      response: {
        200: GetMeasurementDefinitionResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { id } = request.params;

      const { data, error } = await request.supabaseClient
        .from("measurement_definitions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new InternalServerError("Failed to fetch measurement definition");
      }
      const parsedData = MeasurementDefinitionSchema.parse(data);
      return { success: true, data: parsedData };
    },
  });
}
