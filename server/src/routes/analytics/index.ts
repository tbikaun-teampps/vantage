import { FastifyInstance } from "fastify";
import {
  getOverallHeatmapFilters,
  getProgramInterviewsHeatmap,
  getProgramMeasurementsHeatmap,
  HeatmapService,
} from "../../services/analytics/HeatmapService";
import {
  getOverallDesktopGeographicalMapData,
  getOverallGeographicalMapFilters,
  getOverallOnsiteGeographicalMapData,
} from "../../services/analytics/GeographicalMapService";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  HeatmapFiltersQuerystringSchema,
  HeatmapFiltersResponseSchema,
  OnsiteHeatmapQuerystringSchema,
  OnsiteHeatmapResponseSchema,
  DesktopHeatmapQuerystringSchema,
  DesktopHeatmapResponseSchema,
  OnsiteGeographicalMapQuerystringSchema,
  GeographicalMapResponseSchema,
  DesktopGeographicalMapQuerystringSchema,
  DesktopGeographicalMapResponseSchema,
  GeographicalMapFiltersQuerystringSchema,
  GeographicalMapFiltersResponseSchema,
  ProgramIdParamsSchema,
  ProgramInterviewsQuerystringSchema,
  ProgramInterviewHeatmapResponseSchema,
  ProgramMeasurementsHeatmapResponseSchema,
  AnalyticsErrorResponseSchema,
} from "../../schemas/analytics";
import { Error500Schema } from "../../schemas/errors";

export async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Analytics"];
    }
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/heatmap/overall/filters",
    schema: {
      description: "Get overall heatmap filter options",
      querystring: HeatmapFiltersQuerystringSchema,
      response: {
        200: HeatmapFiltersResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId, assessmentType } = request.query;
      const { supabaseClient } = request;
      const filters = await getOverallHeatmapFilters(
        supabaseClient,
        companyId,
        assessmentType
      );
      return {
        success: true,
        data: filters,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/heatmap/overall/onsite",
    schema: {
      description: "Get overall onsite heatmap data",
      querystring: OnsiteHeatmapQuerystringSchema,
      response: {
        200: OnsiteHeatmapResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId, questionnaireId, assessmentId, xAxis, yAxis } =
        request.query;

      const { supabaseClient } = request;

      const heatmapService = new HeatmapService({
        type: "onsite",
        companyId,
        supabaseClient,
        questionnaireId,
        xAxis,
        yAxis,
        assessmentId,
      });

      const data = await heatmapService.getOnsiteHeatmap();
      return {
        success: true,
        data,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/heatmap/overall/desktop",
    schema: {
      description: "Get overall desktop heatmap data",
      querystring: DesktopHeatmapQuerystringSchema,
      response: {
        200: DesktopHeatmapResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId, assessmentId, xAxis } = request.query;

      const { supabaseClient } = request;

      const heatmapService = new HeatmapService({
        type: "desktop",
        companyId,
        supabaseClient,
        xAxis,
        yAxis: "measurement",
        assessmentId,
      });

      const data = await heatmapService.getDesktopHeatmap();

      return {
        success: true,
        data,
      };
    },
  });

  // Method for fetching overall onsite geographical map data
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/geographical-map/overall/onsite",
    schema: {
      description: "Get overall onsite geographical map data",
      querystring: OnsiteGeographicalMapQuerystringSchema,
      response: {
        200: GeographicalMapResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId, assessmentId, questionnaireId } = request.query;

      const { supabaseClient } = request;

      const data = await getOverallOnsiteGeographicalMapData(
        supabaseClient,
        companyId,
        questionnaireId,
        assessmentId
      );
      return {
        success: true,
        data,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/geographical-map/overall/desktop",
    schema: {
      description: "Get overall desktop geographical map data",
      querystring: DesktopGeographicalMapQuerystringSchema,
      response: {
        200: DesktopGeographicalMapResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId, assessmentId } = request.query;

      const { supabaseClient } = request;

      const data = await getOverallDesktopGeographicalMapData(
        supabaseClient,
        companyId,
        assessmentId
      );
      return {
        success: true,
        data,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/geographical-map/overall/filters",
    schema: {
      description: "Get overall geographical map filter options",
      querystring: GeographicalMapFiltersQuerystringSchema,
      response: {
        200: GeographicalMapFiltersResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId, assessmentType } = request.query;
      const { supabaseClient } = request;

      const filters = await getOverallGeographicalMapFilters(
        supabaseClient,
        companyId,
        assessmentType
      );

      return {
        success: true,
        data: filters,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/heatmap/program-interviews/:programId",
    schema: {
      description:
        "Get program interview heatmap data showing phase transitions",
      params: ProgramIdParamsSchema,
      querystring: ProgramInterviewsQuerystringSchema,
      response: {
        200: ProgramInterviewHeatmapResponseSchema,
        500: AnalyticsErrorResponseSchema,
      },
    },
    handler: async (request) => {
      const { programId } = request.params;
      const { questionnaireType } = request.query;
      const { supabaseClient } = request;

      const data = await getProgramInterviewsHeatmap(
        supabaseClient,
        programId,
        questionnaireType
      );

      return {
        success: true,
        data,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/heatmap/program-measurements/:programId",
    schema: {
      description:
        "Get program measurements heatmap data showing phase transitions",
      params: ProgramIdParamsSchema,
      response: {
        200: ProgramMeasurementsHeatmapResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { programId } = request.params;
      const { supabaseClient } = request;

      const data = await getProgramMeasurementsHeatmap(
        supabaseClient,
        programId
      );

      return {
        success: true,
        data,
      };
    },
  });
}
