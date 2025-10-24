import { SupabaseClient } from "@supabase/supabase-js";
import {
  DesktopHeatmapAxisType,
  FlattenedOverallHeatmapData,
  HeatmapAxisType,
  HeatmapMetric,
  HeatmapMetricResult,
  OverallDesktopHeatmapFilters,
  OverallOnsiteHeatmapFilters,
  RawOverallHeatmapData,
} from "../../types/entities/analytics";
import { BadRequestError } from "../../plugins/errorHandler";
import { Database } from "../../types/database";
import { RoleLevel } from "../../types/entities/companies";

interface HeatMapParams {
  type: "onsite" | "desktop";
  companyId: string;
  supabaseClient: SupabaseClient<Database>;
  questionnaireId?: number;
  xAxis?: HeatmapAxisType | DesktopHeatmapAxisType;
  yAxis?: HeatmapAxisType | DesktopHeatmapAxisType;
  assessmentId?: number;
}

export class HeatmapService {
  private supabase;
  private companyId: string;
  private questionnaireId?: number;
  private assessmentId?: number;
  private xAxis: HeatmapAxisType | DesktopHeatmapAxisType;
  private yAxis: HeatmapAxisType | DesktopHeatmapAxisType;

  constructor({
    type,
    companyId,
    supabaseClient,
    questionnaireId,
    xAxis,
    yAxis,
    assessmentId,
  }: HeatMapParams) {
    this.supabase = supabaseClient;
    this.companyId = companyId;
    this.questionnaireId = questionnaireId;
    this.assessmentId = assessmentId;
    this.xAxis = xAxis ?? "business_unit";
    this.yAxis = yAxis ?? "role";

    if (type === "onsite") {
      // Assert that a questionnaireId is provided for onsite assessments
      if (!questionnaireId) {
        throw new BadRequestError(
          "questionnaireId is required for onsite assessments"
        );
      }
    }
  }

  /**
   * Validates whether a desktop measurement row should be included for the given axis level.
   * Implements hierarchical filtering: only includes rows where:
   * 1. The current axis level has a non-null value
   * 2. All levels below the specified axis are null/undefined
   * This prevents incorrect aggregation of lower-level data and excludes rows with missing axis values.
   *
   * Company hierarchy (high to low): business_unit → region → site → asset_group → work_group → role
   */
  private shouldIncludeDesktopRowForAxis(
    row: {
      business_unit: string | undefined;
      region: string | undefined;
      site: string | undefined;
      asset_group: string | undefined;
      work_group: string | undefined;
      role: string | undefined;
    },
    axis: string
  ): boolean {
    // Define the hierarchy from high to low
    const hierarchy = [
      "business_unit",
      "region",
      "site",
      "asset_group",
      "work_group",
      "role",
    ];

    // Special case: "measurement" axis doesn't follow company hierarchy
    if (axis === "measurement") {
      // For measurement axis, we typically want all rows regardless of company level
      // This allows measurements to be aggregated across the entire company structure
      return true;
    }

    const axisIndex = hierarchy.indexOf(axis);

    // If axis not found in hierarchy, don't include the row
    if (axisIndex === -1) {
      return false;
    }

    // Check that the current axis level has a non-null value
    const currentLevel = hierarchy[axisIndex] as keyof typeof row;
    if (row[currentLevel] == null || row[currentLevel] === undefined) {
      // This row doesn't have data for the current axis level - exclude it
      return false;
    }

    // Check that all levels below the current axis are null/undefined
    for (let i = axisIndex + 1; i < hierarchy.length; i++) {
      const lowerLevel = hierarchy[i] as keyof typeof row;
      if (row[lowerLevel] != null && row[lowerLevel] !== undefined) {
        // Found a lower level with data - this row is too specific for this axis
        return false;
      }
    }

    return true;
  }

