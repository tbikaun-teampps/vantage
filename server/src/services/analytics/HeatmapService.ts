import { SupabaseClient } from "@supabase/supabase-js";
import {
  DesktopHeatmapAxisType,
  FlattenedOverallHeatmapData,
  HeatmapAxisType,
  HeatmapCompanyAxisType,
  HeatmapMetric,
  HeatmapMetricResult,
  OverallDesktopHeatmapFilters,
  OverallOnsiteHeatmapFilters,
  RawOverallHeatmapData,
} from "../../types/entities/analytics";
import { BadRequestError, NotFoundError } from "../../plugins/errorHandler";
import { Database } from "../../types/database";
import { RoleLevel } from "../../types/entities/companies";
import {
  InterviewResponseData,
  ProgramInterviewHeatmapDataPoint,
} from "../../types/analytics";

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
        // metadata: object;
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
          // metadata: aggregationValue.metadata,
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
        xAxis: this.xAxis as HeatmapCompanyAxisType,
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
        xAxis: this.xAxis as HeatmapAxisType,
        yAxis: this.yAxis as HeatmapAxisType,
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
          // metadata: metricValue.metadata,
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
): Promise<OverallOnsiteHeatmapFilters | OverallDesktopHeatmapFilters> {
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

export async function getProgramInterviewsHeatmap(
  supabaseClient: SupabaseClient<Database>,
  programId: number,
  questionnaireType: "presite" | "onsite"
) {
  const { data: program, error: programError } = await supabaseClient
    .from("programs")
    .select("*, phases:program_phases(*)")
    .eq("id", programId)
    .single();

  if (programError || !program) {
    throw new NotFoundError("Program not found");
  }

  if (!program.presite_questionnaire_id && questionnaireType === "presite") {
    throw new NotFoundError(
      "Program does not have a presite questionnaire configured"
    );
  }
  if (!program.onsite_questionnaire_id && questionnaireType === "onsite") {
    throw new NotFoundError(
      "Program does not have an onsite questionnaire configured"
    );
  }

  // Get questionnaire ID based on type
  const questionnaireId =
    questionnaireType === "presite"
      ? program.presite_questionnaire_id
      : program.onsite_questionnaire_id;

  if (!questionnaireId) {
    throw new NotFoundError(
      "Questionnaire ID not found for the specified type"
    );
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
    return {
      data: [],
      transitions: [],
      sections: [],
      metadata: {
        totalResponses: 0,
        totalInterviews: 0,
      },
    };
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
    data,
    transitions,
    sections,
    metadata: {
      totalResponses: responses.length,
      totalInterviews: new Set(responses.map((r) => r.interview_id)).size,
    },
  };
}

export async function getProgramMeasurementsHeatmap(
  supabaseClient: SupabaseClient<Database>,
  programId: number
) {
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
        fromPhase: currentPhase.name || `Phase ${currentPhase.sequence_number}`,
        toPhase: nextPhase.name || `Phase ${nextPhase.sequence_number}`,
      });
    });
  }

  return { data, measurements, transitions };
}
