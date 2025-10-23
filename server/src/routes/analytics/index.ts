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
}
