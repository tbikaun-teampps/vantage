import { FastifyInstance } from "fastify";
import { UsersService } from "../services/UsersService.js";
import {
  UnauthorizedError,
  InternalServerError,
} from "../plugins/errorHandler.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  SubscriptionTierParamsSchema,
  UpdateProfileBodySchema,
  UserProfileResponseSchema,
  SuccessResponseSchema,
  UpdateProfileResponseSchema,
} from "../schemas/users";
import { Error401Schema, Error500Schema } from "../schemas/errors";

export async function usersRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Users"];
    }
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/me",
    schema: {
      description: "Get current authenticated user and profile",
      response: {
        200: UserProfileResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
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
    },
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/subscription/:subscription_tier",
    schema: {
      description: "Update user subscription",
      params: SubscriptionTierParamsSchema,
      response: {
        200: SuccessResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { user } = request;
      if (!user) {
        throw new UnauthorizedError();
      }

      const { subscription_tier } = request.params;

      const usersService = new UsersService(request.supabaseClient);
      await usersService.updateSubscription(user.id, subscription_tier);
      return { success: true };
    },
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/profile",
    schema: {
      description: "Update user profile",
      body: UpdateProfileBodySchema,
      response: {
        200: UpdateProfileResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
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
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/onboarded",
    schema: {
      description: "Mark user as onboarded",
      response: {
        200: SuccessResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { user } = request;
      if (!user) {
        throw new UnauthorizedError();
      }

      const usersService = new UsersService(request.supabaseClient);
      await usersService.markUserAsOnboarded(user.id);
      return { success: true };
    },
  });
}
