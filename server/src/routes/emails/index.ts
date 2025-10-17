import { FastifyInstance } from "fastify";
import { EmailService } from "../../services/EmailService";
import type {
  InviteTeamMemberData,
  TestEmailData,
} from "../../services/EmailService";

export async function emailsRoutes(fastify: FastifyInstance) {
  // Initialise EmailService
  const emailService = new EmailService(
    fastify.config.RESEND_API_KEY,
    fastify.config.SITE_URL,
    fastify.config.VANTAGE_LOGO_FULL_URL,
    fastify.config.VANTAGE_LOGO_ICON_URL,
    fastify.supabase
  );

  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Emails"];
    }
  });

  // Send interview invitation email
  fastify.post(
    "/send-interview-invitation",
    {
      schema: {
        description: "Send an interview invitation email",
        querystring: {
          type: "object",
          required: ["interviewId"],
          properties: {
            interviewId: { type: "number" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              messageId: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { interviewId } = request.query as { interviewId: number };

      const result = await emailService.sendInterviewInvitation(
        request.user.id,
        interviewId
      );

      return reply.status(result.success ? 200 : 400).send(result);
    }
  );

  // Send interview reminder email
  fastify.post(
    "/send-interview-reminder",
    {
      schema: {
        description: "Send an interview reminder email",
        querystring: {
          type: "object",
          required: ["interviewId"],
          properties: {
            interviewId: { type: "number" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              messageId: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { interviewId } = request.query as { interviewId: number };

      const result = await emailService.sendInterviewReminder(
        interviewId,
        request.user.id
      );

      return reply.status(result.success ? 200 : 400).send(result);
    }
  );

  // Send team member invite email
  fastify.post(
    "/send-team-member-invite",
    {
      schema: {
        description: "Send a team member invitation email",
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string" },
            company_name: { type: "string" },
            invite_link: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              messageId: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const data = request.body as InviteTeamMemberData;
      const result = await emailService.sendTeamMemberInvite(data);
      return reply.status(result.success ? 200 : 400).send(result);
    }
  );

  // Send test email
  fastify.post(
    "/send-test-email",
    {
      schema: {
        description: "Send a test email to verify email service configuration",
        body: {
          type: "object",
          required: ["to"],
          properties: {
            to: { type: "string", format: "email" },
            message: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              messageId: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const data = request.body as TestEmailData;
      const result = await emailService.sendTestEmail(data);
      return reply.status(result.success ? 200 : 400).send(result);
    }
  );
}
