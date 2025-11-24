import { FastifyInstance } from "fastify";
import { SharedRolesService } from "../../services/SharedRolesService.js";
import { measurementsRoutes } from "./measurements.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  RoleIdParamsSchema,
  CreateRoleBodySchema,
  UpdateRoleBodySchema,
  GetRolesResponseSchema,
  CreateRoleResponseSchema,
  UpdateRoleResponseSchema,
  SuccessResponseSchema,
} from "../../schemas/shared";
import {
  Error400Schema,
  Error401Schema,
  Error403Schema,
  Error404Schema,
  Error500Schema,
} from "../../schemas/errors";

export async function sharedRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Shared"];
    }
  });
  measurementsRoutes(fastify);

  // GET /shared/roles - Get all shared roles
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/roles",
    schema: {
      description: "Get all shared roles (system roles + user-created roles)",
      response: {
        200: GetRolesResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const userId = request.user.id;
      const service = new SharedRolesService(request.supabaseClient, userId);

      const roles = await service.getAllRoles();

      // Add readOnly property if the requesting user didn't create the role
      const rolesWithReadOnly = roles.map((role) => ({
        ...role,
        read_only: role.created_by !== userId,
      }));

      return { data: rolesWithReadOnly, success: true };
    },
  });

  // POST /shared/roles - Create a new shared role
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/roles",
    schema: {
      description: "Create a new shared role",
      body: CreateRoleBodySchema,
      response: {
        201: CreateRoleResponseSchema,
        400: Error400Schema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      try {
        const userId = request.user.id;
        const body = request.body;

        const service = new SharedRolesService(request.supabaseClient, userId);
        const newRole = await service.createRole({
          name: body.name,
          description: body.description || null,
          company_id: body.companyId,
        });

        return reply.status(201).send({ data: newRole, success: true });
      } catch (error) {
        const statusCode =
          error instanceof Error &&
          error.message.includes("role with this name already exists")
            ? 400
            : 500;

        return reply.status(statusCode).send({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  });

  // PUT /shared/roles/:roleId - Update an existing shared role
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/roles/:roleId",
    schema: {
      description: "Update an existing shared role",
      params: RoleIdParamsSchema,
      body: UpdateRoleBodySchema,
      response: {
        200: UpdateRoleResponseSchema,
        400: Error400Schema,
        401: Error401Schema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const userId = request.user.id;
      const { roleId } = request.params;
      const body = request.body;

      const service = new SharedRolesService(request.supabaseClient, userId);
      const updatedRole = await service.updateRole(roleId, {
        name: body.name,
        description: body.description,
      });

      return { data: updatedRole, success: true };
    },
  });

  // DELETE /shared/roles/:roleId - Delete a shared role
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/roles/:roleId",
    schema: {
      description: "Delete a shared role (soft delete)",
      params: RoleIdParamsSchema,
      response: {
        200: SuccessResponseSchema,
        400: Error400Schema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const userId = request.user.id;
      const { roleId } = request.params;

      const service = new SharedRolesService(request.supabaseClient, userId);
      await service.deleteRole(roleId);

      return { success: true };
    },
  });
}
