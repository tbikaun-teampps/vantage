import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { NotFoundError } from "../../plugins/errorHandler";
import { DashboardService } from "../../services/DashboardService";
import {
  GetDashboardsParamsSchema,
  GetDashboardsResponseSchema,
  GetDashboardByIdParamsSchema,
  GetDashboardByIdResponseSchema,
  CreateDashboardParamsSchema,
  CreateDashboardBodySchema,
  CreateDashboardResponseSchema,
  UpdateDashboardParamsSchema,
  UpdateDashboardBodySchema,
  UpdateDashboardResponseSchema,
  DeleteDashboardParamsSchema,
  DeleteDashboardResponseSchema,
} from "../../schemas/dashboard";
import {
  Error401Schema,
  Error404Schema,
  Error500Schema,
} from "../../schemas/errors";
import { widgetsRoutes } from "./widgets";

export async function dashboardsRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Dashboards"];
    }
  });

  // Register widgets sub-routes
  await fastify.register(widgetsRoutes, { prefix: "/widgets" });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId",
    schema: {
      description: "Get all dashboards for a company",
      params: GetDashboardsParamsSchema,
      response: {
        200: GetDashboardsResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId } = request.params;
      const dashboardService = new DashboardService(
        request.supabaseClient,
        request.user.id
      );
      const dashboards = await dashboardService.getDashboards(companyId);

      return {
        success: true,
        data: dashboards,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/:dashboardId",
    schema: {
      description: "Get a specific dashboard by ID",
      params: GetDashboardByIdParamsSchema,
      response: {
        200: GetDashboardByIdResponseSchema,
        404: Error404Schema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { dashboardId } = request.params;
      const dashboardService = new DashboardService(
        request.supabaseClient,
        request.user.id
      );
      const dashboard = await dashboardService.getDashboardById(dashboardId);

      if (!dashboard) {
        throw new NotFoundError("Dashboard not found");
      }

      return {
        success: true,
        data: dashboard,
      };
    },
  });

  // POST create new dashboard
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:companyId",
    schema: {
      description: "Create a new dashboard",
      params: CreateDashboardParamsSchema,
      body: CreateDashboardBodySchema,
      response: {
        201: CreateDashboardResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId } = request.params;
      const input = request.body;

      const dashboardService = new DashboardService(
        request.supabaseClient,
        request.user.id
      );
      const dashboard = await dashboardService.createDashboard(
        companyId,
        input
      );

      return {
        success: true,
        data: dashboard,
      };
    },
  });

  // PATCH update dashboard
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:companyId/:dashboardId",
    schema: {
      description: "Update a dashboard",
      params: UpdateDashboardParamsSchema,
      body: UpdateDashboardBodySchema,
      response: {
        200: UpdateDashboardResponseSchema,
        404: Error404Schema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { dashboardId } = request.params;
      const updates = request.body;

      const dashboardService = new DashboardService(
        request.supabaseClient,
        request.user.id
      );
      const dashboard = await dashboardService.updateDashboard(
        dashboardId,
        updates
      );

      return {
        success: true,
        data: dashboard,
      };
    },
  });

  // DELETE soft delete dashboard
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:companyId/:dashboardId",
    schema: {
      description: "Delete a dashboard (soft delete)",
      params: DeleteDashboardParamsSchema,
      response: {
        200: DeleteDashboardResponseSchema,
        404: Error404Schema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { dashboardId } = request.params;

      const dashboardService = new DashboardService(
        request.supabaseClient,
        request.user.id
      );
      await dashboardService.deleteDashboard(dashboardId);

      return {
        success: true,
        message: "Dashboard deleted successfully",
      };
    },
  });
}
