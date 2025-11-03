import type { WorkGroup, AssetGroup } from "./company";
import type { DatabaseRow, CreateInput, UpdateInput, Enums } from "./utils";

export type AssessmentTypeEnum = Enums["assessment_types"];
export type AssessmentStatusEnum = Enums["assessment_statuses"];
export type InterviewStatusEnum = Enums["interview_statuses"];
export type RoleLevelEnum = Enums["role_levels"];
export type QuestionnaireStatusEnum = Enums["questionnaire_statuses"];

export type UserProfile = DatabaseRow<"profiles">;

export type Feedback = DatabaseRow<"feedback">;

export type Assessment = DatabaseRow<"assessments">;
export type Interview = DatabaseRow<"interviews">;
export type InterviewResponse = DatabaseRow<"interview_responses">;
export type InterviewResponseRole = DatabaseRow<"interview_response_roles">;
export type InterviewResponseAction = DatabaseRow<"interview_response_actions">;
export type SharedRole = DatabaseRow<"shared_roles">;
export type AssessmentObjective = DatabaseRow<"assessment_objectives">;
export interface Role extends DatabaseRow<"roles"> {
  // Computed/UI-only fields (keep these):
  shared_role?: SharedRole;
  work_group?: WorkGroup & {
    asset_group?: Pick<AssetGroup, "id" | "name">;
  };
}

export type QuestionnaireRatingScale =
  DatabaseRow<"questionnaire_rating_scales">;
export type Questionnaire = DatabaseRow<"questionnaires">;

export interface QuestionnaireQuestion
  extends DatabaseRow<"questionnaire_questions"> {
  // Computed/UI-only fields:
  rating_scales: QuestionnaireRatingScale[];
}

export interface QuestionnaireStep extends DatabaseRow<"questionnaire_steps"> {
  // Computed/UI-only fields:
  questions: QuestionnaireQuestion[];
}

export interface QuestionnaireSection
  extends DatabaseRow<"questionnaire_sections"> {
  // Computed/UI-only fields:
  steps: QuestionnaireStep[];
}

export type QuestionnaireQuestionRatingScale =
  DatabaseRow<"questionnaire_question_rating_scales">;

export type QuestionnaireQuestionRole =
  DatabaseRow<"questionnaire_question_roles">;

// Assessment-specific extended types
export interface AssessmentWithCounts extends Assessment {
  interview_count: number;
  completed_interview_count: number;
  total_responses: number;
  questionnaire_name: string;
  questionnaire: {
    name: string;
  };
}

export interface AssessmentWithQuestionnaire extends Assessment {
  questionnaire: {
    id: number;
    name: string;
    description?: string;
    sections: QuestionnaireSection[];
  };
  objectives?: AssessmentObjective[];
}

export interface DesktopAssessment extends Assessment {
  objectives?: AssessmentObjective[];
  location?: {
    business_unit?: { id: number; name: string };
    region?: { id: number; name: string };
    site?: { id: number; name: string };
    asset_group?: { id: number; name: string };
    work_group?: { id: number; name: string };
    role?: { id: number; name: string };
  };
}

// Interview-specific extended types

export interface InterviewResponseWithDetails extends InterviewResponse {
  question: QuestionnaireQuestion;
  response_roles: Role[];
  actions: InterviewResponseAction[];
}
export interface InterviewWithDetails extends Interview {
  average_score: number;
  completion_rate: number;
  max_rating_value: number;
  min_rating_value: number;
  interviewee: {
    id?: number;
    full_name?: string;
    email: string | null;
    title?: string;
    phone?: string;
    role: string | null;
  };
}

