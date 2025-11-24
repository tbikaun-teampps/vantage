import { FastifyInstance } from "fastify";
import { EmailService } from "../services/EmailService";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  InterviewIdQuerystringSchema,
  InviteTeamMemberBodySchema,
  TestEmailBodySchema,
  EmailSuccessResponseSchema,
  EmailErrorResponseSchema,
} from "../schemas/emails";
import { Error500Schema } from "../schemas/errors";

export async function emailsRoutes(fastify: FastifyInstance) {
  // Initialise EmailService
  const emailService = new EmailService(
    fastify.config.RESEND_API_KEY,
    fastify.config.SITE_URL,
    fastify.config.VANTAGE_PUBLIC_ASSETS_BUCKET_URL,
    fastify.supabase
  );

  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Emails"];
    }
  });

  // Send interview invitation email
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/send-interview-invitation",
    schema: {
      description: "Send an interview invitation email",
      querystring: InterviewIdQuerystringSchema,
      response: {
        200: EmailSuccessResponseSchema,
        400: EmailErrorResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const { interviewId } = request.query;

      const result = await emailService.sendInterviewInvitation(
        request.user.id,
        interviewId
      );

      return reply.status(result.success ? 200 : 400).send(result);
    },
  });

  // Send interview reminder email
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/send-interview-reminder",
    schema: {
      description: "Send an interview reminder email",
      querystring: InterviewIdQuerystringSchema,
      response: {
        200: EmailSuccessResponseSchema,
        400: EmailErrorResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const { interviewId } = request.query;

      const result = await emailService.sendInterviewReminder(
        interviewId,
        request.user.id
      );

      return reply.status(result.success ? 200 : 400).send(result);
    },
  });

  // Send team member invite email
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/send-team-member-invite",
    schema: {
      description: "Send a team member invitation email",
      body: InviteTeamMemberBodySchema,
      response: {
        200: EmailSuccessResponseSchema,
        400: EmailErrorResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const data = request.body;
      const result = await emailService.sendTeamMemberInvite(data);
      return reply.status(result.success ? 200 : 400).send(result);
    },
  });

  // Method for sending an interviewee a digest/summary of their interview responses
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/send-interview-summary",
    schema: {
      description:
        "Send an interviewee a digest/summary of their interview responses",
      querystring: InterviewIdQuerystringSchema,
      response: {
        200: EmailSuccessResponseSchema,
        400: EmailErrorResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const { interviewId } = request.query;

      const result = await emailService.sendInterviewSummary(interviewId);

      return reply.status(result.success ? 200 : 400).send(result);
    },
  });

  // Send test email
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/send-test-email",
    schema: {
      description: "Send a test email to verify email service configuration",
      body: TestEmailBodySchema,
      response: {
        200: EmailSuccessResponseSchema,
        400: EmailErrorResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const data = request.body;
      const result = await emailService.sendTestEmail(data);
      return reply.status(result.success ? 200 : 400).send(result);
    },
  });
}
