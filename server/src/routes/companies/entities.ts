import { FastifyInstance } from "fastify";
import { z } from "zod";
import { companySchemas, query2tableMap } from "../../schemas/company";
import { commonResponseSchemas } from "../../schemas/common";
import {
  companyRoleMiddleware,
  requireCompanyRole,
} from "../../middleware/companyRole";
import { NotFoundError, BadRequestError } from "../../plugins/errorHandler";
import { ZodTypeProvider } from "fastify-type-provider-zod";

// Type alias for entity list data
type EntityListData = z.infer<typeof companySchemas.responses.entityList>["data"];

export async function entitiesRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/entities",
    preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
    schema: {
      description: "Get all entities for a company",
      params: companySchemas.params.companyId,
      querystring: companySchemas.querystring.entityType,
      response: {
        200: companySchemas.responses.entityList,
        400: commonResponseSchemas.responses[400],
        401: commonResponseSchemas.responses[401],
        500: commonResponseSchemas.responses[500],
      },
    },
    handler: async (request) => {
      const { type } = request.query;

      if (!type || !query2tableMap[type]) {
        throw new BadRequestError("Invalid 'type' query parameter");
      }

      const entities = await request.companiesService!.getCompanyEntities(
        request.params.companyId,
        type
      );

      // Type assertion is safe: data is validated by Zod schema at runtime
      return {
        success: true,
        data: entities as EntityListData,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:companyId/entities",
    preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
    schema: {
      description: "Create a new entity under the specified company",
      params: companySchemas.params.companyId,
      body: companySchemas.body.addEntity,
      querystring: companySchemas.querystring.entityType,
      response: {
        200: companySchemas.responses.entityList,
        400: commonResponseSchemas.responses[400],
        401: commonResponseSchemas.responses[401],
        500: commonResponseSchemas.responses[500],
      },
    },
    handler: async (request) => {
      const { type } = request.query;

      if (!type || !query2tableMap[type]) {
        throw new BadRequestError("Invalid 'type' query parameter");
      }
      const entity = await request.companiesService!.createCompanyEntity(
        request.params.companyId,
        type,
        request.body
      );

      // Type assertion is safe: data is validated by Zod schema at runtime
      return {
        success: true,
        data: [entity] as EntityListData,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:companyId/entities/:entityId",
    preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
    schema: {
      description: "Update an entity under the specified company",
      params: companySchemas.params.entityParams,
      querystring: companySchemas.querystring.entityType,
      body: companySchemas.body.updateEntity,
      response: {
        200: companySchemas.responses.entityList,
        400: commonResponseSchemas.responses[400],
        401: commonResponseSchemas.responses[401],
        404: commonResponseSchemas.responses[404],
        500: commonResponseSchemas.responses[500],
      },
    },

    handler: async (request) => {
      const { companyId, entityId } = request.params;
      const { type } = request.query;

      if (!type || !query2tableMap[type]) {
        throw new BadRequestError("Invalid 'type' query parameter");
      }

      const entity = await request.companiesService!.updateCompanyEntity(
        companyId,
        entityId,
        type,
        request.body
      );

      if (!entity) {
        throw new NotFoundError("Entity not found");
      }

      // Type assertion is safe: data is validated by Zod schema at runtime
      return {
        success: true,
        data: [entity] as EntityListData,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:companyId/entities/:entityId",
    preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
    schema: {
      description: "Delete an entity under the specified company",
      params: companySchemas.params.entityParams,
      querystring: companySchemas.querystring.entityType,
      response: {
        200: commonResponseSchemas.messageResponse,
        400: commonResponseSchemas.responses[400],
        401: commonResponseSchemas.responses[401],
        500: commonResponseSchemas.responses[500],
      },
    },
    handler: async (request) => {
      const { companyId, entityId } = request.params;
      const { type } = request.query;

      if (!type || !query2tableMap[type]) {
        throw new BadRequestError("Invalid 'type' query parameter");
      }

      const deleted = await request.companiesService!.deleteCompanyEntity(
        companyId,
        entityId,
        type
      );

      if (!deleted) {
        throw new NotFoundError("Entity not found");
      }

      return {
        success: true,
        message: "Entity deleted successfully",
      };
    },
  });
}
