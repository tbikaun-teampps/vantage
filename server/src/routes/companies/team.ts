import { FastifyInstance } from "fastify";
import { companySchemas } from "../../schemas/company.js";
import { commonResponseSchemas } from "../../schemas/common.js";
import { CompaniesService } from "../../services/CompaniesService.js";
import {
  companyRoleMiddleware,
  requireCompanyRole,
} from "../../middleware/companyRole.js";
import { EmailService } from "../../services/EmailService.js";
import { NotFoundError, ForbiddenError } from "../../plugins/errorHandler.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export async function teamRoutes(fastify: FastifyInstance) {
  const emailService = new EmailService(
    fastify.config.RESEND_API_KEY,
    fastify.config.SITE_URL,
    fastify.config.VANTAGE_PUBLIC_ASSETS_BUCKET_URL
  );

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/team",
    preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
    schema: {
      description: "Get all team members for a company",
      params: companySchemas.params.companyId,
      response: {
        200: companySchemas.responses.teamMemberList,
        401: commonResponseSchemas.responses[401],
        404: commonResponseSchemas.responses[404],
        500: commonResponseSchemas.responses[500],
      },
    },
    handler: async (request) => {
      const companiesService = new CompaniesService(
        request.supabaseClient,
        request.user.id,
        request.subscriptionTier,
        fastify.supabaseAdmin
      );

      const teamMembers = await companiesService.getTeamMembers(
        request.params.companyId
      );

      return {
        success: true,
        data: teamMembers,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:companyId/team",
    preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
    schema: {
      description: "Add a team member to a company",
      params: companySchemas.params.companyId,
      body: companySchemas.body.addTeamMember,
      response: {
        200: companySchemas.responses.teamMemberDetail,
        401: commonResponseSchemas.responses[401],
        403: commonResponseSchemas.responses[403],
        404: commonResponseSchemas.responses[404],
        500: commonResponseSchemas.responses[500],
      },
    },

    handler: async (request) => {
      const { companyId } = request.params;
      const companiesService = new CompaniesService(
        request.supabaseClient,
        request.user.id,
        request.subscriptionTier,
        fastify.supabaseAdmin
      );

      try {
        const teamMember = await companiesService.addTeamMember(
          companyId,
          request.body
        );

        // Get company details to include in the email
        const { data: company } = await request.supabaseClient
          .from("companies")
          .select("name")
          .eq("id", companyId)
          .single();

        // Send invitation email (non-blocking - don't fail if email fails)
        const inviteLink = `${fastify.config.SITE_URL}/select-company`; //TODO: Update link with company id in url in the future.
        emailService
          .sendTeamMemberInvite({
            email: teamMember.user.email,
            name: teamMember.user.full_name || undefined,
            role: teamMember.role,
            company_name: company?.name || undefined,
            invite_link: inviteLink,
          })
          .then((emailResult) => {
            if (emailResult.success) {
              console.log(
                `Team member invitation email sent to ${teamMember.user.email}`
              );
            } else {
              console.error(
                `Failed to send team member invitation email: ${emailResult.message}`
              );
            }
          })
          .catch((err) => {
            console.error("Email sending error:", err);
          });

        return {
          success: true,
          data: teamMember,
        };
      } catch (error) {
        // Convert service errors to appropriate HTTP errors
        if (error instanceof Error) {
          if (
            error.message.includes("Only owners and admins") ||
            error.message.includes("access denied")
          ) {
            throw new ForbiddenError(error.message);
          }

          if (
            error.message.includes("not found") ||
            error.message.includes("already a member")
          ) {
            throw new NotFoundError(error.message);
          }
        }

        // Re-throw to let the error handler catch it
        throw error;
      }
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:companyId/team/:userId",
    preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
    schema: {
      description: "Update a team member's role",
      params: companySchemas.params.teamMemberParams,
      body: companySchemas.body.updateTeamMember,
      response: {
        200: companySchemas.responses.teamMemberDetail,
        401: commonResponseSchemas.responses[401],
        403: commonResponseSchemas.responses[403],
        404: commonResponseSchemas.responses[404],
        500: commonResponseSchemas.responses[500],
      },
    },

    handler: async (request) => {
      const { companyId, userId } = request.params;
      const updateData = request.body;

      // Get the current team member data before updating to capture old role
      const { data: currentMember } = await request.supabaseClient
        .from("user_companies")
        .select("role")
        .eq("company_id", companyId)
        .eq("user_id", userId)
        .single();

      const oldRole = currentMember?.role;

      const companiesService = new CompaniesService(
        request.supabaseClient,
        request.user.id,
        request.subscriptionTier,
        fastify.supabaseAdmin
      );

      try {
        const teamMember = await companiesService.updateTeamMember(
          companyId,
          userId,
          updateData
        );

        // Get company details for the email
        const { data: company } = await request.supabaseClient
          .from("companies")
          .select("name")
          .eq("id", companyId)
          .single();

        // Get the current user's profile for the changed_by_name
        const { data: changedByProfile } = await request.supabaseClient
          .from("profiles")
          .select("full_name, email")
          .eq("id", request.user.id)
          .single();

        // Send role change notification email (non-blocking - don't fail if email fails)
        if (oldRole && oldRole !== updateData.role) {
          emailService
            .sendRoleChangeNotification({
              email: teamMember.user.email,
              name: teamMember.user.full_name || undefined,
              old_role: oldRole,
              new_role: updateData.role,
              company_name: company?.name || undefined,
              changed_by_name:
                changedByProfile?.full_name ||
                changedByProfile?.email ||
                undefined,
            })
            .then((emailResult) => {
              if (emailResult.success) {
                console.log(
                  `Role change notification sent to ${teamMember.user.email}`
                );
              } else {
                console.error(
                  `Failed to send role change notification: ${emailResult.message}`
                );
              }
            })
            .catch((err) => {
              console.error("Email sending error:", err);
            });
        }

        return {
          success: true,
          data: teamMember,
        };
      } catch (error) {
        // Convert service errors to appropriate HTTP errors
        if (error instanceof Error) {
          if (
            error.message.includes("Only owners and admins") ||
            error.message.includes("Cannot change") ||
            error.message.includes("access denied")
          ) {
            throw new ForbiddenError(error.message);
          }

          if (error.message.includes("not found")) {
            throw new NotFoundError(error.message);
          }
        }

        // Re-throw to let the error handler catch it
        throw error;
      }
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:companyId/team/:userId",
    preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
    schema: {
      description: "Remove a team member from a company",
      params: companySchemas.params.teamMemberParams,
      response: {
        200: commonResponseSchemas.messageResponse,
        401: commonResponseSchemas.responses[401],
        403: commonResponseSchemas.responses[403],
        404: commonResponseSchemas.responses[404],
        500: commonResponseSchemas.responses[500],
      },
    },

    handler: async (request) => {
      const { companyId, userId } = request.params;
      const companiesService = new CompaniesService(
        request.supabaseClient,
        request.user.id,
        request.subscriptionTier,
        fastify.supabaseAdmin
      );

      try {
        await companiesService.removeTeamMember(companyId, userId);

        return {
          success: true,
          message: "Team member removed successfully",
        };
      } catch (error) {
        // Convert service errors to appropriate HTTP errors
        if (error instanceof Error) {
          if (
            error.message.includes("Only owners and admins") ||
            error.message.includes("Cannot remove") ||
            error.message.includes("access denied")
          ) {
            throw new ForbiddenError(error.message);
          }

          if (error.message.includes("not found")) {
            throw new NotFoundError(error.message);
          }
        }

        // Re-throw to let the error handler catch it
        throw error;
      }
    },
  });
}