export interface InterviewX extends Interview {
  assessment: { id: number; name: string; type: AssessmentTypeEnum };
  interviewee: {
    id?: number;
    full_name?: string;
    email: string | null;
    title?: string;
    phone?: string;
    role: string | null;
  };
  interviewer: {
    id: string | null;
    name: string | null;
  };
  interview_contact?: {
    id: number;
    full_name: string;
    email: string;
    title?: string | null;
    phone?: string | null;
  };
  interview_roles?: Array<{
    role?: {
      id: number;
      shared_role?: { id: number; name: string };
      work_group?: { id: number; name: string };
    };
  }>;
  interview_responses: InterviewResponseWithDetails[];
}

export interface InterviewXWithResponses extends InterviewX {
  responses: InterviewResponseWithDetails[];
  interview_roles?: Array<{
    role?: {
      id: number;
      shared_role?: { id: number; name: string };
      work_group?: { id: number; name: string };
    };
  }>;
}

export interface InterviewWithResponses extends InterviewWithDetails {
  responses: InterviewResponseWithDetails[];
  interviewer: {
    id: string | null;
    name: string | null;
  };
  assessment: {
    id: number;
    name?: string;
    type?: "onsite" | "desktop";
  };
  program: {
    id: number | null;
    name: string | null;
    program_phase_id: number | null;
    program_phase_name: string | null;
  };
}

export interface InterviewProgress {
  interview_id: number;
  total_questions: number;
  answered_questions: number;
  completion_percentage: number;
  current_step?: string;
  current_section?: string;
  next_question_id?: string;
}

export interface InterviewSession {
  interview: InterviewWithResponses;
  progress: InterviewProgress;
  current_question?: QuestionnaireQuestion;
  questionnaire_structure: QuestionnaireSection[];
}

// Analytics-specific types

export interface ScoreDistribution {
  score_range: string;
  count: number;
  percentage: number;
}

export interface QuestionAnalytics {
  question_id: number;
  question_title: string;
  average_score: number;
  response_count: number;
  score_variance: number;
}

export interface RoleAnalytics {
  role_id: number;
  role_name: string;
  average_score: number;
  response_count: number;
}

export interface InterviewerAnalytics {
  interviewer_id: string;
  interviewer_name: string;
  interviews_completed: number;
  average_completion_time: number;
}

export interface AssessmentAnalytics {
  assessment_id: number;
  score_distribution: ScoreDistribution[];
  question_analytics: QuestionAnalytics[];
  role_analytics: RoleAnalytics[];
  interviewer_analytics: InterviewerAnalytics[];
  generated_at: string;
}

export interface TrendData {
  period: string;
  average_score: number;
  completion_rate: number;
  interview_count: number;
}

export interface ComparisonData {
  assessment_id: number;
  assessment_name: string;
  average_score: number;
  completion_rate: number;
  interview_count: number;
}

// Data transfer objects

// Database CRUD types (using database Insert/Update types)
export interface CreateAssessmentData extends CreateInput<"assessments"> {
  // UI-only fields (not in database):
  objectives?: AssessmentObjective[];
}

export type AssessmentFormData = Partial<
  Pick<
    CreateAssessmentData,
    | "business_unit_id"
    | "region_id"
    | "site_id"
    | "asset_group_id"
    | "questionnaire_id"
  >
> &
  Omit<
    CreateAssessmentData,
    | "business_unit_id"
    | "region_id"
    | "site_id"
    | "asset_group_id"
    | "questionnaire_id"
    | "company_id"
    | "created_by"
  >;

export interface CreateInterviewResponseData
  extends CreateInput<"interview_responses"> {
  // UI-only fields (not in database):
  role_ids?: number[]; // Changed from string[] to number[]
}

export interface UpdateInterviewResponseData
  extends UpdateInput<"interview_responses"> {
  // UI-only fields (not in database):
  role_ids?: number[]; // Changed from string[] to number[]
}