  /**
   * Main method to get desktop heatmap data
   */
  public async getDesktopHeatmap() {
    // Fetch all the assessments that use the questionnaireId
    let query = this.supabase
      .from("assessments")
      .select("*")
      .eq("company_id", this.companyId);

    if (this.assessmentId) {
      query = query.eq("id", this.assessmentId);
    }

    const { data: assessments, error } = await query;

    if (error) throw error;

    // Fetch all calculated measurements for these assessments
    const { data: measurements, error: measurementsError } = await this.supabase
      .from("measurements_calculated")
      .select(
        `
          *,
          definition:measurement_definition_id(*),
          business_unit:business_unit_id(name),
          region:region_id(name),
          site:site_id(name, lat, lng),
          asset_group:asset_group_id(name),
          work_group:work_group_id(name),
          role:role_id(level, shared_roles(name, description))
        `
      )
      .in("assessment_id", assessments?.map((a) => a.id) || [])
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .eq("definition.is_deleted", false)
      .eq("business_unit.is_deleted", false)
      .eq("region.is_deleted", false)
      .eq("site.is_deleted", false)
      .eq("asset_group.is_deleted", false)
      .eq("work_group.is_deleted", false)
      .eq("role.is_deleted", false)
      .eq("role.shared_roles.is_deleted", false);

    if (measurementsError) throw measurementsError;

    console.log("Fetched measurements:", measurements);

    // Flatten the data structure
    const flatData = measurements.map((m) => ({
      measurement_id: m.definition.id,
      measurement_name: m.definition.name,
      measurement_description: m.definition.description || null,
      measurement_unit: m.definition.unit || null,
      measurement_value: m.calculated_value,

      // Flatten company structure
      business_unit: m.business_unit?.name,
      region: m.region?.name,
      site: m.site?.name,
      asset_group: m.asset_group?.name,
      work_group: m.work_group?.name,
      role: m.role?.shared_roles?.name,
      role_level: m.role?.level,

      // Geographic data
      site_lat: m.site?.lat,
      site_lng: m.site?.lng,
    }));

    console.log("flatData: ", flatData);

    // Group by x and y axes
    const grouped = this.groupByDesktop(flatData);

    // Define aggregation methods
    const aggregationMethods = ["sum", "average", "count"] as const;

    // Calculate all aggregations for each group
    const aggregationResults: Record<
      (typeof aggregationMethods)[number],
      Array<{
        x: string;
        y: string;
        value: number | null;
        sampleSize: number;
        metadata: object;
      }>
    > = {
      sum: [],
      average: [],
      count: [],
    };

    Object.entries(grouped).forEach(([key, rows]) => {
      const [xValue, yValue] = key.split("|||");

      // Calculate each aggregation for this group
      aggregationMethods.forEach((method) => {
        const aggregationValue = this.calculateDesktopAggregation(rows, method);

        aggregationResults[method].push({
          x: xValue,
          y: yValue,
          value: aggregationValue.value,
          sampleSize: rows.length,
          metadata: aggregationValue.metadata,
        });
      });
    });

    // Extract unique labels (same for all aggregations)
    const xLabels = [...new Set(aggregationResults.sum.map((d) => d.x))].sort();
    const yLabels = [...new Set(aggregationResults.sum.map((d) => d.y))].sort();

    return {
      xLabels,
      yLabels,
      aggregations: {
        sum: {
          data: aggregationResults.sum,
          values: aggregationResults.sum.map((d) => d.value),
        },
        average: {
          data: aggregationResults.average,
          values: aggregationResults.average.map((d) => d.value),
        },
        count: {
          data: aggregationResults.count,
          values: aggregationResults.count.map((d) => d.value),
        },
      },
      config: {
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        assessmentId: this.assessmentId ?? null,
      },
    };
  }

