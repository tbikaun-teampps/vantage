import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

type InterviewStatus = Database["public"]["Enums"]["interview_statuses"];
type AssessmentStatus = Database["public"]["Enums"]["assessment_statuses"];
type ProgramStatus = Database["public"]["Enums"]["program_statuses"];

export interface ActivityData {
  total: number;
  breakdown: Record<string, number>;
  items: Array<{
    id: number;
    status: string;
    created_at: string;
    updated_at: string;
    name: string;
  }>;
}

export interface MetricData {
  title: string;
  metricType: string;
  value?: number | string;
  phaseBadge?: {
    text: string;
    color?: string;
    borderColor?: string;
  };
  badges?: Array<{
    text: string;
    color?: string;
    borderColor?: string;
    icon?: string;
  }>;
  secondaryMetrics?: Array<{
    value: number | string;
    label: string;
    icon?: string;
  }>;
  subtitle?: string;
  description?: string;
  trend?: number;
  status?: "up" | "down" | "neutral";
}

export interface ConfigOptions {
  assessments: Array<{
    id: number;
    name: string;
    status: string;
  }>;
  programs: Array<{
    id: number;
    name: string;
    status: string;
  }>;
  interviews: Array<{
    id: number;
    name: string;
    status: string;
  }>;
}

const STATUS_MAPS = {
  interviews: [
    "pending",
    "in_progress",
    "completed",
    "cancelled",
  ] as InterviewStatus[],
  assessments: [
    "draft",
    "active",
    "under_review",
    "completed",
    "archived",
  ] as AssessmentStatus[],
  programs: [
    "draft",
    "active",
    "under_review",
    "completed",
    "archived",
  ] as ProgramStatus[],
} as const;

export class WidgetService {
  private supabase: SupabaseClient<Database>;
  private companyId: string;

  constructor(companyId: string, supabaseClient: SupabaseClient<Database>) {
    this.companyId = companyId;
    this.supabase = supabaseClient;
  }

  /**
   * Get activity data for a given entity type (interviews, assessments, programs)
   */
  async getActivityData(
    entityType: "interviews" | "assessments" | "programs"
  ): Promise<ActivityData> {
    const validEntityTypes = ["interviews", "assessments", "programs"] as const;
    if (!validEntityTypes.includes(entityType)) {
      throw new Error(`Unsupported entity type: ${entityType}`);
    }

    const allStatuses = STATUS_MAPS[entityType];

    const { data, error } = await this.supabase
      .from(entityType)
      .select("id, status, created_at, updated_at, name")
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Initialise breakdown with all statuses set to 0
    const breakdown = allStatuses.reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<string, number>
    );

    if (!data || data.length === 0) {
      return { total: 0, breakdown, items: [] };
    }

    // Count actual data
    data.forEach((item) => {
      if (
        item.status &&
        Object.prototype.hasOwnProperty.call(breakdown, item.status)
      ) {
        breakdown[item.status]++;
      }
    });

