import { FastifyInstance } from "fastify";
import { AuditService } from "../services/AuditService";
import {
  CompanyLogsDownloadParamsSchema,
  CompanyLogsDownloadSchema,
  CompanyLogsParamsSchema,
  CompanyLogsSchema,
} from "../schemas/audit";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { Error500Schema } from "../schemas/errors";

export async function auditRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Audit"];
    }
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/logs/:companyId",
    schema: {
      description: "Get audit logs for a company",
      params: CompanyLogsParamsSchema,
      response: {
        200: CompanyLogsSchema,
        500: Error500Schema,
      },
    },
    handler: async ({ params: { companyId } }) => {
      const auditService = new AuditService(fastify.supabase);
      const logs = await auditService.getAuditLogs(companyId);
      return {
        success: true,
        data: logs,
      };
    },
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/logs/:companyId/download",
    schema: {
      description: "Download audit logs as CSV",
      params: CompanyLogsDownloadParamsSchema,
      response: {
        200: CompanyLogsDownloadSchema,
        500: Error500Schema,
      },
    },
    handler: async ({ params: { companyId }, user }, reply) => {
      const auditService = new AuditService(fastify.supabase);
      const csvData = await auditService.downloadAuditLogs(user.id, companyId);
      // Generate filename with current date
      const date = new Date().toISOString().split("T")[0];
      const fileName = `audit-logs-${date}.csv`;
      // Set headers for CSV download
      reply.header("Content-Type", "text/csv");
      reply.header("Content-Disposition", `attachment; filename="${fileName}"`);
      return { success: true, data: csvData };
    },
  });
}