  /**
   * Groups flattened desktop measurement data by x-axis and y-axis values.
   * Applies hierarchical filtering to ensure only rows at the appropriate level are included.
   */
  private groupByDesktop(
    data: {
      measurement_id: number;
      measurement_name: string;
      measurement_description: string | null;
      measurement_unit: string | null;
      measurement_value: number;
      business_unit: string | undefined;
      region: string | undefined;
      site: string | undefined;
      asset_group: string | undefined;
      work_group: string | undefined;
      role: string | undefined;
      role_level: RoleLevel | null | undefined;
      site_lat: number | undefined | null;
      site_lng: number | undefined | null;
    }[]
  ): Record<string, (typeof data)[number][]> {
    const groups: Record<string, (typeof data)[number][]> = {};

    data.forEach((row) => {
      // Apply hierarchical filtering for x-axis
      // Note: y-axis is hardcoded to 'measurement' which doesn't need filtering
      if (!this.shouldIncludeDesktopRowForAxis(row, this.xAxis)) {
        // Skip this row - it's too specific for the selected x-axis level
        return;
      }

      // Direct property access using the axis values
      const xValue = this.getDesktopAxisValue(row, this.xAxis);
      const yValue = this.getDesktopAxisValue(row, "measurement");
      const key = `${xValue}|||${yValue}`;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    });

    return groups;
  }

  /**
   * Gets the value for a given axis type from a flattened desktop measurement row
   */
  private getDesktopAxisValue(
    row: {
      measurement_id: number;
      measurement_name: string;
      measurement_description: string | null;
      measurement_unit: string | null;
      measurement_value: number;
      business_unit: string | undefined;
      region: string | undefined;
      site: string | undefined;
      asset_group: string | undefined;
      work_group: string | undefined;
      role: string | undefined;
      role_level: RoleLevel | null | undefined;
      site_lat: number | undefined | null;
      site_lng: number | undefined | null;
    },
    axis: string
  ): string | number | null {
    // Map axis types to their corresponding property names
    switch (axis) {
      case "measurement":
        return row.measurement_name;
      case "business_unit":
        return row.business_unit ?? null;
      case "region":
        return row.region ?? null;
      case "site":
        return row.site ?? null;
      case "asset_group":
        return row.asset_group ?? null;
      case "work_group":
        return row.work_group ?? null;
      case "role":
        return row.role ?? null;
      default:
        return null;
    }
  }

  /**
   * Calculate aggregations for desktop measurements
   */
  private calculateDesktopAggregation(
    rows: {
      measurement_id: number;
      measurement_name: string;
      measurement_description: string | null;
      measurement_unit: string | null;
      measurement_value: number;
      business_unit: string | undefined;
      region: string | undefined;
      site: string | undefined;
      asset_group: string | undefined;
      work_group: string | undefined;
      role: string | undefined;
      role_level: RoleLevel | null | undefined;
      site_lat: number | undefined | null;
      site_lng: number | undefined | null;
    }[],
    method: "sum" | "average" | "count"
  ): {
    value: number | null;
    metadata: object;
  } {
    switch (method) {
      case "sum": {
        const values = rows
          .filter((r) => r.measurement_value !== null)
          .map((r) => r.measurement_value);
        return {
          value: values.length > 0 ? values.reduce((a, b) => a + b, 0) : null,
          metadata: {
            validValues: values.length,
            totalRows: rows.length,
          },
        };
      }

      case "average": {
        const values = rows
          .filter((r) => r.measurement_value !== null)
          .map((r) => r.measurement_value);
        return {
          value:
            values.length > 0
              ? values.reduce((a, b) => a + b, 0) / values.length
              : null,
          metadata: {
            validValues: values.length,
            totalRows: rows.length,
          },
        };
      }

      case "count": {
        return {
          value: rows.length,
          metadata: {
            totalRows: rows.length,
          },
        };
      }
    }
  }

  /**
   * Main method to get onsite heatmap data
   * Note: Onsite assessment data is always captured at the most granular level
   * (role + question), so hierarchical filtering is not needed like it is for desktop data.
   */
  public async getOnsiteHeatmap() {
    const rawData = await this.fetchOnsiteRawData();
    console.log(`Fetched ${rawData.length} raw records`);
    const flatData = this.flattenRawData(rawData);
    console.log(`Flattened to ${flatData.length} records`);
    const heatmapData = this.generateOnsiteHeatmap(flatData);

    return {
      ...heatmapData,
      config: {
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        questionnaireId: this.questionnaireId,
        assessmentId: this.assessmentId ?? null,
      },
    };
  }

