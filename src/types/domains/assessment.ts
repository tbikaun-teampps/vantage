/**
 * Assessment and Interview Types
 * All types related to assessments, interviews, and their lifecycle
 */

import type { DatabaseRow, EnumValues } from '../utils'

// Database types
export type DatabaseAssessment = DatabaseRow<'assessments'>
export type DatabaseInterview = DatabaseRow<'interviews'>
export type DatabaseInterviewResponse = DatabaseRow<'interview_responses'>
export type DatabaseInterviewResponseAction = DatabaseRow<'interview_response_actions'>
export type DatabaseInterviewResponseRole = DatabaseRow<'interview_response_roles'>
export type DatabaseAssessmentObjective = DatabaseRow<'assessment_objectives'>

// Enum types
export type AssessmentStatus = EnumValues<'assessment_status'>
export type AssessmentType = EnumValues<'assessment_type'>
export type InterviewStatus = EnumValues<'interview_status'>
export type ActionType = EnumValues<'action_type'>
export type ActionPriority = EnumValues<'action_priority'>

// Core entity types
export interface Assessment extends DatabaseAssessment {
  // Relations
  questionnaire?: Pick<Questionnaire, 'id' | 'name' | 'type'>
  company?: Pick<Company, 'id' | 'name'>
  business_unit?: Pick<BusinessUnit, 'id' | 'name'>
  region?: Pick<Region, 'id' | 'name'>
  site?: Pick<Site, 'id' | 'name'>
  asset_group?: Pick<AssetGroup, 'id' | 'name'>
}

export interface AssessmentWithCounts extends Assessment {
  interview_count: number
  completed_interview_count: number
  pending_interview_count: number
  in_progress_interview_count: number
  cancelled_interview_count: number
  total_responses: number
  completion_percentage: number
}

export interface AssessmentWithQuestionnaire extends AssessmentWithCounts {
  questionnaire: Questionnaire
}

export interface Interview extends DatabaseInterview {
  // Relations
  assessment?: Pick<Assessment, 'id' | 'name' | 'status'>
  interviewer?: Pick<UserProfile, 'id' | 'full_name' | 'email'>
  roles?: Role[]
}

export interface InterviewWithResponses extends Interview {
  responses: InterviewResponse[]
  response_count: number
  completion_percentage: number
}

export interface InterviewResponse extends DatabaseInterviewResponse {
  // Relations
  question?: Pick<QuestionnaireQuestion, 'id' | 'title' | 'question_type'>
  interview?: Pick<Interview, 'id' | 'name'>
  roles?: Role[]
  actions?: InterviewResponseAction[]
}

export interface InterviewResponseAction extends DatabaseInterviewResponseAction {
  // Relations
  response?: Pick<InterviewResponse, 'id' | 'rating_score'>
  created_by_user?: Pick<UserProfile, 'id' | 'full_name'>
}

export interface InterviewResponseRole extends DatabaseInterviewResponseRole {
  // Relations
  role?: Pick<Role, 'id' | 'name'>
  response?: Pick<InterviewResponse, 'id' | 'rating_score'>
}

export interface AssessmentObjective extends DatabaseAssessmentObjective {
  // Relations
  assessment?: Pick<Assessment, 'id' | 'name'>
  company?: Pick<Company, 'id' | 'name'>
  created_by_user?: Pick<UserProfile, 'id' | 'full_name'>
}

// Analytics and metrics types
export interface HierarchyMetrics {
  id: number;
  name: string;
  code?: string;
  parent_type?: string;
  metrics: {
    average_score: number;
    completion_rate: number;
    total_responses: number;
    total_possible: number;
    total_interviews: number;
    response_rate_per_interview: number;
    score_distribution: Record<number, number>;
  };
}

export interface QuestionMetrics {
  id: number;
  title: string;
  question_text: string;
  section: string;
  step: string;
  section_order: number;
  step_order: number;
  question_order: number;
  metrics: {
    average_score: number;
    completion_rate: number;
    total_responses: number;
    unique_interviews: number;
    score_distribution: Record<number, number>;
    comments: Array<{
      comment: string;
      score: number;
      interview: string;
    }>;
  };
}

export interface RoleMetrics {
  id: number;
  name: string;
  level?: string;
  metrics: {
    average_score: number;
    completion_rate: number;
    total_responses: number;
    unique_interviews: number;
    score_distribution: Record<number, number>;
    comments: Array<{
      comment: string;
      score: number;
      interview: string;
    }>;
  };
}

