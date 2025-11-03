import { FastifyInstance } from "fastify";
import { AuditService } from "../services/AuditService";

export async function auditRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Audit"];
    }
  });
  fastify.get(
    "/logs/:companyId",
    {
      schema: {
        params: {
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
                    user: {
                      type: "object",
                      properties: {
                        full_name: { type: "string" },
                        email: { type: "string" },
                      },
                      required: ["full_name", "email"],
                    },
                    created_at: { type: "string", format: "date-time" },
                    changed_fields: {
                      type: "array",
                      items: { type: "string" },
                    },
                    message: { type: "string" },
                  },
                  required: [
                    "id",
                    "user",
                    "created_at",
                    "changed_fields",
                    "message",
                  ],
                },
              },
            },
            required: ["success", "data"],
          },
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params as { companyId: string };

      const auditService = new AuditService(fastify.supabase);
      const logs = await auditService.getAuditLogs(companyId);
      return reply.send({
        success: true,
        data: logs,
      });
    }
  );
  fastify.get(
    "/logs/:companyId/download",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            companyId: { type: "string" },
          },
          required: ["companyId"],
        },
        response: {
          200: {
            type: "string",
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
            required: ["success", "error"],
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { companyId } = request.params as { companyId: string };
        const auditService = new AuditService(fastify.supabase);
        const csvData = await auditService.downloadAuditLogs(
          request.user.id,
          companyId
        );
        // Generate filename with current date
        const date = new Date().toISOString().split("T")[0];
        const fileName = `audit-logs-${date}.csv`;
        // Set headers for CSV download
        reply.header("Content-Type", "text/csv");
        reply.header(
          "Content-Disposition",
          `attachment; filename="${fileName}"`
        );
        return reply.send(csvData);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          success: false,
          error: "Failed to download audit logs",
        });
      }
    }
  );
}