  /**
   * Fetch raw onsite data
   */
  private async fetchOnsiteRawData(): Promise<RawOverallHeatmapData[]> {
    // Fetch all the assessments that use the questionnaireId
    if (!this.questionnaireId) {
      throw new BadRequestError("questionnaireId is required for onsite data");
    }
    let query = this.supabase
      .from("assessments")
      .select("*")
      .eq("questionnaire_id", this.questionnaireId);

    if (this.assessmentId) {
      query = query.eq("id", this.assessmentId);
    }

    const { data: assessments, error } = await query;

    if (error) throw error;

    console.log(`Fetched ${assessments?.length || 0} assessments`);

    // NOTE: The only reliable way to get the location details
    // is by finding the site of roles that answer interviews.

    const { data: interviews, error: interviewError } = await this.supabase
      .from("interviews")
      .select(
        `
          id,
          status,
          name,
          questionnaires(
            id,
            name,
            description,
            questionnaire_sections(
              id,
              title,
              questionnaire_steps(
                id,
                title,
                questionnaire_questions(
                  id,
                  title,
                  question_text,
                  context
                  )
                )
              )
          ),
          interview_responses(
            id,
            rating_score,
            is_applicable,
            questionnaire_question_id,
            interview_response_roles(
              id,
              roles(
                id,
                level,
                shared_roles(
                  name,
                  description
                  ),
                work_groups(
                  id,
                  name,
                  description,
                  asset_groups(
                    id,
                    name,
                    description,
                    sites(
                      id,
                      name,
                      description,
                      lat,
                      lng,
                      regions(
                        id,
                        name,
                        description,
                        business_units(
                          id,
                          name,
                          description
                          )
                          )
                        )
                      )
                  )
                )
            )
          )`
      )
      .in("assessment_id", assessments?.map((a) => a.id) || [])
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .eq("interview_responses.is_deleted", false)
      .eq("interview_responses.is_applicable", true) // Only get applicable responses
      .eq(
        "interview_responses.interview_response_roles.roles.is_deleted",
        false
      )
      .eq(
        "interview_responses.interview_response_roles.roles.shared_roles.is_deleted",
        false
      )
      .eq(
        "interview_responses.interview_response_roles.roles.work_groups.is_deleted",
        false
      )
      .eq(
        "interview_responses.interview_response_roles.roles.work_groups.asset_groups.is_deleted",
        false
      )
      .eq(
        "interview_responses.interview_response_roles.roles.work_groups.asset_groups.sites.is_deleted",
        false
      )
      .eq(
        "interview_responses.interview_response_roles.roles.work_groups.asset_groups.sites.regions.is_deleted",
        false
      )
      .eq(
        "interview_responses.interview_response_roles.roles.work_groups.asset_groups.sites.regions.business_units.is_deleted",
        false
      );

    if (interviewError) throw interviewError;

    console.log(`Fetched ${interviews?.length || 0} interviews`);

    return interviews as RawOverallHeatmapData[];
  }

