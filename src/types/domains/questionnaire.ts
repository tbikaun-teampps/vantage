/**
 * Questionnaire Builder and Template Types
 * All types related to questionnaire creation, management, and templates
 */

import type { DatabaseRow } from "../utils";
import type { UserProfile } from "../auth";
import type { Company, Role } from "./company";

// Forward declarations for types from other domains
export interface SharedRole {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

// Database types
export type DatabaseQuestionnaire = DatabaseRow<"questionnaires">;
export type DatabaseQuestionnaireSection =
  DatabaseRow<"questionnaire_sections">;
export type DatabaseQuestionnaireSectionStep =
  DatabaseRow<"questionnaire_steps">;
export type DatabaseQuestionnaireQuestion =
  DatabaseRow<"questionnaire_questions">;
export type DatabaseQuestionnaireQuestionRole =
  DatabaseRow<"questionnaire_question_roles">;
export type DatabaseQuestionnaireRatingScale =
  DatabaseRow<"questionnaire_rating_scales">;
export type DatabaseQuestionnaireQuestionRatingScale =
  DatabaseRow<"questionnaire_question_rating_scales">;

// Enum types - THESE NEED TO BE CREATED
export type QuestionnaireStatus =
  | "draft"
  | "active"
  | "under_review"
  | "archived"; //EnumValues<'questionnaire_status'>

// Core entity types
export interface Questionnaire extends Omit<DatabaseQuestionnaire, "status"> {
  // Relations
  status: QuestionnaireStatus;
  sections?: QuestionnaireSection[];
  created_by_user?: Pick<UserProfile, "id" | "full_name">;
  company?: Pick<Company, "id" | "name">;
  rating_scales?: QuestionnaireRatingScale[];
}

export interface QuestionnaireWithCounts extends Questionnaire {
  section_count: number;
  question_count: number;
  total_steps: number;
  created_by_email: string;
}

export interface QuestionnaireSection extends DatabaseQuestionnaireSection {
  // Relations
  questionnaire?: Pick<Questionnaire, "id" | "name">;
  steps?: QuestionnaireSectionStep[];
}

export interface QuestionnaireSectionWithCounts extends QuestionnaireSection {
  step_count: number;
  question_count: number;
}

export interface QuestionnaireSectionStep
  extends DatabaseQuestionnaireSectionStep {
  // Relations
  // section?: Pick<QuestionnaireSection, "id" | "title">;
  // questions?: QuestionnaireQuestion[];
}

export interface QuestionnaireSectionStepWithCounts
  extends QuestionnaireSectionStep {
  question_count: number;
}

export interface QuestionnaireQuestion extends DatabaseQuestionnaireQuestion {
  // Relations
  step?: Pick<QuestionnaireSectionStep, "id" | "title">;
  roles?: Role[];
  rating_scale?: QuestionnaireQuestionRatingScale;
}

export interface QuestionnaireQuestionWithRoles extends QuestionnaireQuestion {
  roles: Role[];
}

export interface QuestionnaireQuestionRole
  extends DatabaseQuestionnaireQuestionRole {
  // Relations
  question?: Pick<QuestionnaireQuestion, "id" | "title">;
  shared_role?: Pick<SharedRole, "id" | "name" | "description">;
}

export interface QuestionnaireRatingScale
  extends DatabaseQuestionnaireRatingScale {
  // Relations
  created_by_user?: Pick<UserProfile, "id" | "full_name">;
}

export interface QuestionnaireQuestionRatingScale
  extends DatabaseQuestionnaireQuestionRatingScale {}

// Extended UI types
export interface QuestionRatingScaleWithDetails extends QuestionnaireQuestionRatingScale {
  rating_scale: QuestionnaireRatingScale;
}

export interface QuestionWithRatingScales extends QuestionnaireQuestion {
  question_rating_scales: QuestionRatingScaleWithDetails[];
  question_roles?: QuestionnaireQuestionRole[];
}

// Hierarchical structure for questionnaire builder
export interface QuestionnaireHierarchy {
  questionnaire: QuestionnaireWithCounts;
  sections: Array<{
    section: QuestionnaireSectionWithCounts;
    steps: Array<{
      step: QuestionnaireSectionStepWithCounts;
      questions: QuestionnaireQuestionWithRoles[];
    }>;
  }>;
}

// UI state types for questionnaire builder
export interface QuestionnaireBuilderState {
  questionnaire: Questionnaire | null;
  selectedSection: QuestionnaireSection | null;
  selectedStep: QuestionnaireSectionStep | null;
  selectedQuestion: QuestionnaireQuestion | null;
  isEditing: boolean;
  isDirty: boolean;
  validationErrors: ValidationErrors;
}

export interface ValidationErrors {
  questionnaire?: string[];
  sections?: Record<number, string[]>;
  steps?: Record<number, string[]>;
  questions?: Record<number, string[]>;
}

// Form data types
export interface CreateQuestionnaireData {
  name: string;
  description?: string;
  rating_scale_id: number;
  is_template?: boolean;
  template_category?: string;
}

export interface UpdateQuestionnaireData {
  name?: string;
  description?: string;
  status?: QuestionnaireStatus;
  rating_scale_id?: number;
  is_template?: boolean;
  template_category?: string;
}

export interface CreateSectionData {
  questionnaire_id: number;
  title: string;
  description?: string;
  order_index: number;
}

export interface UpdateSectionData {
  title?: string;
  description?: string;
  order_index?: number;
}

export interface CreateStepData {
  section_id: number;
  title: string;
  description?: string;
  order_index: number;
}

export interface UpdateStepData {
  title?: string;
  description?: string;
  order_index?: number;
}

export interface CreateQuestionData {
  step_id: number;
  title: string;
  description?: string;
  order_index: number;
  rating_scale_id?: number;
  is_required?: boolean;
  role_ids?: number[];
}

export interface UpdateQuestionData {
  title?: string;
  description?: string;
  order_index?: number;
  rating_scale_id?: number;
  is_required?: boolean;
  role_ids?: number[];
}

export interface UpdateQuestionRatingScales {
  question_id: number;
  rating_scale_associations: Array<{
    rating_scale_id: number;
    description: string;
  }>;
  created_by?: string;
}

// export interface CreateQuestionRatingScale {

// }

export interface CreateRatingScaleData {
  name: string;
  description?: string;
  min_value: number;
  max_value: number;
  scale_labels: Record<number, string>;
}

export interface UpdateRatingScaleData {
  name?: string;
  description?: string;
  min_value?: number;
  max_value?: number;
  scale_labels?: Record<number, string>;
}

export interface UpdateQuestionRoles {
  question_id: number;
  role_ids: string[];
  created_by: string;
}

// Template types
export interface QuestionnaireTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  preview_image?: string;
  sections: TemplateSectionData[];
  metadata: TemplateMetadata;
}