    return { total: data?.length || 0, breakdown, items: data || [] };
  }

  async getMetricData(
    metricType:
      | "generated-actions"
      | "generated-recommendations"
      | "worst-performing-domain"
      | "high-risk-areas"
      | "assessment-activity",
    title?: string
  ): Promise<MetricData> {
    switch (metricType) {
      case "generated-actions": {
        const { data, error } = await this.supabase
          .from("interview_response_actions")
          .select("id", { count: "exact" })
          .eq("company_id", this.companyId)
          .eq("is_deleted", false);

        if (error) throw error;

        // Calculate actions from last week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: recentActions, error: recentError } = await this.supabase
          .from("interview_response_actions")
          .select("id, created_at")
          .eq("company_id", this.companyId)
          .eq("is_deleted", false)
          .gte("created_at", oneWeekAgo.toISOString());

        if (recentError) throw recentError;

        return {
          title: title || "Generated Actions",
          metricType: "generated-actions",
          value: data?.length || 0,
          phaseBadge: {
            text: "improve",
            color: "#FF006E",
            borderColor: "#FF006E",
          },
          badges: [
            {
              text: `${recentActions?.length || 0} This Week`,
              color: "#9D4EDD",
              borderColor: "#9D4EDD",
            },
          ],
          subtitle: "Actions identified from interview responses",
        };
      }

      case "generated-recommendations": {
        // Placeholder - recommendations table may not exist yet
        return {
          title: title || "Generated Recommendations",
          metricType: "generated-recommendations",
          value: 0,
        };
      }

      case "worst-performing-domain": {
        return {
          title: title || "Worst Performing Domain",
          metricType: "worst-performing-domain",
          value: "-",
        };
      }

      case "high-risk-areas": {
        return {
          title: title || "High Risk Areas",
          metricType: "high-risk-areas",
          value: "-",
        };
      }

      case "assessment-activity": {
        const { data, error } = await this.supabase
          .from("assessments")
          .select("id", { count: "exact" })
          .eq("company_id", this.companyId)
          .eq("is_deleted", false);

        if (error) throw error;

        return {
          title: title || "Assessment Activity",
          metricType: "assessment-activity",
          value: data?.length || 0,
          subtitle: "Total assessments",
        };
      }

      default:
        throw new Error(`Unsupported metric type: ${metricType}`);
    }
  }

  async getConfigOptions(): Promise<ConfigOptions> {
    // Fetch assessments
    const { data: assessments, error: assessmentsError } = await this.supabase
      .from("assessments")
      .select("id, name, status")
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
    // .in("status", ["active", "under_review", "completed"])

    if (assessmentsError) throw assessmentsError;

    // Fetch programs
    const { data: programs, error: programsError } = await this.supabase
      .from("programs")
      .select("id, name, status")
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });
    // .in("status", ["active", "under_review", "completed"])

    if (programsError) throw programsError;

    // Fetch interviews
    const { data: interviews, error: interviewsError } = await this.supabase
      .from("interviews")
      .select("id, name, status")
      .eq("company_id", this.companyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(50); // Limit to recent interviews to avoid overwhelming the UI
    // .in("status", ["pending", "in_progress", "completed"])

    if (interviewsError) throw interviewsError;

    return {
      assessments: assessments || [],
      programs: programs || [],
      interviews: interviews || [],
    };
  }

  async getTableData(
    entityType: "actions" | "recommendations" | "comments",
    assessmentId?: number,
    programId?: number
  ): Promise<{
    rows: Array<Record<string, string | number>>;
    columns: Array<{ key: string; label: string }>;
    scope?: {
      assessmentName?: string;
      programName?: string;
    };
  }> {
    switch (entityType) {
      case "actions": {
        let query = this.supabase
          .from("interview_response_actions")
          .select(
            "*, interview:interview_id!inner(id, name, assessment:assessment_id(id, name)), response:interview_response_id(id, question:questionnaire_question_id(id, question_text))"
          )
          .eq("company_id", this.companyId)
          .eq("is_deleted", false);

        // Apply assessment scope filter if provided
        if (assessmentId) {
          query = query.eq("interview.assessment_id", assessmentId);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;

        const columns = [
          { key: "title", label: "Title" },
          { key: "description", label: "Description" },
          { key: "question", label: "Question" },
          { key: "interview", label: "Interview" },
          { key: "assessment", label: "Assessment" },
          {
            key: "createdAt",
            label: "Created At",
          },
        ];
        const rows =
          data?.map((item) => ({
            id: item.id,
            interview: item.interview?.name || "-",
            assessment: item.interview?.assessment?.name || "-",
            question: item.response?.question?.question_text || "-",
            title: item.title || "-",
            description: item.description || "-",
            createdAt: new Date(item.created_at).toLocaleDateString(),
          })) || [];

        let scope = undefined;
        if (assessmentId) {
          const { data: assessmentData } = await this.supabase
            .from("assessments")
            .select("name")
            .eq("id", assessmentId)
            .single();

          if (assessmentData) {
            scope = { assessmentName: assessmentData.name };
          }
        }

        return { columns, rows, scope };
      }
      case "recommendations": {
        let query = this.supabase
          .from("recommendations")
          .select("*")
          .eq("company_id", this.companyId)
          .eq("is_deleted", false);

        // Apply program scope filter if provided
        // Note: Recommendations are linked to programs, not assessments directly
        if (programId) {
          query = query.eq("program_id", programId);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;

        const cols = [
          {
            key: "content",
            label: "Content",
          },
          {
            key: "context",
            label: "Context",
          },
          {
            key: "title",
            label: "Title",
          },
          {
            key: "priority",
            label: "Priority",
          },
          {
            key: "status",
            label: "Status",
          },
        ];

        const rows =
          data?.map((item) => ({
            id: item.id,
            content: item.content,
            context: item.context,
            title: item.title,
            priority: item.priority,
            status: item.status,
          })) || [];

        let scope = undefined;
        if (programId) {
          const { data: programData } = await this.supabase
            .from("programs")
            .select("name")
            .eq("id", programId)
            .single();

          if (programData) {
            scope = { programName: programData.name };
          }
        }

        return { columns: cols, rows, scope };
      }
      case "comments": {
        let query = this.supabase
          .from("interview_responses")
          .select(
            "*, interview:interview_id!inner(id, name, assessment:assessment_id(id, name)), question:questionnaire_question_id(id, question_text)"
          )
          .eq("company_id", this.companyId)
          .neq("comments", null)
          .neq("comments", "")
          .eq("is_deleted", false);

        // Apply assessment scope filter if provided
        if (assessmentId) {
          query = query.eq("interview.assessment_id", assessmentId);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;

        const cols = [
          {
            key: "comments",
            label: "Comments",
          },
          { key: "question", label: "Question" },
          { key: "interview", label: "Interview" },
          { key: "assessment", label: "Assessment" },
        ];

        const rows =
          data?.map((item) => ({
            id: item.id,
            comments: item.comments || "-",
            question: item.question?.question_text || "N/A",
            interview: item.interview?.name || "N/A",
            assessment: item.interview?.assessment?.name || "N/A",
          })) || [];

        let scope = undefined;
        if (assessmentId) {
          const { data: assessmentData } = await this.supabase
            .from("assessments")
            .select("name")
            .eq("id", assessmentId)
            .single();

          if (assessmentData) {
            scope = { assessmentName: assessmentData.name };
          }
        }

        return { columns: cols, rows, scope };
      }
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }

  async getActionsData(): Promise<string[]> {
    // Placeholder implementation - return mock data for now
    return ["hello", "world"];
  }
}
