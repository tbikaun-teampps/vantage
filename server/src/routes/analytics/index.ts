import { FastifyInstance } from "fastify";
import {
  getOverallHeatmapFilters,
  HeatmapService,
} from "../../services/analytics/HeatmapService";
import {
  getOverallDesktopGeographicalMapData,
  getOverallGeographicalMapFilters,
  getOverallOnsiteGeographicalMapData,
} from "../../services/analytics/GeographicalMapService";
import {
  InterviewResponseData,
  ProgramInterviewHeatmapDataPoint,
} from "../../types/analytics";

export async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Analytics"];
    }
  });
  // Method for fetching overall heatmap filter options
  fastify.get(
    "/overall/heatmap/filters",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            companyId: { type: "string" },
            assessmentType: { type: "string", enum: ["onsite", "desktop"] },
          },
          required: ["companyId", "assessmentType"],
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
      const { companyId, assessmentType } = request.query as {
        companyId: string;
        assessmentType: "onsite" | "desktop";
      };
      const { supabaseClient } = request;
      const filters = await getOverallHeatmapFilters(
        supabaseClient,
        companyId,
        assessmentType
      );
      return {
        success: true,
        data: filters,
      };
    }
  );

  // Method for fetching overall onsite heatmap data
  fastify.get(
    "/heatmap/overall-onsite",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            companyId: { type: "string" },
            questionnaireId: { type: "string" },
            assessmentId: { type: "string" },
            xAxis: {
              type: "string",
              enum: [
                "business_unit",
                "region",
                "site",
                "asset_group",
                "work_group",
                "role",
                "role_level",
                "section",
                "step",
                "question",
              ],
            },
            yAxis: {
              type: "string",
              enum: [
                "business_unit",
                "region",
                "site",
                "asset_group",
                "work_group",
                "role",
                "role_level",
                "section",
                "step",
                "question",
              ],
            },
          },
          required: ["companyId", "questionnaireId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  xLabels: { type: "array", items: { type: "string" } },
                  yLabels: { type: "array", items: { type: "string" } },
                  metrics: {
                    type: "object",
                    properties: {
                      average_score: {
                        type: "object",
                        properties: {
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                x: { type: "string" },
                                y: { type: "string" },
                                value: { type: "number", nullable: true },
                                sampleSize: { type: "number" },
                                metadata: { type: "object" },
                              },
                            },
                          },
                          values: {
                            type: "array",
                            items: { type: "number", nullable: true },
                          },
                        },
                      },
                      total_interviews: {
                        type: "object",
                        properties: {
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                x: { type: "string" },
                                y: { type: "string" },
                                value: { type: "number", nullable: true },
                                sampleSize: { type: "number" },
                                metadata: { type: "object" },
                              },
                            },
                          },
                          values: {
                            type: "array",
                            items: { type: "number", nullable: true },
                          },
                        },
                      },
                      completion_rate: {
                        type: "object",
                        properties: {
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                x: { type: "string" },
                                y: { type: "string" },
                                value: { type: "number", nullable: true },
                                sampleSize: { type: "number" },
                                metadata: { type: "object" },
                              },
                            },
                          },
                          values: {
                            type: "array",
                            items: { type: "number", nullable: true },
                          },
                        },
                      },
                      total_actions: {
                        type: "object",
                        properties: {
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                x: { type: "string" },
                                y: { type: "string" },
                                value: { type: "number", nullable: true },
                                sampleSize: { type: "number" },
                                metadata: { type: "object" },
                              },
                            },
                          },
                          values: {
                            type: "array",
                            items: { type: "number", nullable: true },
                          },
                        },
                      },
                    },
                  },
                  config: {
                    type: "object",
                    properties: {
                      xAxis: { type: "string" },
                      yAxis: { type: "string" },
                      questionnaireId: { type: "number" },
                      assessmentId: { type: "number", nullable: true },
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
      const { companyId, questionnaireId, assessmentId, xAxis, yAxis } =
        request.query as {
          companyId: string;
          questionnaireId: string;
          assessmentId?: string;
          xAxis?:
            | "business_unit"
            | "region"
            | "site"
            | "asset_group"
            | "work_group"
            | "role"
            | "role_level"
            | "section"
            | "step"
            | "question";
          yAxis?:
            | "business_unit"
            | "region"
            | "site"
            | "asset_group"
            | "work_group"
            | "role"
            | "role_level"
            | "section"
            | "step"
            | "question";
        };

      const { supabaseClient } = request;

      // Parse string query params to numbers
      const parsedQuestionnaireId = parseInt(questionnaireId);
      const parsedAssessmentId = assessmentId
        ? parseInt(assessmentId)
        : undefined;

      const heatmapService = new HeatmapService({
        type: "onsite",
        companyId,
        supabaseClient,
        questionnaireId: parsedQuestionnaireId,
        xAxis,
        yAxis,
        assessmentId: parsedAssessmentId,
      });
      return {
        success: true,
        data: await heatmapService.getOnsiteHeatmap(),
      };
    }
  );

  // Method for fetching overall desktop heatmap data
  fastify.get(
    "/heatmap/overall-desktop",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            companyId: { type: "string" },
            assessmentId: { type: "string" },
            xAxis: {
              type: "string",
              enum: [
                "business_unit",
                "region",
                "site",
                "asset_group",
                "work_group",
                "role",
                "role_level",
              ],
            },
          },
          required: ["companyId"],
        },
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: {
          //       type: "object",
          //       properties: {
          //         xLabels: { type: "array", items: { type: "string" } },
          //         yLabels: { type: "array", items: { type: "string" } },
          //         metrics: {
          //           type: "object",
          //           properties: {
          //             average_score: {
          //               type: "object",
          //               properties: {
          //                 data: {
          //                   type: "array",
          //                   items: {
          //                     type: "object",
          //                     properties: {
          //                       x: { type: "string" },
          //                       y: { type: "string" },
          //                       value: { type: "number", nullable: true },
          //                       sampleSize: { type: "number" },
          //                       metadata: { type: "object" },
          //                     },
          //                   },
          //                 },
          //                 values: {
          //                   type: "array",
          //                   items: { type: "number", nullable: true },
          //                 },
          //               },
          //             },
          //             total_interviews: {
          //               type: "object",
          //               properties: {
          //                 data: {
          //                   type: "array",
          //                   items: {
          //                     type: "object",
          //                     properties: {
          //                       x: { type: "string" },
          //                       y: { type: "string" },
          //                       value: { type: "number", nullable: true },
          //                       sampleSize: { type: "number" },
          //                       metadata: { type: "object" },
          //                     },
          //                   },
          //                 },
          //                 values: {
          //                   type: "array",
          //                   items: { type: "number", nullable: true },
          //                 },
          //               },
          //             },
          //             completion_rate: {
          //               type: "object",
          //               properties: {
          //                 data: {
          //                   type: "array",
          //                   items: {
          //                     type: "object",
          //                     properties: {
          //                       x: { type: "string" },
          //                       y: { type: "string" },
          //                       value: { type: "number", nullable: true },
          //                       sampleSize: { type: "number" },
          //                       metadata: { type: "object" },
          //                     },
          //                   },
          //                 },
          //                 values: {
          //                   type: "array",
          //                   items: { type: "number", nullable: true },
          //                 },
          //               },
          //             },
          //             total_actions: {
          //               type: "object",
          //               properties: {
          //                 data: {
          //                   type: "array",
          //                   items: {
          //                     type: "object",
          //                     properties: {
          //                       x: { type: "string" },
          //                       y: { type: "string" },
          //                       value: { type: "number", nullable: true },
          //                       sampleSize: { type: "number" },
          //                       metadata: { type: "object" },
          //                     },
          //                   },
          //                 },
          //                 values: {
          //                   type: "array",
          //                   items: { type: "number", nullable: true },
          //                 },
          //               },
          //             },
          //           },
          //         },
          //         config: {
          //           type: "object",
          //           properties: {
          //             xAxis: { type: "string" },
          //             yAxis: { type: "string" },
          //             assessmentId: { type: "number", nullable: true },
          //           },
          //         },
          //       },
          //     },
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
      const { companyId, assessmentId, xAxis } = request.query as {
        companyId: string;
        assessmentId?: string;
        xAxis?:
          | "business_unit"
          | "region"
          | "site"
          | "asset_group"
          | "work_group"
          | "role"
          | "role_level";
      };

      const { supabaseClient } = request;

      // Parse string query params to numbers
      const parsedAssessmentId = assessmentId
        ? parseInt(assessmentId)
        : undefined;

      const heatmapService = new HeatmapService({
        type: "desktop",
        companyId,
        supabaseClient,
        xAxis,
        yAxis: "measurement",
        assessmentId: parsedAssessmentId,
      });
      return {
        success: true,
        data: await heatmapService.getDesktopHeatmap(),
      };
    }
  );

  // Method for fetching overall onsite geographical map data
  fastify.get(
    "/geographical-map/overall-onsite",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            companyId: { type: "string" },
            assessmentId: { type: "string" },
            questionnaireId: { type: "string" },
          },
          required: ["companyId", "questionnaireId"],
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
                    name: { type: "string" },
                    lat: { type: "number" },
                    lng: { type: "number" },
                    region: { type: "string" },
                    businessUnit: { type: "string" },
                    score: { type: "number" },
                    interviews: { type: "number" },
                    totalActions: { type: "number" },
                    completionRate: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      // Questionnaire is required as this makes the context of the data aggregations make sense.
      const { companyId, assessmentId, questionnaireId } = request.query as {
        companyId: string;
        assessmentId: number;
        questionnaireId: number;
      };

      const { supabaseClient } = request;

      const data = await getOverallOnsiteGeographicalMapData(
        supabaseClient,
        companyId,
        questionnaireId,
        assessmentId
      );
      return {
        success: true,
        data,
      };
    }
  );

  // Method for fetching overall desktop geographical map data
  fastify.get(
    "/geographical-map/overall-desktop",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            companyId: { type: "string" },
            assessmentId: { type: "string" },
          },
          required: ["companyId"],
        },
        response: {
          // TODO: add proper response model.
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: {
          //       type: "array",
          //       items: {
          //         type: "object",
          //         properties: {
          //           name: { type: "string" },
          //           lat: { type: "number" },
          //           lng: { type: "number" },
          //           region: { type: "string" },
          //           businessUnit: { type: "string" },
          //           score: { type: "number" },
          //           interviews: { type: "number" },
          //           totalActions: { type: "number" },
          //           completionRate: { type: "number" },
          //         },
          //       },
          //     },
          //   },
          // },
        },
      },
    },
    async (request) => {
      const { companyId, assessmentId } = request.query as {
        companyId: string;
        assessmentId: number;
      };

      const { supabaseClient } = request;

      const data = await getOverallDesktopGeographicalMapData(
        supabaseClient,
        companyId,
        assessmentId
      );
      return {
        success: true,
        data,
      };
    }
  );

  // Method for fetching overall geographical map filter options
  fastify.get(
    "/overall/geographical-map/filters",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            companyId: { type: "string" },
            assessmentType: { type: "string", enum: ["onsite", "desktop"] },
          },
          required: ["companyId", "assessmentType"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  options: {
                    type: "object",
                    properties: {
                      assessments: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "number" },
                            name: { type: "string" },
                            questionnaireId: { type: "number", nullable: true },
                          },
                        },
                      },
                      questionnaires: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "number" },
                            name: { type: "string" },
                            assessmentIds: {
                              type: "array",
                              items: { type: "number" },
                            },
                          },
                        },
                      },
                      measurements: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "number" },
                            name: { type: "string" },
                          },
                        },
                      },
                      aggregationMethods: {
                        type: "array",
                        items: {
                          type: "string",
                          enum: ["average", "sum", "count"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { companyId, assessmentType } = request.query as {
        companyId: string;
        assessmentType: "onsite" | "desktop";
      };

      const { supabaseClient } = request;

      const filters = await getOverallGeographicalMapFilters(
        supabaseClient,
        companyId,
        assessmentType
      );

      return {
        success: true,
        data: filters,
      };
    }
  );

  fastify.get(
    "/heatmap/program-interviews/:programId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
          },
          required: ["programId"],
        },
        querystring: {
          type: "object",
          properties: {
            questionnaireType: { type: "string", enum: ["presite", "onsite"] },
          },
          required: ["questionnaireType"],
        },
      },
    },
    async (request) => {
      const { programId } = request.params as { programId: number };
      const { questionnaireType } = request.query as {
        questionnaireType: "presite" | "onsite";
      };
      const { supabaseClient } = request;

      const { data: program, error: programError } = await supabaseClient
        .from("programs")
        .select("*, phases:program_phases(*)")
        .eq("id", programId)
        .single();

      if (programError || !program) {
        return {
          success: false,
          error: "Program not found",
        };
      }

      if (
        !program.presite_questionnaire_id &&
        questionnaireType === "presite"
      ) {
        return {
          success: false,
          error: "Program does not have a presite questionnaire configured",
        };
      }
      if (!program.onsite_questionnaire_id && questionnaireType === "onsite") {
        return {
          success: false,
          error: "Program does not have an onsite questionnaire configured",
        };
      }

      // Get questionnaire ID based on type
      const questionnaireId =
        questionnaireType === "presite"
          ? program.presite_questionnaire_id
          : program.onsite_questionnaire_id;

      if (!questionnaireId) {
        return {
          success: false,
          error: "Questionnaire ID not found for the specified type",
        };
      }

      // Fetch all interviews for this program that use the specified questionnaire
      const { data: interviews, error: interviewsError } = await supabaseClient
        .from("interviews")
        .select(
          `
            id,
            program_phase_id,
            program_phases!inner(
              id,
              name,
              sequence_number
            ),
            interview_responses!inner(
              id,
              rating_score,
              is_applicable,
              is_unknown,
              questionnaire_question_id,
              questionnaire_questions!inner(
                id,
                title,
                questionnaire_step_id,
                questionnaire_steps!inner(
                  questionnaire_section_id,
                  questionnaire_sections!inner(
                    title
                  )
                )
              )
            )
          `
        )
        .eq("program_id", programId)
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false)
        .not("interview_responses.rating_score", "is", null) // TODO: handle when responses are `is_unknown: true`
        .not("program_phase_id", "is", null)
        .eq("interview_responses.is_applicable", true)
        .eq("interview_responses.is_deleted", false);

      if (interviewsError) {
        throw interviewsError;
      }

      const responses: InterviewResponseData[] = [];

      interviews?.forEach((interview) => {
        interview.interview_responses.forEach((response) => {
          if (response.rating_score !== null) {
            const question = response.questionnaire_questions;
            const step = question.questionnaire_steps;
            const section = step.questionnaire_sections;

            responses.push({
              id: response.id,
              rating_score: response.rating_score,
              interview_id: interview.id,
              program_phase_id: interview.program_phases.id,
              phase_name: interview.program_phases.name,
              phase_sequence: interview.program_phases?.sequence_number,
              questionnaire_question_id: response.questionnaire_question_id,
              section_title: section.title,
              question_title: question.title,
            });
          }
        });
      });

      if (!program || program.phases.length < 2 || responses.length === 0) {
        return { data: [], transitions: [], sections: [] };
      }

      const phases = program.phases;

      const sortedPhases = phases.sort(
        (a, b) => a.sequence_number - b.sequence_number
      );

      // Group responses by section and phase
      const sectionPhaseGroups = new Map<
        string,
        Map<number, InterviewResponseData[]>
      >();

      responses.forEach((response) => {
        const sectionTitle = response.section_title;
        const phaseId = response.program_phase_id;

        if (!sectionPhaseGroups.has(sectionTitle)) {
          sectionPhaseGroups.set(sectionTitle, new Map());
        }

        const phaseMap = sectionPhaseGroups.get(sectionTitle)!;
        if (!phaseMap.has(phaseId)) {
          phaseMap.set(phaseId, []);
        }
        phaseMap.get(phaseId)!.push(response);
      });

      // Get all unique sections, sorted alphabetically
      const sections = Array.from(sectionPhaseGroups.keys()).sort();

      const transitions: string[] = [];
      const data: ProgramInterviewHeatmapDataPoint[] = [];

      // Create transition names (only do this once since they're the same for all sections)
      for (let i = 0; i < sortedPhases.length - 1; i++) {
        const current = sortedPhases[i];
        const next = sortedPhases[i + 1];
        const transition = `${current.name || `Assessment ${current.sequence_number}`} → ${next.name || `Assessment ${next.sequence_number}`}`;
        transitions.push(transition);
      }

      // For each section, calculate differences between phases
      sections.forEach((sectionTitle) => {
        const phaseMap = sectionPhaseGroups.get(sectionTitle)!;

        // Calculate stats for each phase in this section
        const sectionPhaseStats = sortedPhases.map((phase) => {
          const sectionPhaseResponses = phaseMap.get(phase.id) || [];

          // Calculate average score for this section in this phase
          const scores = sectionPhaseResponses
            .map((r) => r.rating_score)
            .filter((score): score is number => score !== null);

          const averageScore =
            scores.length > 0
              ? scores.reduce((sum, score) => sum + score, 0) / scores.length
              : 0;

          // Count unique interviews for this section in this phase
          const uniqueInterviews = new Set(
            sectionPhaseResponses.map((r) => r.interview_id)
          ).size;

          return {
            phase,
            averageScore: Math.round(averageScore * 100) / 100,
            responseCount: sectionPhaseResponses.length,
            interviewCount: uniqueInterviews,
          };
        });

        // Create phase transitions and calculate differences for this section
        for (let i = 0; i < sectionPhaseStats.length - 1; i++) {
          const current = sectionPhaseStats[i];
          const next = sectionPhaseStats[i + 1];

          const transition = `${current.phase.name || `Phase ${current.phase.sequence_number}`} → ${next.phase.name || `Phase ${next.phase.sequence_number}`}`;

          const difference = next.averageScore - current.averageScore;
          const percentChange =
            current.averageScore !== 0
              ? (difference / current.averageScore) * 100
              : 0;

          data.push({
            section: sectionTitle,
            phaseTransition: transition,
            difference,
            percentChange,
            fromValue: current.averageScore,
            toValue: next.averageScore,
            fromPhase:
              current.phase.name || `Phase ${current.phase.sequence_number}`,
            toPhase: next.phase.name || `Phase ${next.phase.sequence_number}`,
            responseCountChange: next.responseCount - current.responseCount,
            interviewCountChange: next.interviewCount - current.interviewCount,
          });
        }
      });

      return {
        success: true,
        data: {
          data,
          transitions,
          sections,
          metadata: {
            totalResponses: responses.length,
            totalInterviews: new Set(responses.map((r) => r.interview_id)).size,
          },
        },
      };
    }
  );

  fastify.get(
    "/heatmap/program-measurements/:programId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            programId: { type: "number" },
          },
          required: ["programId"],
        },
      },
    },
    async (request) => {
      const { programId } = request.params as { programId: number };
      const { supabaseClient } = request;

      // Get program phases
      const { data: phases, error: phaseError } = await supabaseClient
        .from("program_phases")
        .select("*")
        .eq("program_id", programId);

      if (phaseError) throw phaseError;

      const { data: measurementsData, error: measurementsError } =
        await supabaseClient
          .from("measurements_calculated")
          .select(
            `
        *,
        measurement_definition:measurement_definitions!measurement_definition_id(
          id,
          name,
          description,
          calculation_type,
          required_csv_columns,
          provider
        )
      `
          )
          .in("program_phase_id", phases?.map((phase) => phase.id) || [])
          .order("created_at", { ascending: false });

      if (measurementsError) throw measurementsError;

      if (phases.length < 2 || measurementsData.length === 0) {
        return { data: [], measurements: [], transitions: [] };
      }

      // Transform data for heatmap showing differences between phases

      const sortedPhases = phases.sort(
        (a, b) => a.sequence_number - b.sequence_number
      );

      // Group measurements by phase ID
      const phaseMap = new Map<number, typeof measurementsData>();
      measurementsData.forEach((measurement) => {
        if (measurement.program_phase_id !== null) {
          if (!phaseMap.has(measurement.program_phase_id)) {
            phaseMap.set(measurement.program_phase_id, []);
          }
          phaseMap.get(measurement.program_phase_id)!.push(measurement);
        }
      });

      // Get all unique measurement names across all phases
      const allMeasurements = new Set<string>();
      measurementsData.forEach((measurement) => {
        if (measurement.measurement_definition?.name) {
          allMeasurements.add(measurement.measurement_definition.name);
        }
      });

      const measurements = Array.from(allMeasurements).sort();
      const transitions: string[] = [];
      const data: Array<{
        measurement: string;
        phaseTransition: string;
        difference: number;
        percentChange: number;
        fromValue: number;
        toValue: number;
        fromPhase: string;
        toPhase: string;
      }> = [];

      // Create phase transitions and calculate differences
      for (let i = 0; i < sortedPhases.length - 1; i++) {
        const currentPhase = sortedPhases[i];
        const nextPhase = sortedPhases[i + 1];
        const transition = `${currentPhase.name || `Phase ${currentPhase.sequence_number}`} → ${nextPhase.name || `Phase ${nextPhase.sequence_number}`}`;
        transitions.push(transition);

        const currentMetrics = phaseMap.get(currentPhase.id) || [];
        const nextMetrics = phaseMap.get(nextPhase.id) || [];

        measurements.forEach((measurementName) => {
          const currentMeasurement = currentMetrics.find(
            (m) => m.measurement_definition?.name === measurementName
          );
          const nextMeasurement = nextMetrics.find(
            (m) => m.measurement_definition?.name === measurementName
          );

          const currentValue = currentMeasurement?.calculated_value || 0;
          const nextValue = nextMeasurement?.calculated_value || 0;
          const difference = nextValue - currentValue;
          const percentChange =
            currentValue !== 0 ? (difference / currentValue) * 100 : 0;

          data.push({
            measurement: measurementName,
            phaseTransition: transition,
            difference,
            percentChange,
            fromValue: currentValue,
            toValue: nextValue,
            fromPhase:
              currentPhase.name || `Phase ${currentPhase.sequence_number}`,
            toPhase: nextPhase.name || `Phase ${nextPhase.sequence_number}`,
          });
        });
      }

      return {
        success: true,
        data: { data, measurements, transitions },
      };
    }
  );
}
