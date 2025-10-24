import { Database } from "../database";
import { InterviewResponseAction } from "./interviews";
import { CreatedBy } from "./profiles";

export interface AssessmentFilters {
  status?: Database["public"]["Enums"]["assessment_statuses"][];
  type?: Database["public"]["Enums"]["assessment_types"];
  company_id?: number;
  search?: string;
}

export interface AssessmentObjective {
  title: string;
  description?: string | null;
}

export type AssessmentStatus = Database["public"]["Enums"]["assessment_statuses"];

export interface CreateAssessmentData {
  name: string;
  description?: string | null;
  questionnaire_id: number;
  company_id: string;
  business_unit_id?: number | null;
  region_id?: number | null;
  site_id?: number | null;
  asset_group_id?: number | null;
  type: Database["public"]["Enums"]["assessment_types"];
  objectives?: AssessmentObjective[];
}

export type UpdateAssessmentData = Pick<
  Database["public"]["Tables"]["assessments"]["Update"],
  | "name"
  | "description"
  | "status"
  | "business_unit_id"
  | "region_id"
  | "site_id"
  | "asset_group_id"
>;

export type Assessment = Database["public"]["Tables"]["assessments"]["Row"];
export type Questionnaire =
  Database["public"]["Tables"]["questionnaires"]["Row"];

export interface AssessmentWithCounts extends Assessment {
  interview_count: number;
  completed_interview_count: number;
  total_responses: number;
  questionnaire_name: string;
}

interface QuestionnaireSection {
  id: number;
  title: string;
  order_index: number;
  step_count: number;
  question_count: number;
  steps: QuestionnaireStep[];
}

interface QuestionnaireStep {
  id: number;
  title: string;
  order_index: number;
  question_count: number;
  questions: QuestionnaireQuestion[];
}

interface QuestionnaireQuestion {
  id: number;
  title: string;
  question_text: string;
  context: string | null;
  order_index: number;
}

interface TransformedQuestionnaire extends Questionnaire {
  sections: QuestionnaireSection[];
  section_count: number;
  step_count: number;
  question_count: number;
}

export interface AssessmentWithQuestionnaire
  extends Omit<
    Assessment,
    | "business_unit_id"
    | "region_id"
    | "site_id"
    | "asset_group_id"
    | "work_group_id"
    | "role_id"
    | "started_at"
    | "completed_at"
    | "scheduled_at"
  > {
  questionnaire?: TransformedQuestionnaire;
  objectives: AssessmentObjective[];
  location: {
    business_unit: { id: number; name: string } | null;
    region: { id: number; name: string } | null;
    site: { id: number; name: string } | null;
    asset_group: { id: number; name: string } | null;
  };
}

//   ===== Assessment Measurements =====

type CalculatedMeasurement =
  Database["public"]["Tables"]["measurements_calculated"]["Row"];

export interface CalculatedMeasurementWithLocation
  extends CalculatedMeasurement {
  business_unit: { name: string } | null;
  region: { name: string } | null;
  site: { name: string } | null;
  asset_group: { name: string } | null;
  work_group: { name: string } | null;
  role: { name: string } | null;
}

export interface CalculatedMeasurementWithDefinition
  extends CalculatedMeasurement {
  measurement_definition: {
    id: number;
    name: string;
    description: string | null;
    calculation_type: string | null;
    required_csv_columns: Database["public"]["Tables"]["measurement_definitions"]["Row"]["required_csv_columns"];
    provider: string | null;
  } | null;
}

// ===== Assessment Actions =====

export interface AssessmentAction
  extends Pick<
    InterviewResponseAction,
    | "id"
    | "title"
    | "description"
    | "created_at"
    | "updated_at"
    | "interview_id"
  > {
  rating_score: number | null;
  question_id: number;
  interview_name: string;
  question_title: string;
  created_by: CreatedBy | null;
}

// ===== Assessment Comments =====

export interface AssessmentComment
  extends Pick<
    Database["public"]["Tables"]["interview_responses"]["Row"],
    | "id"
    | "comments"
    | "answered_at"
    | "created_at"
    | "updated_at"
    | "interview_id"
  > {
  interview_name: string;
  question_id: number;
  question_title: string;
  domain_name: string;
  subdomain_name: string | null;
  created_by: CreatedBy | null;
}

// ===== Assessment Interviews =====

export interface AssessmentInterview
  extends Omit<
    Database["public"]["Tables"]["interviews"]["Row"],
    "id" | "name" | "status" | "created_at" | "updated_at" | "is_deleted"
  > {
  assessment: Pick<Assessment, "id" | "name" | "type" | "company_id">;
  completion_rate: number;
  average_score: number | null;
  min_rating_value: number | null;
  max_rating_value: number | null;
  interviewer: CreatedBy | null;
  interviewee: (CreatedBy & { role: string }) | null;
}
