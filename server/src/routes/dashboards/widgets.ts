import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { WidgetService } from "../../services/WidgetService";
import {
  GetConfigOptionsParamsSchema,
  GetConfigOptionsResponseSchema,
  GetActivityDataParamsSchema,
  GetActivityDataQuerySchema,
  GetActivityDataResponseSchema,
  GetMetricDataParamsSchema,
  GetMetricDataQuerySchema,
  GetMetricDataResponseSchema,
  GetTableDataParamsSchema,
  GetTableDataQuerySchema,
  GetTableDataResponseSchema,
  GetActionsDataParamsSchema,
  GetActionsDataQuerySchema,
  GetActionsDataResponseSchema,
} from "../../schemas/widget";
import { Error401Schema, Error500Schema } from "../../schemas/errors";

export async function widgetsRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/config-options",
    schema: {
      description:
        "Get available options for widget configuration (assessments, programs, interviews)",
      params: GetConfigOptionsParamsSchema,
      response: {
        200: GetConfigOptionsResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const widgetService = new WidgetService(
        request.params.companyId,
        request.supabaseClient
      );
      const data = await widgetService.getConfigOptions();

      return {
        success: true,
        data,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/activity",
    schema: {
      description: "Get activity data for a widget (status breakdown)",
      params: GetActivityDataParamsSchema,
      querystring: GetActivityDataQuerySchema,
      response: {
        200: GetActivityDataResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const widgetService = new WidgetService(
        request.params.companyId,
        request.supabaseClient
      );
      const data = await widgetService.getActivityData(
        request.query.entityType
      );

      return {
        success: true,
        data,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/metrics",
    schema: {
      description: "Get metric data for a widget",
      params: GetMetricDataParamsSchema,
      querystring: GetMetricDataQuerySchema,
      response: {
        200: GetMetricDataResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { metricType, title } = request.query;

      const widgetService = new WidgetService(
        request.params.companyId,
        request.supabaseClient
      );
      const data = await widgetService.getMetricData(metricType, title);

      return {
        success: true,
        data,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/table",
    schema: {
      description: "Get table data for a widget",
      params: GetTableDataParamsSchema,
      querystring: GetTableDataQuerySchema,
      response: {
        200: GetTableDataResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { entityType, assessmentId, programId } = request.query;

      const widgetService = new WidgetService(
        request.params.companyId,
        request.supabaseClient
      );
      const data = await widgetService.getTableData(
        entityType,
        assessmentId,
        programId
      );

      return {
        success: true,
        data,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/actions",
    schema: {
      description: "Get actions data for a widget",
      params: GetActionsDataParamsSchema,
      querystring: GetActionsDataQuerySchema,
      response: {
        200: GetActionsDataResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const widgetService = new WidgetService(
        request.params.companyId,
        request.supabaseClient
      );
      const data = await widgetService.getActionsData();

      return {
        success: true,
        data,
      };
    },
  });
}