  /**
   * Flatten the nested data structure once
   * TODO: This function will need to be optimised in the future. It's O(n^3) in the worst case
   */
  private flattenRawData(
    rawData: RawOverallHeatmapData[]
  ): FlattenedOverallHeatmapData[] {
    const flattened: FlattenedOverallHeatmapData[] = [];

    rawData.forEach((interview) => {
      interview.interview_responses.forEach((response) => {
        response.interview_response_roles.forEach((roleData) => {
          const role = roleData.roles;

          // Find the question details for this response
          // PostgREST returns questionnaires as array, take first element
          const questionnaire = Array.isArray(interview.questionnaires)
            ? interview.questionnaires[0]
            : interview.questionnaires;
          let questionDetails = null as {
            section_title: string;
            section_id: number;
            step_title: string;
            step_id: number;
            question_id: number;
            question_title: string;
            question_context: string | null;
            question_text: string;
          } | null;

          // Search through sections/steps/questions to find the one matching this response
          questionnaire?.questionnaire_sections.forEach((section) => {
            section.questionnaire_steps.forEach((step) => {
              step.questionnaire_questions.forEach((question) => {
                if (question.id === response.questionnaire_question_id) {
                  questionDetails = {
                    section_title: section.title,
                    section_id: section.id,
                    step_title: step.title,
                    step_id: step.id,
                    question_id: question.id,
                    question_title: question.title,
                    question_context: question.context,
                    question_text: question.question_text,
                  };
                }
              });
            });
          });

          // Create one row per response (which is already per-question)
          flattened.push({
            interview_id: interview.id,
            interview_name: interview.name,
            interview_status: interview.status,
            response_id: response.id,
            rating_score: response.rating_score,
            is_applicable: response.is_applicable,

            // Flatten company structure
            business_unit:
              role.work_groups.asset_groups.sites.regions.business_units.name,
            region: role.work_groups.asset_groups.sites.regions.name,
            site: role.work_groups.asset_groups.sites.name,
            asset_group: role.work_groups.asset_groups.name,
            work_group: role.work_groups.name,
            role: role.shared_roles.name,
            role_level: role.level,

            // Geographic data
            site_lat: role.work_groups.asset_groups.sites.lat,
            site_lng: role.work_groups.asset_groups.sites.lng,

            // Question details (if found)
            section_title: questionDetails?.section_title ?? null,
            section_id: questionDetails?.section_id ?? null,
            step_title: questionDetails?.step_title ?? null,
            step_id: questionDetails?.step_id ?? null,
            question_id: questionDetails?.question_id ?? null,
            question_title: questionDetails?.question_title ?? null,
            question_context: questionDetails?.question_context ?? null,
            question_text: questionDetails?.question_text ?? null,
          });
        });
      });
    });

    return flattened;
  }

  /**
   * Super simple aggregation using the flat structure
   */
  private generateOnsiteHeatmap(flatData: FlattenedOverallHeatmapData[]) {
    // Group by x and y axes - simple property access!
    const grouped = this.groupBy(flatData);

    // Define all metrics to calculate
    const metrics: HeatmapMetric[] = [
      "average_score",
      "total_interviews",
      "completion_rate",
      "total_actions",
    ];

    // Calculate all metrics for each group
    const metricResults: Record<HeatmapMetric, HeatmapMetricResult[]> = {
      average_score: [],
      total_interviews: [],
      completion_rate: [],
      total_actions: [],
    };

    Object.entries(grouped).forEach(([key, rows]) => {
      const [xValue, yValue] = key.split("|||");

      // Calculate each metric for this group
      metrics.forEach((metric) => {
        const metricValue = this.calculateOnsiteMetric(rows, metric);

        metricResults[metric].push({
          x: xValue,
          y: yValue,
          value: metricValue.value,
          sampleSize: rows.length,
          metadata: metricValue.metadata,
        });
      });
    });

    // Extract unique labels (same for all metrics)
    const xLabels = [
      ...new Set(metricResults.average_score.map((d) => d.x)),
    ].sort();
    const yLabels = [
      ...new Set(metricResults.average_score.map((d) => d.y)),
    ].sort();

    return {
      xLabels,
      yLabels,
      metrics: {
        average_score: {
          data: metricResults.average_score,
          values: metricResults.average_score.map((d) => d.value),
        },
        total_interviews: {
          data: metricResults.total_interviews,
          values: metricResults.total_interviews.map((d) => d.value),
        },
        completion_rate: {
          data: metricResults.completion_rate,
          values: metricResults.completion_rate.map((d) => d.value),
        },
        total_actions: {
          data: metricResults.total_actions,
          values: metricResults.total_actions.map((d) => d.value),
        },
      },
    };
  }

