import { FastifyInstance } from "fastify";
import { InterviewsService } from "../services/InterviewsService";
import { AuthService } from "../services/AuthService";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Auth"];
    }
  });

  // Method for signing in a user
  fastify.post(
    "/signin",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
          required: ["email", "password"],
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      const authService = new AuthService(
        fastify.supabase,
        fastify.supabaseAdmin
      );
      const result = await authService.signIn(email, password);

      if (!result.success) {
        return reply.status(401).send({
          success: false,
          error: result.error,
          message: result.message,
        });
      }

      return result;
    }
  );

  // Method for signing out a user
  fastify.post(
    "/signout",
    {
      schema: {
        description: "Sign out the current user and invalidate their session",
        tags: ["Auth"],
      },
    },
    async (request, reply) => {
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
          error: result.error,
          message: result.message,
        });
      }

      return reply.status(200).send(result);
    }
  );

  // Method for refreshing a user's access token
  fastify.post(
    "/refresh",
    {
      schema: {
        description: "Refresh access token using refresh token",
        tags: ["Auth"],
        body: {
          type: "object",
          properties: {
            refresh_token: { type: "string" },
          },
          required: ["refresh_token"],
        },
      },
    },
    async (request, reply) => {
      const { refresh_token } = request.body as { refresh_token: string };

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
          error: result.error,
          message: result.message,
        });
      }

      return reply.status(200).send(result);
    }
  );

  // Method for validating a user's session and getting enriched user data
  fastify.get(
    "/session",
    {
      schema: {
        description:
          "Validate current session and return enriched user data with re-authorization check",
        tags: ["Auth"],
      },
    },
    async (request, reply) => {
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
          error: result.error,
          message: result.message,
        });
      }

      return reply.status(200).send(result);
    }
  );

  // // Method for resetting a user's password
  // fastify.post("/reset-password", async (_request, _reply) => {});

  // Method for generating a short-lived JWT for external interview access
  fastify.post(
    "/external/interview-token",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            interviewId: { type: "number" },
            email: { type: "string" },
            accessCode: { type: "string" },
          },
          required: ["interviewId", "email", "accessCode"],
        },
      },
    },
    async (request) => {
      const { interviewId, email, accessCode } = request.body as {
        interviewId: number;
        email: string;
        accessCode: string;
      };

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
        success: true,
        data: { token },
      };
    }
  );
}