// Filter and search types
export interface AssessmentFilters {
  type?: "onsite" | "desktop";
  status?: Assessment["status"][];
  questionnaire_id?: number;
  created_by?: string;
  company_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface InterviewFilters {
  assessmentId?: number;
  status?: Interview["status"][];
  programId?: number;
  programPhaseId?: number | null;
  questionnaireId?: number | null;
}

// Extended types for UI
export interface QuestionRatingScaleWithDetails
  extends QuestionnaireQuestionRatingScale {
  rating_scale: QuestionnaireRatingScale;
}

export interface QuestionWithRoles extends QuestionnaireQuestionRole {
  role: SharedRole;
}

export interface QuestionWithRatingScales extends QuestionnaireQuestion {
  question_rating_scales: QuestionRatingScaleWithDetails[];
  question_roles?: QuestionWithRoles[];
  question_parts?: Array<{
    id: number;
    text: string;
    order_index: number;
    answer_type: string;
  }>;
}

export interface StepWithQuestions extends QuestionnaireStep {
  questions: QuestionWithRatingScales[];
}

export interface SectionWithSteps extends QuestionnaireSection {
  steps: StepWithQuestions[];
}

export interface QuestionnaireWithStructure extends Questionnaire {
  sections: SectionWithSteps[];
  rating_scales: QuestionnaireRatingScale[];
}

export interface QuestionnaireWithCounts extends Questionnaire {
  section_count: number;
  question_count: number;
}

export interface CreateInterviewData
  extends Omit<CreateInput<"interviews">, "company_id"> {
  role_ids?: number[];
  company_id?: string; // Optional since service sets it automatically
}
export type UpdateInterviewData = UpdateInput<"interviews">;

export type CreateInterviewResponseActionData =
  CreateInput<"interview_response_actions">;
export type UpdateInterviewResponseActionData =
  UpdateInput<"interview_response_actions">;

export type CreateQuestionnaireData = CreateInput<"questionnaires">;
export type UpdateQuestionnaireData = UpdateInput<"questionnaires">;

export type CreateQuestionnaireSectionData = Omit<
  CreateInput<"questionnaire_sections">,
  "company_id" | "order_index" | "expanded"
>;
export type UpdateQuestionnaireSectionData =
  UpdateInput<"questionnaire_sections">;

export type CreateQuestionnaireStepData = Omit<
  CreateInput<"questionnaire_steps">,
  "company_id" | "order_index" | "expanded" | "questionnaire_id"
>;
export type UpdateQuestionnaireStepData = UpdateInput<"questionnaire_steps">;

export type CreateQuestionnaireQuestionData = Omit<
  CreateInput<"questionnaire_questions">,
  "company_id" | "order_index" | "expanded" | "questionnaire_id"
>;
export type UpdateQuestionnaireQuestionData =
  UpdateInput<"questionnaire_questions">;

export type CreateQuestionnaireRatingScaleData = Omit<
  CreateInput<"questionnaire_rating_scales">,
  "questionnaire_id" | "company_id" | "order_index"
>;
export type UpdateQuestionnaireRatingScaleData =
  UpdateInput<"questionnaire_rating_scales">;

export type CreateQuestionnaireQuestionRatingScaleData =
  CreateInput<"questionnaire_question_rating_scales">;
export type UpdateQuestionnaireQuestionRatingScaleData =
  UpdateInput<"questionnaire_question_rating_scales">;

export type CreateQuestionnaireQuestionRoleData =
  CreateInput<"questionnaire_question_roles">;
export type UpdateQuestionnaireQuestionRoleData =
  UpdateInput<"questionnaire_question_roles">;

export type CreateSharedRoleData = CreateInput<"shared_roles">;
export type UpdateSharedRoleData = UpdateInput<"shared_roles">;

export interface AssessmentProgress {
  assessment_id: number;
  total_interviews: number;
  completed_interviews: number;
  total_questions: number;
  answered_questions: number;
  average_score: number;
  completion_percentage: number;
}

export interface QuestionnaireWithSections extends Questionnaire {
  sections: SectionWithSteps[];
}

export interface AssessmentWithQuestionnaire extends Assessment {}