export interface SummaryMetrics {
  total_interviews: number;
  completed_interviews: number;
  total_questions: number;
  total_possible_responses: number;
  total_actual_responses: number;
  overall_completion_rate: number;
  overall_average_score: number;
  interviews_completion_rate: number;
}

export interface RawResponseData {
  response_id: number;
  interview_id: number;
  interview_name: string;
  interview_status: string;
  question_id: number;
  question: {
    id: number;
    title: string;
    question_text: string;
    step: string;
    section: string;
    step_order: number;
    section_order: number;
    order_index: number;
  };
  rating_score: number;
  comments: string;
  answered_at: string;
  role: {
    id: number;
    name: string;
    level?: string;
  };
}

export interface AssessmentMetrics {
  assessment: {
    id: number;
    name: string;
    status: string;
    start_date?: string;
    end_date?: string;
  };
  questionnaire: {
    id: number;
    name: string;
    description?: string;
    total_questions: number;
    total_sections: number;
    total_steps: number;
  };
  hierarchy: {
    company?: HierarchyMetrics;
    business_unit?: HierarchyMetrics;
    region?: HierarchyMetrics;
    site?: HierarchyMetrics;
    asset_group?: HierarchyMetrics;
  };
  question_breakdown: Record<string, QuestionMetrics>;
  role_breakdown: Record<string, RoleMetrics>;
  summary: SummaryMetrics;
  raw_responses: RawResponseData[];
  generated_at: string;
}

export interface ScoreDistribution {
  rating: number
  count: number
  percentage: number
}

export interface AssessmentProgress {
  assessment_id: number;
  total_interviews: number;
  completed_interviews: number;
  total_questions: number;
  answered_questions: number;
  average_score: number;
  completion_percentage: number;
}

// Filter types
export interface AssessmentFilters {
  status?: AssessmentStatus[]
  type?: AssessmentType[]
  questionnaire_id?: number
  business_unit_id?: number
  region_id?: number
  site_id?: number
  date_range?: {
    start: string
    end: string
  }
  search?: string
  created_by?: string
}

export interface InterviewFilters {
  status?: InterviewStatus[]
  assessment_id?: number
  interviewer_id?: string
  date_range?: {
    start: string
    end: string
  }
  search?: string
}

// Form data types
export interface CreateAssessmentData {
  name: string
  description?: string
  questionnaire_id: number
  business_unit_id: number
  region_id: number
  site_id: number
  asset_group_id: number
  type: AssessmentType
  start_date?: string
  end_date?: string
}

export interface UpdateAssessmentData {
  name?: string
  description?: string
  status?: AssessmentStatus
  start_date?: string
  end_date?: string
}

export interface CreateInterviewData {
  name: string
  assessment_id: number
  interviewer_id: string
  notes?: string
}

export interface UpdateInterviewData {
  name?: string
  status?: InterviewStatus
  notes?: string
}

export interface CreateInterviewResponseData {
  interview_id: number
  questionnaire_question_id: number
  rating_score: number
  comments?: string
  role_ids?: number[]
}

export interface UpdateInterviewResponseData {
  rating_score?: number
  comments?: string
  role_ids?: number[]
}

export interface CreateResponseActionData {
  interview_response_id: number
  action_type: ActionType
  title: string
  description?: string
  priority: ActionPriority
  due_at?: string
  assigned_to?: string
}

export interface UpdateResponseActionData {
  title?: string
  description?: string
  priority?: ActionPriority
  due_at?: string
  assigned_to?: string
  status?: string
}

export interface CreateAssessmentObjectiveData {
  assessment_id: number
  title: string
  description?: string
}

export interface UpdateAssessmentObjectiveData {
  title?: string
  description?: string
}

// Import related types that will be defined elsewhere
interface Questionnaire {
  id: number
  name: string
  type: string
}

interface QuestionnaireQuestion {
  id: number
  title: string
  question_type: string
}

interface Company {
  id: number
  name: string
}

interface BusinessUnit {
  id: number
  name: string
}

interface Region {
  id: number
  name: string
}

interface Site {
  id: number
  name: string
}

interface AssetGroup {
  id: number
  name: string
}

interface Role {
  id: number
  name: string
}

interface UserProfile {
  id: string
  full_name?: string
  email: string
}