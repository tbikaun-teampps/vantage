import { FastifyInstance } from "fastify";
import { InterviewsService } from "../services/InterviewsService";
import { AuthService } from "../services/AuthService";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  SignInBodySchema,
  SignInResponseSchema,
  SignOutResponseSchema,
  RefreshBodySchema,
  RefreshResponseSchema,
  SessionResponseSchema,
  InterviewTokenBodySchema,
  InterviewTokenResponseSchema,
} from "../schemas/auth";
import {
  Error400Schema,
  Error401Schema,
  Error500Schema,
} from "../schemas/errors";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Auth"];
    }
  });

  // Method for signing in a user
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/signin",
    schema: {
      description: "Sign in with email and password",
      body: SignInBodySchema,
      response: {
        200: SignInResponseSchema,
        401: Error401Schema,
      },
    },
    handler: async (request, reply) => {
      const { email, password } = request.body;

      const authService = new AuthService(
        fastify.supabase,
        fastify.supabaseAdmin
      );
      const result = await authService.signIn(email, password);

      if (!result.success) {
        return reply.status(401).send({
          success: false,
          error: result.error || "Unauthorized",
          message: result.message,
        });
      }

      return result;
    },
  });

  // Method for signing out a user
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/signout",
    schema: {
      description: "Sign out the current user and invalidate their session",
      response: {
        200: SignOutResponseSchema,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      // Extract token from Authorization header
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(401).send({
          success: false,
          error: "Unauthorized",
          message: "Missing or invalid authorization header",
        });
      }

      const token = authHeader.substring(7);

      const authService = new AuthService(
        fastify.supabase,
        fastify.supabaseAdmin
      );
      const result = await authService.signOut(token);

      if (!result.success) {
        return reply.status(500).send({
          success: false,
          error: result.error || "Internal Server Error",
          message: result.message,
        });
      }

      return reply.status(200).send(result);
    },
  });

  // Method for refreshing a user's access token
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/refresh",
    schema: {
      description: "Refresh access token using refresh token",
      body: RefreshBodySchema,
      response: {
        200: RefreshResponseSchema,
        400: Error400Schema,
        401: Error401Schema,
      },
    },
    handler: async (request, reply) => {
      const { refresh_token } = request.body;

      if (!refresh_token) {
        return reply.status(400).send({
          success: false,
          error: "Bad Request",
          message: "Refresh token is required",
        });
      }

      const authService = new AuthService(
        fastify.supabase,
        fastify.supabaseAdmin
      );
      const result = await authService.refreshToken(refresh_token);

      if (!result.success) {
        return reply.status(401).send({
          success: false,
          error: result.error || "Unauthorized",
          message: result.message,
        });
      }

      return reply.status(200).send(result);
    },
  });

  // Method for validating a user's session and getting enriched user data
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/session",
    schema: {
      description:
        "Validate current session and return enriched user data with re-authorization check",
      response: {
        200: SessionResponseSchema,
        401: Error401Schema,
      },
    },
    handler: async (request, reply) => {
      // Extract token from Authorization header
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(401).send({
          success: false,
          error: "Unauthorized",
          message: "Missing or invalid authorization header",
        });
      }

      const token = authHeader.substring(7);

      const authService = new AuthService(
        fastify.supabase,
        fastify.supabaseAdmin
      );
      const result = await authService.validateSession(token);

      if (!result.success) {
        return reply.status(401).send({
          success: false,
          error: result.error || "Unauthorized",
          message: result.message,
        });
      }

      return reply.status(200).send(result);
    },
  });

  // // Method for resetting a user's password
  // fastify.post("/reset-password", async (_request, _reply) => {});

  // Method for generating a short-lived JWT for external interview access
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/external/interview-token",
    schema: {
      description: "Generate a short-lived JWT for external interview access",
      body: InterviewTokenBodySchema,
      response: {
        200: InterviewTokenResponseSchema,
      },
    },
    handler: async (request) => {
      const { interviewId, email, accessCode } = request.body;

      const interviewsService = new InterviewsService(
        request.supabaseClient,
        null
      );

      const token = await interviewsService.createPublicInterviewJWT(
        interviewId,
        email,
        accessCode,
        fastify.supabaseAdmin,
        fastify.config.SUPABASE_JWT_SIGNING_KEY
      );

      return {
        success: true as const,
        data: { token },
      };
    },
  });
}
