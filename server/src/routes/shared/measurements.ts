import { FastifyInstance } from "fastify";
import { InternalServerError } from "../../plugins/errorHandler";

export async function measurementsRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/measurement-definitions",
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
                    id: { type: "number" },
                    name: { type: "string" },
                    active: { type: "boolean" },
                    calculation: { type: "string" },
                    calculation_type: { type: "string" },
                    description: { type: "string" },
                    max_value: { type: "number" },
                    min_value: { type: "number" },
                    unit: { type: "string" },
                    objective: { type: "string" },
                    provider: { type: "string" },
                    required_csv_columns: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          data_type: { type: "string" },
                          description: { type: "string" },
                        },
                        required: ["name", "data_type", "description"],
                      },
                    },
                  },
                  required: [
                    "id",
                    "name",
                    "active",
                    "calculation",
                    "calculation_type",
                    "description",
                    "max_value",
                    "min_value",
                    "unit",
                    "objective",
                    "provider",
                    "required_csv_columns",
                  ],
                },
              },
            },
            required: ["success", "data"],
          },
        },
      },
    },
    async (request) => {
      const { data, error } = await request.supabaseClient
        .from("measurement_definitions")
        .select("*");

      if (error) {
        throw new InternalServerError("Failed to fetch measurements");
      }

      return { success: true, data };
    }
  );
  fastify.get("/measurement-definitions/:id", async (request) => {
    const { id } = request.params as { id: number };

    const { data, error } = await request.supabaseClient
      .from("measurement_definitions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new InternalServerError("Failed to fetch measurement definition");
    }

    return { success: true, data };
  });
}
