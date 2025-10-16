import { FastifyInstance } from "fastify";
import { usersSchemas } from "../schemas/users.js";
import { UsersService } from "../services/UsersService.js";
import {
  UnauthorizedError,
  InternalServerError,
} from "../plugins/errorHandler.js";

export async function usersRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Users"];
    }
  });

  fastify.get(
    "/me",
    {
      schema: {
        description: "Get current authenticated user and profile",
        response: {
          200: usersSchemas.responses.userProfile,
          401: usersSchemas.responses[401],
          500: usersSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { user } = request;
      if (!user) {
        throw new UnauthorizedError();
      }

      const usersService = new UsersService(request.supabaseClient);
      const profile = await usersService.getUserProfile(user.id);

      if (!profile) {
        throw new InternalServerError("Failed to fetch profile");
      }

      return {
        user,
        profile,
      };
    }
  );
  fastify.put(
    "/subscription/:subscription_tier",
    {
      schema: {
        description: "Update user subscription",
        params: usersSchemas.params.subscriptionParams,
        response: {
          200: { type: "object", properties: { success: { type: "boolean" } } },
          401: usersSchemas.responses[401],
          500: usersSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { user } = request;
      if (!user) {
        throw new UnauthorizedError();
      }

      const { subscription_tier } = request.params as {
        subscription_tier: "demo" | "consultant" | "enterprise";
      };

      const usersService = new UsersService(request.supabaseClient);
      await usersService.updateSubscription(user.id, subscription_tier);
      return { success: true };
    }
  );
  fastify.put(
    "/profile",
    {
      schema: {
        description: "Update user profile",
        body: {
          type: "object",
          properties: {
            full_name: { type: "string" },
            // Add other updatable profile fields as needed
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              profile: { type: "object", additionalProperties: true },
            },
          },
          401: usersSchemas.responses[401],
          500: usersSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { user } = request;
      if (!user) {
        throw new UnauthorizedError();
      }

      const profileData = request.body as Record<string, unknown>;
      const usersService = new UsersService(request.supabaseClient);
      const updatedProfile = await usersService.updateProfile(
        user.id,
        profileData
      );

      return { success: true, profile: updatedProfile };
    }
  );

  fastify.put(
    "/onboarded",
    {
      schema: {
        description: "Mark user as onboarded",
        response: {
          200: { type: "object", properties: { success: { type: "boolean" } } },
          401: usersSchemas.responses[401],
          500: usersSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { user } = request;
      if (!user) {
        throw new UnauthorizedError();
      }

      const usersService = new UsersService(request.supabaseClient);
      await usersService.markUserAsOnboarded(user.id);
      return { success: true };
    }
  );
}