export interface TemplateSectionData {
  title: string;
  description?: string;
  order_index: number;
  steps: TemplateStepData[];
}

export interface TemplateStepData {
  title: string;
  description?: string;
  order_index: number;
  questions: TemplateQuestionData[];
}

export interface TemplateQuestionData {
  title: string;
  description?: string;
  order_index: number;
  is_required: boolean;
  default_roles?: string[];
}

export interface TemplateMetadata {
  industry?: string;
  use_case?: string;
  estimated_duration?: number;
  difficulty_level?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  version?: string;
  created_by?: string;
  last_updated?: string;
}

export interface QuestionnaireStore {
  // State
  questionnaires: QuestionnaireWithCounts[];
  selectedQuestionnaire: Questionnaire | null;
  roles: Role[];
  sharedRoles: SharedRole[];
  users: User[];
  isLoading: boolean;
  isCreating: boolean;
  isLoadingUsers: boolean;
  error: string | null;

  // Actions
  loadQuestionnaires: () => Promise<void>;
  loadQuestionnaireById: (id: number) => Promise<void>;
  loadRoles: () => Promise<void>;
  loadSharedRoles: () => Promise<void>;
  loadUsers: () => Promise<void>;
  createQuestionnaire: (
    questionnaireData: Omit<Questionnaire, "id" | "created_at" | "updated_at">
  ) => Promise<Questionnaire>;
  updateQuestionnaire: (
    id: number,
    updates: Partial<Questionnaire>
  ) => Promise<void>;
  deleteQuestionnaire: (id: number) => Promise<void>;
  duplicateQuestionnaire: (id: number) => Promise<number>;
  setSelectedQuestionnaire: (questionnaire: Questionnaire | null) => void;
  startCreating: () => void;
  cancelCreating: () => void;

  // Section actions
  createSection: (
    questionnaireId: string,
    title: string
  ) => Promise<QuestionnaireSection>;
  updateSection: (
    id: number,
    updates: Partial<QuestionnaireSection>
  ) => Promise<void>;
  deleteSection: (id: number) => Promise<void>;

  // Step actions
  createStep: (sectionId: string, title: string) => Promise<QuestionnaireSectionStep>;
  updateStep: (
    id: number,
    updates: Partial<QuestionnaireSectionStep>
  ) => Promise<void>;
  deleteStep: (id: number) => Promise<void>;

  // Question actions
  createQuestion: (
    stepId: string,
    title: string,
    additionalFields?: Partial<QuestionnaireQuestion>
  ) => Promise<QuestionnaireQuestion>;
  updateQuestion: (
    id: number,
    updates: Partial<QuestionnaireQuestion>
  ) => Promise<void>;
  deleteQuestion: (id: number) => Promise<void>;
  duplicateQuestion: (id: number) => Promise<void>;
  updateQuestionRatingScales: (
    update: UpdateQuestionRatingScales
  ) => Promise<void>;
  updateQuestionRoles: (questionId: string, sharedRoleIds: string[]) => Promise<void>;

  // Rating scale actions
  createRatingScale: (
    questionnaireId: string,
    ratingData: Omit<
      QuestionnaireRatingScale,
      "id" | "created_at" | "updated_at" | "questionnaire_id"
    >
  ) => Promise<QuestionnaireRatingScale>;
  updateRatingScale: (
    id: number,
    updates: Partial<QuestionnaireRatingScale>
  ) => Promise<void>;
  deleteRatingScale: (id: number) => Promise<void>;

  // Share actions
  shareQuestionnaire: (
    questionnaireId: string,
    targetUserId: string
  ) => Promise<void>;

  // Utility actions
  clearError: () => void;
}
