import { FastifyInstance } from "fastify";
import { InterviewsService } from "../../services/InterviewsService.js";
import { EvidenceService } from "../../services/EvidenceService.js";
import { EmailService } from "../../services/EmailService.js";
import { NotFoundError } from "../../plugins/errorHandler.js";
import { InterviewSummarySchema } from "../../schemas/interviews.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  Error400Schema,
  Error401Schema,
  Error404Schema,
  Error500Schema,
} from "../../schemas/errors.js";
import { InterviewStatusEnum } from "../../schemas/interviews.js";
import { QuestionPartAnswerTypeEnum } from "../../schemas/questionnaires/questions.js";

export async function interviewsRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Interviews"];
    }
  });
  // Attach service to all routes in this router
  fastify.addHook("preHandler", async (request) => {
    request.interviewsService = new InterviewsService(
      request.supabaseClient,
      request.user.id
    );
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "",
    schema: {
      description: "Fetch interviews with optional filters",
      querystring: z.object({
        company_id: z.string(),
        assessment_id: z.coerce.number().optional(),
        program_phase_id: z.coerce.number().optional(),
        questionnaire_id: z.coerce.number().optional(),
        status: z.array(z.enum(InterviewStatusEnum)).optional(),
        detailed: z.boolean().default(false).optional(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              is_individual: z.boolean(),
              enabled: z.boolean(),
              access_code: z.string().nullable(),
              created_at: z.string(),
              updated_at: z.string(),
              due_at: z.string().nullable(),
              assessment: z.object({
                id: z.number(),
                name: z.string(),
                type: z.enum(["onsite", "desktop"]),
              }),
              program: z
                .object({
                  id: z.number(),
                  name: z.string(),
                  program_phase_id: z.number(),
                  program_phase_name: z.string().nullable(),
                })
                .nullable(),
              completion_rate: z.number(),
              average_score: z.number(),
              min_rating_value: z.number(),
              max_rating_value: z.number(),
              status: z.enum(InterviewStatusEnum),
              interview_roles: z.array(
                z.object({
                  role: z.object({
                    shared_role: z
                      .object({ id: z.number(), name: z.string() })
                      .nullable(),
                  }),
                })
              ),
              interviewee: z
                .object({
                  full_name: z.string().nullable(),
                  email: z.string(),
                  role: z.string(),
                })
                .nullable(),
              interviewer: z
                .object({
                  full_name: z.string().nullable(),
                  email: z.string(),
                })
                .nullable(),
              responses: z.array(z.any()).optional(), // TODO: Only present if detailed=true, define structure
            })
          ),
        }),
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const {
        company_id,
        assessment_id,
        status,
        program_phase_id,
        questionnaire_id,
        detailed,
      } = request.query;
      const data = await request.interviewsService!.getInterviews(
        company_id,
        assessment_id,
        status,
        program_phase_id,
        questionnaire_id,
        detailed
      );

      return {
        success: true,
        data: data,
      };
    },
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "",
    schema: {
      description: "Create a new interview",
      body: z.object({
        assessment_id: z.number(),
        name: z.string(),
        interviewer_id: z.string().nullable(),
        interviewee_id: z.string().optional(),
        notes: z.string().optional(),
        is_individual: z.boolean().default(false),
        enabled: z.boolean().default(true),
        access_code: z.string().optional(),
        interview_contact_id: z.number().optional(),
        role_ids: z.array(z.number()).optional(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            id: z.number(),
            assessment_id: z.number().nullable(),
            questionnaire_id: z.number().nullable(),
            name: z.string(),
            notes: z.string().nullable(),
            status: z.enum(InterviewStatusEnum),
            is_individual: z.boolean(),
            enabled: z.boolean(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
        }),
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const body = request.body;

      try {
        const interview =
          await request.interviewsService!.createInterview(body);

        return {
          success: true,
          data: interview,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create interview";

        // Check if it's a not found error
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("Assessment not found")
        ) {
          throw new NotFoundError("Assessment not found");
        }

        throw error; // rethrow other errors
      }
    },
  });

  // Method for creating one or more individual interviews that are scoped to individual
  // contacts via email and access code.
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/individual",
    schema: {
      description: "Create individual interviews for multiple contacts",
      body: z.object({
        assessment_id: z.number(),
        interview_contact_ids: z.array(z.number()),
        name: z.string(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(
            z.object({
              contact: z.object({
                id: z.number(),
                full_name: z.string(),
                email: z.string(),
              }),
              access_code: z.string().nullable(),
              assessment_id: z.number().nullable(),
              assigned_role_id: z.number().nullable(),
              company_id: z.string(),
              completed_at: z.string().nullable(),
              created_at: z.string(),
              created_by: z.string(),
              deleted_at: z.string().nullable(),
              due_at: z.string().nullable(),
              enabled: z.boolean(),
              id: z.number(),
              interview_contact_id: z.number().nullable(),
              interviewee_id: z.string().nullable(),
              interviewer_id: z.string().nullable(),
              is_deleted: z.boolean(),
              is_individual: z.boolean(),
              name: z.string(),
              notes: z.string().nullable(),
              program_id: z.number().nullable(),
              program_phase_id: z.number().nullable(),
              questionnaire_id: z.number().nullable(),
              status: z.enum(InterviewStatusEnum),
              updated_at: z.string(),
            })
          ),
        }),
        400: Error400Schema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { assessment_id, interview_contact_ids, name } = request.body;

        const interviewsService = new InterviewsService(
          request.supabaseClient,
          request.user.id,
          fastify.supabaseAdmin
        );

        const interviews = await interviewsService.createIndividualInterviews({
          assessment_id,
          interview_contact_ids,
          name,
        });

        // Initialize email service
        const emailService = new EmailService(
          fastify.config.RESEND_API_KEY,
          fastify.config.SITE_URL,
          fastify.config.VANTAGE_PUBLIC_ASSETS_BUCKET_URL,
          fastify.supabase
        );

        // Send invitation emails to each contact
        const emailResults = await Promise.allSettled(
          interviews.map(async (interview) => {
            return emailService.sendInterviewInvitation(
              request.user.id,
              interview.id
            );
          })
        );

        // Log any email failures (but don't fail the request)
        const failedEmails = emailResults.filter(
          (result) => result.status === "rejected"
        );
        if (failedEmails.length > 0) {
          fastify.log.warn(
            `Failed to send ${failedEmails.length} invitation emails: ${failedEmails.map((email) => email.reason).join(", ")}`
          );
        }

        console.log(
          "emails sent: ",
          emailResults.filter((r) => r.status === "fulfilled").length
        );
        console.log("emails failed: ", failedEmails.length);

        return {
          success: true,
          data: interviews,
        };
      } catch (error) {
        console.error("Error creating individual interviews:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create individual interviews";

        // Check if it's a validation error (no roles found)
        if (errorMessage.includes("No roles found")) {
          return reply.status(400).send({
            success: false,
            error: errorMessage,
          });
        }

        return reply.status(500).send({
          success: false,
          error: errorMessage,
        });
      }
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:interviewId/structure",
    schema: {
      description:
        "Fetch interview structure by interview ID (questionnaire hierarchy)",
      params: z.object({
        interviewId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z
            .object({
              interview: z.object({
                id: z.number(),
                name: z.string(),
                questionnaire_id: z.number(),
                assessment_id: z.number().nullable(),
                is_individual: z.boolean(),
              }),
              sections: z.array(
                // TODO: rename to "questionnaires" or rename 'questionnaire' to 'sections'. See other responses with same structure.
                z.object({
                  id: z.number(),
                  title: z.string(),
                  order_index: z.number(),
                  steps: z.array(
                    z.object({
                      id: z.number(),
                      title: z.string(),
                      order_index: z.number(),
                      questions: z.array(
                        z.object({
                          id: z.number(),
                          title: z.string(),
                          order_index: z.number(),
                        })
                      ),
                    })
                  ),
                })
              ),
            })
            .nullable(),
        }),
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { interviewId } = request.params;
      const structure =
        await request.interviewsService!.getInterviewStructure(interviewId);

      return { success: true, data: structure };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:interviewId/summary",
    schema: {
      description:
        "Fetch interview summary by interview ID (for layout/settings)",
      params: z.object({
        interviewId: z.coerce.number(),
      }),
      response: {
        200: InterviewSummarySchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { interviewId } = request.params;
      const summary =
        await request.interviewsService!.getInterviewSummary(interviewId);
      return { success: true, data: summary };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:interviewId",
    schema: {
      description: "Fetch interview details by interview ID",
      params: z.object({
        interviewId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z
            .object({
              interview: z.object({
                id: z.number(),
                questionnaire_id: z.number().nullable(),
                name: z.string(),
                notes: z.string().nullable(),
                status: z.enum(InterviewStatusEnum),
                is_individual: z.boolean(),
                enabled: z.boolean(),
                assessment_id: z.number().nullable(),
              }),
              questionnaire: z.array(
                z.object({
                  id: z.number(),
                  title: z.string(),
                  order_index: z.number(),
                  steps: z.array(
                    z.object({
                      id: z.number(),
                      title: z.string(),
                      order_index: z.number(),
                      questions: z.array(
                        z.object({
                          id: z.number(),
                          title: z.string(),
                          order_index: z.number(),
                        })
                      ),
                    })
                  ),
                })
              ),
              firstQuestionId: z.number().nullable(), // TODO: Should be snake_case
            })
            .nullable(),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { interviewId } = request.params;
      const interview =
        await request.interviewsService!.getInterviewById(interviewId);

      return { success: true, data: interview };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:interviewId/progress",
    schema: {
      description: "Fetch interview progress details by interview ID",
      params: z.object({ interviewId: z.coerce.number() }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            status: z.enum(InterviewStatusEnum),
            previous_status: z.enum(InterviewStatusEnum).nullable(),
            total_questions: z.number(),
            answered_questions: z.number(),
            progress_percentage: z.number(),
            responses: z.record(
              z.string(),
              z.object({
                id: z.number(),
                rating_score: z.number().nullable(),
                is_applicable: z.boolean(),
                has_rating_score: z.boolean(),
                is_unknown: z.boolean(),
                has_roles: z.boolean(),
              })
            ),
          }),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { interviewId } = request.params;
      const interviewsService = new InterviewsService(
        request.supabaseClient,
        request.user.id,
        fastify.supabaseAdmin // Required for status updates
      );
      const data = await interviewsService.getInterviewProgress(interviewId);
      return { success: true, data };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:interviewId/questions/:questionId",
    schema: {
      description:
        "Fetch a specific question within an interview by interview ID and question ID",
      params: z.object({
        interviewId: z.coerce.number(),
        questionId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z
            .object({
              id: z.number(),
              title: z.string(),
              context: z.string(),
              breadcrumbs: z.object({
                section: z.string(),
                step: z.string(),
                question: z.string(),
              }),
              question_text: z.string(),
              question_parts: z
                .array(
                  z.object({
                    id: z.number(),
                    text: z.string(),
                    order_index: z.number(),
                    answer_type: z.enum(QuestionPartAnswerTypeEnum),
                    options: z
                      .union([
                        z.object({
                          labels: z.array(z.string()),
                        }),
                        z.object({
                          max: z.number(),
                          min: z.number(),
                          step: z.number(),
                        }),
                        z.object({
                          max: z.number(),
                          min: z.number(),
                          decimal_places: z.number().optional(),
                        }),
                        z.object({}), // Empty object for answer types that don't require options (e.g., boolean)
                      ])
                      .nullable(),
                  })
                )
                .optional(),
              response: z
                .object({
                  id: z.number(),
                  rating_score: z.number().nullable(),
                  is_unknown: z.boolean(),
                  question_part_responses: z
                    .array(
                      z.object({
                        id: z.number(),
                        answer_value: z.string(),
                        question_part_id: z.number(),
                      })
                    )
                    .optional(),
                  response_roles: z.array(
                    z.object({
                      id: z.number(),
                      role: z.object({
                        id: z.number(),
                      }),
                    })
                  ),
                })
                .nullable(),
              options: z
                .object({
                  applicable_roles: z.record(
                    z.string(),
                    z.array(
                      z.object({
                        id: z.number(),
                        shared_role_id: z.number(),
                        name: z.string(),
                        description: z.string().nullable(),
                        path: z.string(),
                      })
                    )
                  ),
                  rating_scales: z.array(
                    z.object({
                      id: z.number(),
                      name: z.string(),
                      value: z.number(),
                      description: z.string(),
                    })
                  ),
                })
                .optional(),
            })
            .nullable(),
        }),
      },
    },
    handler: async (request) => {
      const { interviewId, questionId } = request.params;
      const data = await request.interviewsService!.getInterviewQuestionById(
        interviewId,
        questionId
      );

      return { success: true, data };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:interviewId",
    schema: {
      description: "Update interview details such as name, status, and notes",
      params: z.object({
        interviewId: z.coerce.number(),
      }),
      body: z.object({
        name: z.string().optional(),
        status: z.enum(InterviewStatusEnum).optional(),
        notes: z.string().optional(),
        enabled: z.boolean().optional(),
        due_at: z.string().nullable().optional(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            id: z.number(),
            name: z.string(),
            status: z.string(),
            enabled: z.boolean(),
            notes: z.string().nullable(),
            updated_at: z.string(),
            due_at: z.string().nullable(),
          }),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { interviewId } = request.params;
      const data = await request.interviewsService!.updateInterviewDetails(
        interviewId,
        request.body
      );

      return {
        success: true,
        data,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:interviewId/complete",
    schema: {
      description: "Mark an interview as complete with optional feedback",
      params: z.object({
        interviewId: z.coerce.number(),
      }),
      body: z.object({
        feedback: z
          .object({
            interviewRating: z.number(),
            interviewComment: z.string(),
            experienceRating: z.number(),
            experienceComment: z.string(),
          })
          .optional(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { interviewId } = request.params;
      const { feedback } = request.body;

      const interviewsService = new InterviewsService(
        request.supabaseClient,
        request.user.id,
        fastify.supabaseAdmin // Required for status updates
      );

      const emailService = new EmailService(
        fastify.config.RESEND_API_KEY,
        fastify.config.SITE_URL,
        fastify.config.VANTAGE_PUBLIC_ASSETS_BUCKET_URL,
        fastify.supabaseAdmin // Required for sending emails for individual (public) interviews
      );

      await interviewsService.completeInterview(
        interviewId,
        emailService,
        feedback
      );

      return { success: true, message: "Interview completed successfully" };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:interviewId",
    schema: {
      description: "Delete an interview by ID",
      params: z.object({
        interviewId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { interviewId } = request.params;
      await request.interviewsService!.deleteInterview(interviewId);
      return { success: true };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/responses/:responseId/actions",
    schema: {
      description: "Fetch actions for a specific interview response",
      params: z.object({
        responseId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(
            z.object({
              id: z.number(),
              title: z.string().nullable(),
              description: z.string(),
              created_at: z.string(),
              updated_at: z.string(),
            })
          ),
        }),
      },
    },
    handler: async (request) => {
      const { responseId } = request.params;
      const data =
        await request.interviewsService!.listInterviewResponseActions(
          responseId
        );
      return { success: true, data };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/responses/:responseId/actions",
    schema: {
      description: "Add an action associated with an interview response",
      params: z.object({
        responseId: z.coerce.number(),
      }),
      body: z.object({
        title: z.string().optional(),
        description: z.string(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            id: z.number(),
            title: z.string().nullable(),
            description: z.string(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
        }),
      },
    },
    handler: async (request) => {
      const { responseId } = request.params;

      const data =
        await request.interviewsService!.addActionToInterviewResponse(
          responseId,
          request.body
        );

      return { success: true, data };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/responses/:responseId/actions/:actionId",
    schema: {
      description: "Update an action associated with an interview response",
      params: z.object({
        responseId: z.coerce.number(),
        actionId: z.coerce.number(),
      }),
      body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            id: z.number(),
            title: z.string().nullable(),
            description: z.string(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
        }),
      },
    },
    handler: async (request) => {
      const { actionId } = request.params;
      const data =
        await request.interviewsService!.updateInterviewResponseAction(
          actionId,
          request.body
        );

      return { success: true, data };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/responses/:responseId/actions/:actionId",
    schema: {
      description:
        "Soft delete an action associated with an interview response",
      params: z.object({
        responseId: z.coerce.number(),
        actionId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
        }),
      },
    },
    handler: async (request) => {
      const { actionId } = request.params;
      await request.interviewsService!.deleteInterviewResponseAction(actionId);
      return { success: true };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/responses/:responseId",
    schema: {
      description:
        "Update an interview response's rating score, roles, is_unknown flag, and question part answers",
      params: z.object({
        responseId: z.coerce.number(),
      }),
      body: z.object({
        rating_score: z.number().nullable().optional(),
        role_ids: z.array(z.number()).nullable().optional(),
        is_unknown: z.boolean().nullable().optional(),
        question_part_answers: z
          .array(
            z.object({
              question_part_id: z.number(),
              answer_value: z.string(),
            })
          )
          .nullable()
          .optional(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z
            .union([
              z.object({
                id: z.number(),
                questionnaire_question_id: z.number(),
                interview_id: z.number(),
                rating_score: z.number().nullable(),
                is_unknown: z.boolean(),
                response_roles: z.array(
                  z.object({
                    id: z.number(),
                    role: z.object({
                      id: z.number(),
                    }),
                  })
                ),
              }),
              z.object({
                id: z.number(),
                questionnaire_question_id: z.number(),
                interview_id: z.number(),
                question_part_responses: z.array(
                  z.object({
                    id: z.number(),
                    question_part_id: z.number(),
                    answer_value: z.string(),
                  })
                ),
              }),
            ])
            .nullable(),
        }),
      },
    },
    handler: async (request) => {
      const { rating_score, role_ids, is_unknown, question_part_answers } =
        request.body;

      const updatedResponse =
        await request.interviewsService!.updateInterviewResponse(
          request.params.responseId,
          rating_score,
          role_ids,
          is_unknown,
          question_part_answers
        );

      return {
        success: true,
        data: updatedResponse,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/responses/:responseId/comments",
    schema: {
      description: "Fetch comments for a specific interview response",
      params: z.object({
        responseId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.string(),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { responseId } = request.params;
      const data =
        await request.interviewsService!.getInterviewResponseComments(
          responseId
        );
      return { success: true, data };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/responses/:responseId/comments",
    schema: {
      description: "Update comments for a specific interview response",
      params: z.object({
        responseId: z.coerce.number(),
      }),
      body: z.object({
        comments: z.string(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.string(),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { responseId } = request.params;
      const { comments } = request.body;

      const data =
        await request.interviewsService!.updateInterviewResponseComments(
          responseId,
          comments
        );

      return { success: true, data };
    },
  });

  // ====== Interview Response Evidence ======

  // Method for fetching evidence files for a response
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/responses/:responseId/evidence",
    schema: {
      description: "Fetch evidence files associated with an interview response",
      params: z.object({
        responseId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(
            z.object({
              id: z.number(),
              interview_id: z.number(),
              interview_response_id: z.number(),
              file_name: z.string(),
              file_size: z.number(),
              file_type: z.string(),
              created_at: z.string(),
              uploaded_by: z.string(),
              uploaded_at: z.string(),
            })
          ),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { responseId } = request.params;
      const evidenceService = new EvidenceService(
        request.supabaseClient,
        request.user.id
      );
      const data = await evidenceService.getEvidenceForResponse(responseId);
      return { success: true, data };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/responses/:responseId/evidence",
    schema: {
      description:
        "Upload an evidence file associated with an interview response",
      params: z.object({
        responseId: z.coerce.number(),
      }),
      consumes: ["multipart/form-data"],
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            evidence: z.object({
              id: z.number(),
              created_at: z.string(),
              uploaded_at: z.string(),
              file_name: z.string(),
              file_size: z.number(),
              file_type: z.string(),
            }),
            publicUrl: z.string(),
          }),
        }),
        400: z.object({
          success: z.boolean(),
          error: z.string(),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { responseId } = request.params;

        // Get the uploaded file
        const file = await request.file();

        if (!file) {
          return reply.status(400).send({
            success: false,
            error: "No file provided",
          });
        }
        const evidenceService = new EvidenceService(
          request.supabaseClient,
          request.user.id
        );

        const data = await evidenceService.uploadEvidence(responseId, file);

        return {
          success: true,
          data,
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to upload file",
        });
      }
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/responses/:responseId/evidence/:evidenceId",
    schema: {
      description:
        "Delete an evidence file associated with an interview response",
      params: z.object({
        responseId: z.coerce.number(),
        evidenceId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { evidenceId } = request.params;
      const evidenceService = new EvidenceService(
        request.supabaseClient,
        request.user.id
      );

      await evidenceService.deleteEvidence(evidenceId);

      return { success: true };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/assessment-roles/:assessmentId",
    schema: {
      description:
        "Fetch roles associated with an assessment that can be used for scoping interviews",
      params: z.object({
        assessmentId: z.coerce.number(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(
            z.object({
              id: z.number(),
              name: z.string().optional(), // TODO: this shouldn't be optional, fix in service
              description: z.string().nullable().optional(),
              shared_role_id: z.number().optional(), // TODO: this shouldn't be optional, fix in service
              work_group_name: z.string(),
              asset_group_name: z.string(),
              site_name: z.string(),
              region_name: z.string(),
              business_unit_name: z.string(),
            })
          ),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { assessmentId } = request.params;
      const roles =
        await request.interviewsService!.getRolesAssociatedWithAssessment(
          assessmentId
        );

      return { success: true, data: roles };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/assessment-roles/validate",
    schema: {
      description:
        "Validate that an assessment's interview questionnaire has applicable questions for given role IDs",
      body: z.object({
        assessmentId: z.number(),
        roleIds: z.array(z.number()).min(1),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            isValid: z.boolean(),
            hasUniversalQuestions: z.boolean(),
          }),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { assessmentId, roleIds } = request.body;
      const isValid =
        await request.interviewsService!.validateAssessmentRolesForQuestionnaire(
          assessmentId,
          roleIds
        );
      return { success: true, data: isValid };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/questionnaires/:questionnaireId/validate-roles",
    schema: {
      description:
        "Validate that a program questionnaire has applicable questions for given role IDs",
      params: z.object({
        questionnaireId: z.coerce.number(),
      }),
      body: z.object({
        roleIds: z.array(z.number()).min(1),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            isValid: z.boolean(),
            hasUniversalQuestions: z.boolean(),
          }),
        }),
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionnaireId } = request.params;
      const { roleIds } = request.body;

      const isValid =
        await request.interviewsService!.validateProgramQuestionnaireHasApplicableRoles(
          questionnaireId,
          roleIds
        );

      return { success: true, data: isValid };
    },
  });
}
