import { Type } from "@sinclair/typebox";

export const widgetSchemas = {
  querystring: {
    activity: Type.Object({
      entityType: Type.Union(
        [
          Type.Literal("interviews"),
          Type.Literal("assessments"),
          Type.Literal("programs"),
        ],
        { description: "The type of entity to fetch activity data for" }
      ),
    }),

    metrics: Type.Object({
      metricType: Type.Union(
        [
          Type.Literal("generated-actions"),
          Type.Literal("generated-recommendations"),
          Type.Literal("worst-performing-domain"),
          Type.Literal("high-risk-areas"),
          Type.Literal("assessment-activity"),
        ],
        { description: "The type of metric to fetch" }
      ),
      title: Type.Optional(
        Type.String({ description: "Optional custom title for the metric" })
      ),
    }),

    table: Type.Object({
      entityType: Type.Union(
        [
          Type.Literal("actions"),
          Type.Literal("recommendations"),
          Type.Literal("comments"),
        ],
        { description: "The type of table data to fetch" }
      ),
      assessmentId: Type.Optional(
        Type.Number({ description: "Optional assessment ID for filtering" })
      ),
      programId: Type.Optional(
        Type.Number({ description: "Optional program ID for filtering" })
      ),
    }),

    actions: Type.Object({
      entityType: Type.String({ description: "The entity type for actions" }),
    }),
  },

  responses: {
    configOptions: Type.Object({
      success: Type.Boolean(),
      data: Type.Object({
        assessments: Type.Array(
          Type.Object({
            id: Type.Number(),
            name: Type.String(),
            status: Type.String(),
          })
        ),
        programs: Type.Array(
          Type.Object({
            id: Type.Number(),
            name: Type.String(),
            status: Type.String(),
          })
        ),
        interviews: Type.Array(
          Type.Object({
            id: Type.Number(),
            name: Type.String(),
            status: Type.String(),
          })
        ),
      }),
    }),

    activityData: Type.Object({
      success: Type.Boolean(),
      data: Type.Object({
        total: Type.Number({ description: "Total count of entities" }),
        breakdown: Type.Record(Type.String(), Type.Number(), {
          description:
            "Status breakdown with status names as keys and counts as values",
        }),
        items: Type.Array(
          Type.Object({
            id: Type.Number(),
            status: Type.String(),
            created_at: Type.String(),
            updated_at: Type.String(),
            name: Type.String(),
            type: Type.Optional(
              Type.Union([Type.Literal("onsite"), Type.Literal("desktop")])
            ),
            is_individual: Type.Optional(Type.Boolean()),
            assessment: Type.Optional(
              Type.Object({
                id: Type.Number(),
                name: Type.String(),
              })
            ),
            program_phase: Type.Optional(
              Type.Object({
                id: Type.Number(),
                name: Type.String(),
                program: Type.Object({
                  id: Type.Number(),
                  name: Type.String(),
                }),
              })
            ),
          })
        ),
      }),
    }),

    metricData: Type.Object({
      success: Type.Boolean(),
      data: Type.Object({
        title: Type.String(),
        metricType: Type.String(),
        value: Type.Union([Type.Number(), Type.String()]),
        phaseBadge: Type.Optional(
          Type.Object({
            text: Type.String(),
            color: Type.String(),
            borderColor: Type.String(),
          })
        ),
        badges: Type.Optional(
          Type.Array(
            Type.Object({
              text: Type.String(),
              color: Type.String(),
              borderColor: Type.String(),
              icon: Type.Optional(Type.String()),
            })
          )
        ),
        secondaryMetrics: Type.Optional(
          Type.Array(
            Type.Object({
              value: Type.Union([Type.Number(), Type.String()]),
              label: Type.String(),
              icon: Type.Optional(Type.String()),
            })
          )
        ),
        subtitle: Type.Optional(Type.String()),
        description: Type.Optional(Type.String()),
        trend: Type.Optional(Type.Number()),
        status: Type.Optional(
          Type.Union([
            Type.Literal("up"),
            Type.Literal("down"),
            Type.Literal("neutral"),
          ])
        ),
      }),
    }),

    tableData: Type.Object({
      success: Type.Boolean(),
      data: Type.Object({
        rows: Type.Array(
          Type.Record(Type.String(), Type.Union([Type.String(), Type.Number()]))
        ),
        columns: Type.Array(
          Type.Object({
            key: Type.String(),
            label: Type.String(),
          })
        ),
        scope: Type.Optional(
          Type.Object({
            assessmentName: Type.Optional(Type.String()),
            programName: Type.Optional(Type.String()),
          })
        ),
      }),
    }),

    actionsData: Type.Object({
      success: Type.Boolean(),
      data: Type.Array(Type.String()),
    }),
  },
};