  /**
   * Groups flattened data by x-axis and y-axis values
   * @param data - Array of flattened heatmap data to group
   * @returns Object with keys in format "xValue|||yValue" mapping to arrays of grouped records
   */
  private groupBy(
    data: FlattenedOverallHeatmapData[]
  ): Record<string, FlattenedOverallHeatmapData[]> {
    const groups: Record<string, FlattenedOverallHeatmapData[]> = {};

    data.forEach((row) => {
      // Direct property access - no complex traversal!
      const xValue = this.getOnsiteAxisValue(
        row,
        this.xAxis as HeatmapAxisType
      );
      const yValue = this.getOnsiteAxisValue(
        row,
        this.yAxis as HeatmapAxisType
      );
      const key = `${xValue}|||${yValue}`;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    });

    return groups;
  }

  /**
   * Gets the value for a given axis type from a flattened data row
   */
  private getOnsiteAxisValue(
    row: FlattenedOverallHeatmapData,
    axis: HeatmapAxisType
  ): string | number | null {
    // Map questionnaire axis types to their corresponding property names
    switch (axis) {
      case "section":
        return row.section_title;
      case "step":
        return row.step_title;
      case "question":
        return row.question_title;
      default:
        // Company axis types map directly to property names
        return row[axis];
    }
  }

  /**
   * Calculate metrics
   */
  private calculateOnsiteMetric(
    rows: FlattenedOverallHeatmapData[],
    metric: HeatmapMetric
  ): {
    value: number | null;
    metadata: object;
  } {
    switch (metric) {
      case "average_score": {
        const scores = rows
          .filter((r) => r.rating_score !== null)
          .map((r) => r.rating_score) as number[];
        return {
          value:
            scores.length > 0
              ? scores.reduce((a, b) => a + b, 0) / scores.length
              : null,
          metadata: {
            validScores: scores.length,
            totalRows: rows.length,
          },
        };
      }

      case "total_interviews": {
        const uniqueInterviews = new Set(rows.map((r) => r.interview_id));
        return {
          value: uniqueInterviews.size,
          metadata: { interviewIds: Array.from(uniqueInterviews) },
        };
      }

      case "completion_rate": {
        const withScores = rows.filter((r) => r.rating_score !== null).length;
        const total = rows.length;
        return {
          value: total > 0 ? (withScores / total) * 100 : 0,
          metadata: { completed: withScores, total },
        };
      }

      case "total_actions": {
        const applicable = rows.filter((r) => r.is_applicable).length;
        return {
          value: applicable,
          metadata: { applicable },
        };
      }
    }
  }
}

/**
 * Get overall heatmap filters for user interface
 * @param supabase
 * @param companyId
 * @returns
 */
