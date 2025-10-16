import { FastifyInstance } from "fastify";
import { WidgetService } from "../../services/WidgetService";
import { widgetSchemas } from "../../schemas/widget";
import { commonResponseSchemas } from "../../schemas/common";

export async function widgetsRoutes(fastify: FastifyInstance) {
  // GET config options for widget configuration
  // Route: /dashboards/widgets/:companyId/config-options
  fastify.get(
    "/:companyId/config-options",
    {
      schema: {
        description:
          "Get available options for widget configuration (assessments, programs, interviews)",
        params: {
          type: "object",
          properties: {
            companyId: { type: "string" },
          },
          required: ["companyId"],
        },
        response: {
          200: widgetSchemas.responses.configOptions,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params as { companyId: string };

      const widgetService = new WidgetService(
        companyId,
        request.supabaseClient
      );
      const data = await widgetService.getConfigOptions();

      return reply.send({
        success: true,
        data,
      });
    }
  );

  // GET activity data for widgets
  // Route: /dashboards/widgets/:companyId/activity
  fastify.get(
    "/:companyId/activity",
    {
      schema: {
        description: "Get activity data for a widget (status breakdown)",
        params: {
          type: "object",
          properties: {
            companyId: { type: "string" },
          },
          required: ["companyId"],
        },
        querystring: widgetSchemas.querystring.activity,
        response: {
          200: widgetSchemas.responses.activityData,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params as { companyId: string };
      const { entityType } = request.query as {
        entityType: "interviews" | "assessments" | "programs";
      };

      const widgetService = new WidgetService(
        companyId,
        request.supabaseClient
      );
      const data = await widgetService.getActivityData(entityType);

      return reply.send({
        success: true,
        data,
      });
    }
  );

  // GET metric data for widgets
  // Route: /dashboards/widgets/:companyId/metrics
  fastify.get(
    "/:companyId/metrics",
    {
      schema: {
        description: "Get metric data for a widget",
        params: {
          type: "object",
          properties: {
            companyId: { type: "string" },
          },
          required: ["companyId"],
        },
        querystring: widgetSchemas.querystring.metrics,
        response: {
          200: widgetSchemas.responses.metricData,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params as { companyId: string };
      const { metricType, title } = request.query as {
        metricType:
          | "generated-actions"
          | "generated-recommendations"
          | "worst-performing-domain"
          | "high-risk-areas"
          | "assessment-activity";
        title?: string;
      };

      const widgetService = new WidgetService(
        companyId,
        request.supabaseClient
      );
      const data = await widgetService.getMetricData(metricType, title);

      return reply.send({
        success: true,
        data,
      });
    }
  );

  // GET table data for widgets
  // Route: /dashboards/widgets/:companyId/table
  fastify.get(
    "/:companyId/table",
    {
      schema: {
        description: "Get table data for a widget",
        params: {
          type: "object",
          properties: {
            companyId: { type: "string" },
          },
          required: ["companyId"],
        },
        querystring: widgetSchemas.querystring.table,
        response: {
          200: widgetSchemas.responses.tableData,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params as { companyId: string };
      const { entityType, assessmentId, programId } = request.query as {
        entityType: "actions" | "recommendations" | "comments";
        assessmentId?: number;
        programId?: number;
      };

      const widgetService = new WidgetService(
        companyId,
        request.supabaseClient
      );
      const data = await widgetService.getTableData(
        entityType,
        assessmentId,
        programId
      );

      return reply.send({
        success: true,
        data,
      });
    }
  );

  // GET actions data for widgets
  // Route: /dashboards/widgets/:companyId/actions
  fastify.get(
    "/:companyId/actions",
    {
      schema: {
        description: "Get actions data for a widget",
        params: {
          type: "object",
          properties: {
            companyId: { type: "string" },
          },
          required: ["companyId"],
        },
        querystring: widgetSchemas.querystring.actions,
        response: {
          200: widgetSchemas.responses.actionsData,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params as { companyId: string };

      const widgetService = new WidgetService(
        companyId,
        request.supabaseClient
      );
      const data = await widgetService.getActionsData();

      return reply.send({
        success: true,
        data,
      });
    }
  );
}
