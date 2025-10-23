import { FastifyInstance } from "fastify";
import { InterviewsService } from "../../services/InterviewsService.js";
import { EvidenceService } from "../../services/EvidenceService.js";
import { EmailService } from "../../services/EmailService.js";
import {
  CreateInterviewResponseActionData,
  UpdateInterviewData,
  UpdateInterviewResponseActionData,
  CreateInterviewData,
  InterviewStatus,
} from "../../types/entities/interviews.js";
import { NotFoundError } from "../../plugins/errorHandler.js";

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
  fastify.get(
    "",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            company_id: { type: "string" },
            assessment_id: { type: "number" },
            status: { type: "array", items: { type: "string" } },
            program_id: { type: "string" },
          },
          required: ["company_id"],
        },
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: {
          //       type: "array",
          //       items: { type: "object" },
          //     },
          //   },
          // },
          401: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
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
    async (request) => {
      const { company_id, assessment_id, status, program_id } =
        request.query as {
          company_id: string;
          assessment_id: number;
          status: InterviewStatus[];
          program_id: number;
        };
      const data = await request.interviewsService!.getInterviews(
        company_id,
        assessment_id,
        status,
        program_id
      );

      return {
        success: true,
        data: data,
      };
    }
  );
  fastify.post(
    "",
    {
      schema: {
        body: {
          type: "object",
          required: ["assessment_id", "name"],
          properties: {
            assessment_id: { type: "number" },
            interviewer_id: { type: "string", nullable: true },
            name: { type: "string" },
            notes: { type: "string", nullable: true },
            is_individual: { type: "boolean", default: false },
            enabled: { type: "boolean", default: true },
            access_code: { type: "string", nullable: true },
            interview_contact_id: { type: "number", nullable: true },
            role_ids: {
              type: "array",
              items: { type: "number" },
            },
          },
        },
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: {
          //       type: "object",
          //       properties: {
          //         id: { type: "number" },
          //         assessment_id: { type: "number" },
          //         questionnaire_id: { type: "number" },
          //         interviewer_id: { type: "string" },
          //         name: { type: "string" },
          //         notes: { type: "string" },
          //         status: { type: "string" },
          //         is_individual: { type: "boolean" },
          //         created_at: { type: "string" },
          //         updated_at: { type: "string" },
          //       },
          //     },
          //   },
          // },
          // 404: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     error: { type: "string" },
          //   },
          // },
          // 500: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     error: { type: "string" },
          //   },
          // },
        },
      },
    },
    async (request) => {
      const body = request.body as CreateInterviewData;

      try {
        const interview =
          await request.interviewsService!.createInterview(body);

        return {
          success: true,
          data: interview,
        };
      } catch (error) {
        console.log("error: ", error);
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
    }
  );

  // Method for creating one or more individual interviews that are scoped to individual
  // contacts via email and access code.
  fastify.post(
    "/individual",
    {
      schema: {
        body: {
          type: "object",
          required: ["assessment_id", "name", "interview_contact_ids"],
          properties: {
            assessment_id: { type: "number" },
            interview_contact_ids: { type: "array", items: { type: "number" } },
            name: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    assessment_id: { type: "number" },
                    questionnaire_id: { type: "number" },
                    interviewer_id: { type: "string", nullable: true },
                    name: { type: "string" },
                    is_individual: { type: "boolean" },
                    access_code: { type: "string", nullable: true },
                    interview_contact_id: { type: "number", nullable: true },
                    created_at: { type: "string" },
                    updated_at: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
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
      try {
        const { assessment_id, interview_contact_ids, name } = request.body as {
          assessment_id: number;
          interview_contact_ids: number[];
          name: string;
        };

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
          fastify.config.VANTAGE_LOGO_FULL_URL,
          fastify.config.VANTAGE_LOGO_ICON_URL,
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

        return {
          success: true,
          data: interviews,
          emailsSent: emailResults.filter((r) => r.status === "fulfilled")
            .length,
          emailsFailed: failedEmails.length,
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
    }
  );

  // Method for fetching interview structure (questionnaire hierarchy)
  fastify.get(
    "/:interviewId/structure",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            interviewId: { type: "string" },
          },
          required: ["interviewId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  interview: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" },
                      questionnaire_id: { type: "number" },
                      assessment_id: { type: "number" },
                      is_individual: { type: "boolean" },
                    },
                  },
                  sections: { type: "array" },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request) => {
      const { interviewId } = request.params as { interviewId: number };
      const structure =
        await request.interviewsService!.getInterviewStructure(interviewId);

      if (!structure) {
        throw new NotFoundError("Interview not found");
      }

      return { success: true, data: structure };
    }
  );

  // Method for fetching interview summary (lightweight - for layout/settings)
  fastify.get(
    "/:interviewId/summary",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            interviewId: { type: "string" },
          },
          required: ["interviewId"],
        },
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: { type: "object" },
          //   },
          // },
        },
      },
    },
    async (request) => {
      const { interviewId } = request.params as { interviewId: number };
      const summary =
        await request.interviewsService!.getInterviewSummary(interviewId);

      if (!summary) {
        throw new NotFoundError("Interview not found");
      }

      return { success: true, data: summary };
    }
  );

  // Method for fetching interview details by ID
  fastify.get(
    "/:interviewId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            interviewId: { type: "string" },
          },
          required: ["interviewId"],
        },
      },
    },
    async (request) => {
      const { interviewId } = request.params as { interviewId: number };
      const interview =
        await request.interviewsService!.getInterviewById(interviewId);

      return { success: true, data: interview };
    }
  );
  // Method for fetching interview progress by ID
  fastify.get(
    "/:interviewId/progress",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            interviewId: { type: "string" },
          },
          required: ["interviewId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                required: [
                  "status",
                  "total_questions",
                  "answered_questions",
                  "progress_percentage",
                  "responses",
                ],
                properties: {
                  status: { type: "string" },
                  previous_status: { type: "string" },
                  total_questions: { type: "number" },
                  answered_questions: { type: "number" },
                  progress_percentage: { type: "number" },
                  responses: {
                    type: "object",
                    additionalProperties: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        rating_score: { type: "number", nullable: true },
                        is_applicable: { type: "boolean" },
                        has_rating_score: { type: "boolean" },
                        has_roles: { type: "boolean" },
                        is_unknown: { type: "boolean" },
                      },
                    },
                  },
                },
              },
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
    async (request) => {
      const { interviewId } = request.params as { interviewId: number };

      const interviewsService = new InterviewsService(
        request.supabaseClient,
        request.user.id,
        fastify.supabaseAdmin // Required for status updates
      );

      const data = await interviewsService.getInterviewProgress(interviewId);
      return { success: true, data };
    }
  );
  // Method for fetching a specific question within an interview
  fastify.get(
    "/:interviewId/questions/:questionId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            interviewId: { type: "string" },
            questionId: { type: "string" },
          },
          required: ["interviewId", "questionId"],
        },
      },
    },
    async (request) => {
      const { interviewId, questionId } = request.params as {
        interviewId: number;
        questionId: number;
      };
      const data = await request.interviewsService!.getInterviewQuestionById(
        interviewId,
        questionId
      );

      return { success: true, data };
    }
  );
  // Method for updating a specific question within an interview
  // fastify.put(
  //   "/:interviewId/questions/:questionId",
  //   {
  //     schema: {
  //       params: {
  //         type: "object",
  //         properties: {
  //           interviewId: { type: "string" },
  //         },
  //         required: ["interviewId"],
  //       },
  //       body: {
  //         type: "object",
  //         properties: {
  //           rating_scale_value: { type: "number" },
  //           comments: { type: "string" },
  //           applicable_roles: { type: "array", items: { type: "number" } },
  //         },
  //       },
  //     },
  //   },
  //   async (request, reply) => {
  //     const { interviewId, questionId } = request.params as {
  //       interviewId: number;
  //       questionId: number;
  //     };
  //     return { success: true, data: { interviewId, questionId } };
  //   }
  // );
  // Method for updating interview details
  fastify.put(
    "/:interviewId",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            status: { type: "string" },
            notes: { type: "string" },
          },
        },
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: { type: "object" },
          //   },
          // },
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
    async (request) => {
      const { interviewId } = request.params as { interviewId: number };
      const data = await request.interviewsService!.updateInterviewDetails(
        interviewId,
        request.body as UpdateInterviewData
      );

      return {
        success: true,
        data,
      };
    }
  );

  // Method for completing an interview
  fastify.post(
    "/:interviewId/complete",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            feedback: { type: "object", nullable: true },
          },
        },
      },
    },
    async (request) => {
      const { interviewId } = request.params as { interviewId: number };
      const { feedback } = request.body as { feedback?: object };

      const interviewsService = new InterviewsService(
        request.supabaseClient,
        request.user.id,
        fastify.supabaseAdmin // Required for status updates
      );

      const emailService = new EmailService(
        fastify.config.RESEND_API_KEY,
        fastify.config.SITE_URL,
        fastify.config.VANTAGE_LOGO_FULL_URL,
        fastify.config.VANTAGE_LOGO_ICON_URL,
        fastify.supabaseAdmin // Required for sending emails for individual (public) interviews
      );

      await interviewsService.completeInterview(
        interviewId,
        emailService,
        feedback
      );

      return { success: true, message: "Interview completed successfully" };
    }
  );

  // Method for deleting an interview (soft delete)
  fastify.delete(
    "/:interviewId",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
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
    async (request) => {
      const { interviewId } = request.params as { interviewId: number };
      await request.interviewsService!.deleteInterview(interviewId);

      return { success: true };
    }
  );

  // Method for fetching actions on a specific interview response
  fastify.get("/responses/:responseId/actions", async (request) => {
    const { responseId } = request.params as {
      responseId: number;
    };

    // TODO: migrate this to service
    const { data, error } = await request.supabaseClient
      .from("interview_response_actions")
      .select("id, title, description, created_at, updated_at")
      .eq("interview_response_id", responseId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data };
  });
  // Method for recording an action on a specific interview response
  fastify.post(
    "/responses/:responseId/actions",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
          },
          required: ["description"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  title: { type: "string" },
                  description: { type: "string" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { responseId } = request.params as {
        responseId: number;
      };

      const data =
        await request.interviewsService!.addActionToInterviewResponse(
          responseId,
          request.body as CreateInterviewResponseActionData
        );

      return { success: true, data };
    }
  );
  // Method for updating an action on a specific interview response
  fastify.put(
    "/responses/:responseId/actions/:actionId",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  title: { type: "string" },
                  description: { type: "string" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { actionId } = request.params as {
        actionId: number;
      };

      const data =
        await request.interviewsService!.updateInterviewResponseAction(
          actionId,
          request.body as UpdateInterviewResponseActionData
        );

      return { success: true, data };
    }
  );
  // Method for soft deleting an action on an interview response
  fastify.delete(
    "/responses/:responseId/actions/:actionId",
    async (request) => {
      const { actionId } = request.params as {
        actionId: number;
      };
      await request.interviewsService!.deleteInterviewResponseAction(actionId);
      return { success: true };
    }
  );

  // Method for updating interview response (rating and/or roles)
  fastify.put(
    "/responses/:responseId",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            rating_score: { type: "number", nullable: true },
            role_ids: {
              type: ["array"],
              nullable: true,
              items: { type: "number" },
            },
            is_unknown: { type: "boolean", nullable: true },
          },
        },
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: {
          //       type: "object",
          //       properties: {
          //         id: { type: "number" },
          //         rating_score: { type: "number", nullable: true },
          //         response_roles: {
          //           type: "array",
          //           items: {
          //             type: "object",
          //             properties: {
          //               id: { type: "number" },
          //               role: {
          //                 type: "object",
          //                 properties: {
          //                   id: { type: "number" },
          //                   name: { type: "string" },
          //                 },
          //               },
          //             },
          //           },
          //         },
          //       },
          //     },
          //   },
          // },
        },
      },
    },
    async (request) => {
      const { responseId } = request.params as {
        responseId: number;
      };
      const { rating_score, role_ids, is_unknown } = request.body as {
        rating_score?: number | null;
        role_ids?: number[] | null;
        is_unknown?: boolean | null;
      };

      const updatedResponse =
        await request.interviewsService!.updateInterviewResponse(
          responseId,
          rating_score,
          role_ids,
          is_unknown
        );

      return {
        success: true,
        data: updatedResponse,
      };
    }
  );

  // Method for fetching interview response comments
  fastify.get("/responses/:responseId/comments", async (request) => {
    const { responseId } = request.params as {
      responseId: number;
    };

    const data =
      await request.interviewsService!.getInterviewResponseComments(responseId);

    return { success: true, data };
  });
  // Method for updating interview response comments
  fastify.put(
    "/responses/:responseId/comments",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            comments: { type: "string" },
          },
          required: ["comments"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  comments: { type: "string" },
                  created_at: { type: "string" },
                  updated_at: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { responseId } = request.params as {
        responseId: number;
      };
      const { comments } = request.body as {
        comments: string;
      };

      const data =
        await request.interviewsService!.updateInterviewResponseComments(
          responseId,
          comments
        );

      return { success: true, data };
    }
  );

  // ====== Interview Response Evidence ======

  // Method for fetching evidence files for a response
  fastify.get("/responses/:responseId/evidence", async (request) => {
    const { responseId } = request.params as {
      responseId: number;
    };
    const evidenceService = new EvidenceService(
      request.supabaseClient,
      request.user.id
    );

    const data = await evidenceService.getEvidenceForResponse(responseId);

    return { success: true, data };
  });

  // Method for uploading evidence for a response
  fastify.post(
    "/responses/:responseId/evidence",
    {
      schema: {
        consumes: ["multipart/form-data"],
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  evidence: { type: "object" },
                  publicUrl: { type: "string" },
                },
              },
            },
          },
          400: {
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
      try {
        const { responseId } = request.params as {
          responseId: number;
        };

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
    }
  );

  // Method for deleting evidence
  fastify.delete(
    "/responses/:responseId/evidence/:evidenceId",
    async (request) => {
      const { evidenceId } = request.params as {
        evidenceId: number;
      };
      const evidenceService = new EvidenceService(
        request.supabaseClient,
        request.user.id
      );

      await evidenceService.deleteEvidence(evidenceId);

      return { success: true };
    }
  );

  // Method for fetching available roles associated with an assessment that can be used for
  // scoping an interview.
  fastify.get("/assessment-roles/:assessmentId", async (request) => {
    const { assessmentId } = request.params as {
      assessmentId: number;
    };

    const roles =
      await request.interviewsService!.getRolesAssociatedWithAssessment(
        assessmentId
      );

    return { success: true, data: roles };
  });

  // Method for checking whether an assessments associated interview questionnaire has at least
  // one applicabel question for a set of scoped roles
  fastify.post("/assessment-roles/validate", async (request, reply) => {
    const { assessmentId, roleIds } = request.body as {
      assessmentId: number;
      roleIds: number[];
    };

    if (!assessmentId || !roleIds || roleIds.length === 0) {
      return reply.status(400).send({
        success: false,
        error: "assessmentId and roleIds are required",
      });
    }
    const isValid =
      await request.interviewsService!.validateAssessmentRolesForQuestionnaire(
        assessmentId,
        roleIds
      );

    return { success: true, data: { isValid } };
  });

  // Method for validating that a program questionnaire has applicable questions for given role IDs
  fastify.post(
    "/questionnaires/:questionnaireId/validate-roles",
    async (request, reply) => {
      const { questionnaireId } = request.params as {
        questionnaireId: number;
      };
      const { roleIds } = request.body as { roleIds: number[] };

      if (!questionnaireId || !roleIds || roleIds.length === 0) {
        return reply.status(400).send({
          success: false,
          error: "questionnaireId and roleIds are required",
        });
      }

      const isValid =
        await request.interviewsService!.validateProgramQuestionnaireHasApplicableRoles(
          questionnaireId,
          roleIds
        );

      return { success: true, data: { isValid } };
    }
  );
}