export async function getOverallHeatmapFilters(
  supabase: SupabaseClient<Database>,
  companyId: string,
  assessmentType: "onsite" | "desktop"
): Promise<OverallOnsiteHeatmapFilters | OverallDesktopHeatmapFilters | void> {
  console.log(
    "Fetching overall heatmap filters for:",
    companyId,
    assessmentType
  );
  // Fetch assessment and questionnaire options for the user to select from
  const { data: assessments, error: assessmentsError } = await supabase
    .from("assessments")
    .select("id, name, questionnaires(id, name)")
    .eq("company_id", companyId)
    .eq("is_deleted", false)
    .eq("questionnaires.is_deleted", false)
    .eq("type", assessmentType)
    .order("created_at", { ascending: false });

  if (assessmentsError) {
    console.log("assessmentsError:", assessmentsError);
    throw new Error(assessmentsError.message);
  }
  console.log(`Fetched ${assessments.length} assessments`);

  if (assessmentType === "onsite") {
    const options: OverallOnsiteHeatmapFilters["options"] = {
      assessments: [],
      questionnaires: [],
      axes: [
        {
          value: "business_unit" as const,
          category: "company" as const,
          order: 1,
        },
        {
          value: "region" as const,
          category: "company" as const,
          order: 2,
        },
        {
          value: "site" as const,
          category: "company" as const,
          order: 3,
        },
        {
          value: "asset_group" as const,
          category: "company" as const,
          order: 4,
        },
        {
          value: "work_group" as const,
          category: "company" as const,
          order: 5,
        },
        {
          value: "role" as const,
          category: "company" as const,
          order: 6,
        },
        {
          value: "section" as const,
          category: "questionnaire" as const,
          order: 1,
        },
        {
          value: "step" as const,
          category: "questionnaire" as const,
          order: 2,
        },
        {
          value: "question" as const,
          category: "questionnaire" as const,
          order: 3,
        },
      ],
      metrics: [
        "average_score" as const,
        "total_interviews" as const,
        "completion_rate" as const,
        "total_actions" as const,
      ],
      // TODO: populate these with the parts of the company that are associated with the assessments/interviews.
      regions: null,
      businessUnits: null,
      sites: null,
      roles: null,
      workGroups: null,
      assetGroups: null,
    };

    if (!assessments) {
      return { options };
    }

    // Build unique questionnaires map with their associated assessments
    const questionnairesMap = new Map();
    assessments.forEach((assessment) => {
      // Supabase returns questionnaires as an array due to PostgREST join behavior
      const questionnaire = Array.isArray(assessment.questionnaires)
        ? assessment.questionnaires[0]
        : assessment.questionnaires;
      if (questionnaire) {
        if (!questionnairesMap.has(questionnaire.id)) {
          questionnairesMap.set(questionnaire.id, {
            id: questionnaire.id,
            name: questionnaire.name,
            assessmentIds: [],
          });
        }
        questionnairesMap
          .get(questionnaire.id)
          .assessmentIds.push(assessment.id);
      }
    });

    // Populate options
    options.assessments = assessments.map((a) => {
      const questionnaire = Array.isArray(a.questionnaires)
        ? a.questionnaires[0]
        : a.questionnaires;
      return {
        id: a.id,
        name: a.name,
        questionnaireId: questionnaire.id,
      };
    });
    options.questionnaires = Array.from(questionnairesMap.values());

    return {
      options,
    };
  } else if (assessmentType === "desktop") {
    const options: OverallDesktopHeatmapFilters["options"] = {
      assessments: [],
      axes: [
        {
          value: "business_unit" as const,
          category: "company" as const,
          order: 1,
        },
        {
          value: "region" as const,
          category: "company" as const,
          order: 2,
        },
        {
          value: "site" as const,
          category: "company" as const,
          order: 3,
        },
        {
          value: "asset_group" as const,
          category: "company" as const,
          order: 4,
        },
        {
          value: "work_group" as const,
          category: "company" as const,
          order: 5,
        },
        {
          value: "role" as const,
          category: "company" as const,
          order: 6,
        },
        {
          value: "measurement" as const,
          category: "measurements" as const,
          order: 1,
        },
      ],
      aggregationMethods: [
        "average" as const,
        "sum" as const,
        "count" as const,
      ],
      measurements: [],
    };

    // Populate options
    options.assessments = assessments.map((a) => {
      return {
        id: a.id,
        name: a.name,
      };
    });

    // Fetch measurements used on desktop assessments
    const { data: measurements, error: measurementsError } = await supabase
      .from("measurements_calculated")
      .select("*, definition:measurement_definition_id(*)")
      .in(
        "assessment_id",
        assessments.map((a) => a.id)
      );
    if (measurementsError) {
      console.log("measurementsError:", measurementsError);
      throw new Error(measurementsError.message);
    }

    // Deduplicate measurements by definition ID using a Map
    const uniqueMeasurementsMap = new Map();
    measurements.forEach((m) => {
      if (!uniqueMeasurementsMap.has(m.definition.id)) {
        uniqueMeasurementsMap.set(m.definition.id, {
          id: m.definition.id,
          name: m.definition.name,
          description: m.definition.description,
          unit: m.definition.unit,
        });
      }
    });

    options.measurements = Array.from(uniqueMeasurementsMap.values());

    return { options };
  } else {
    throw new BadRequestError("Invalid assessment type");
  }
}
