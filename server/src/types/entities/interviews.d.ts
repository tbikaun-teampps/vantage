import type { Database } from "../database";

export type Interview = Database["public"]["Tables"]["interviews"]["Row"];

export type InterviewStatus = Database["public"]["Enums"]["interview_statuses"];

export type InterviewBasic = Pick<
  Interview,
  | "id"
  | "questionnaire_id"
  | "name"
  | "notes"
  | "status"
  | "is_individual"
  | "assessment_id"
>;

export interface InterviewWithQuestionnaire {
  interview: InterviewBasic;
  questionnaire: {
    id: number;
    title: string;
    order_index: number;
    steps: {
      id: number;
      title: string;
      order_index: number;
      questions: {
        id: number;
        title: string;
        order_index: number;
      }[];
    }[];
  }[];
  firstQuestionId: number | null;
}

export interface CreateInterviewData {
  assessment_id: number;
  interviewer_id: string | null;
  name: string;
  notes?: string | null;
  is_individual?: boolean;
  enabled?: boolean;
  access_code?: string | null;
  interview_contact_id?: number | null;
  role_ids?: number[];
  interviewee_id: string | null;
  // Program-specific fields (optional)
  program_id?: number | null;
  program_phase_id?: number | null;
  // Allow explicit override of normally-derived fields
  questionnaire_id?: number | null;
  company_id?: string | null;
  created_by?: string | null;
  status?: Database["public"]["Enums"]["interview_statuses"];
}

export type UpdateInterviewData = Pick<
  Database["public"]["Tables"]["interviews"]["Update"],
  "name" | "notes" | "is_individual" | "enabled" | "status"
>;


// TODO: split InterviewQuestion into two types. See responses in getInterviewQuestionById.
export interface InterviewQuestion {
  id: number;
  title: string;
  question_text: string;
  context: string | null;
  breadcrumbs: {
    section: string;
    step: string;
    question: string;
  };
  options?: {
    applicable_roles: Record<
      string,
      {
        id: number;
        shared_role_id: number;
        name: string;
        description: string | null;
        path: string;
      }[]
    >;
    rating_scales: {
      id: number;
      name: string;
      value: number;
      description: string;
    }[];
  };
  question_parts?:
    | {
        id: number;
        text: string;
        order_index: number;
        answer_type:
          | "scale"
          | "percentage"
          | "number"
          | "labelled_scale"
          | "number"
          | "boolean";
        options: Json;
      }[]
    | null;
  response: {
    id: number;
    rating_score: number | null;
    is_unknown: boolean;
    response_roles?: {
      id: number;
      role: {
        id: number;
      };
    }[];
    question_part_responses?: {
      id: number;
      answer_value: string | null;
      question_part_id: number;
    }[];
  } | null;
}

// Type for interview summary response
export interface InterviewSummary {
  id: number;
  name: string;
  status: Database["public"]["Enums"]["interview_statuses"];
  notes: string | null;
  overview: string | null;
  is_individual: boolean;
  due_at: string | null;
  assessment: { id: number | null; name: string } | null;
  interviewer: { full_name: string | null; email: string } | null;
  interviewee: { full_name: string | null; email: string } | null;
  interview_roles: Array<{
    role: {
      id: number;
      shared_role: { name: string } | null;
    } | null;
  }>;
  company?: {
    name: string;
    icon_url: string | null;
    branding: Json | null;
  } | null;
}

export interface InterviewProgress {
  status: InterviewStatus;
  previous_status: InterviewStatus | null;
  total_questions: number;
  answered_questions: number;
  progress_percentage: number;
  responses: Record<
    number,
    {
      id: number;
      rating_score: number | null;
      is_applicable: boolean;
      has_rating_score: boolean;
      has_roles: boolean;
    }
  >;
}

export interface InterviewStructure {
  interview: {
    id: number;
    name: string;
    questionnaire_id: number;
    assessment_id: number | null;
    is_individual: boolean;
  };
  sections: {
    id: number;
    title: string;
    order_index: number;
    steps: {
      id: number;
      title: string;
      order_index: number;
      questions: {
        id: number;
        title: string;
        order_index: number;
      }[];
    }[];
  }[];
}

export type InterviewResponse =
  Database["public"]["Tables"]["interview_responses"]["Row"];

// ===== Interview Response Actions =====

export type InterviewResponseAction =
  Database["public"]["Tables"]["interview_response_actions"]["Row"];

export type UpdateInterviewResponseActionData = Pick<
  Database["public"]["Tables"]["interview_response_actions"]["Update"],
  "title" | "description"
>;

export type CreateInterviewResponseActionData = Pick<
  Database["public"]["Tables"]["interview_response_actions"]["Insert"],
  "title" | "description"
>;

// ===== Interview Evidence =====

export type InterviewEvidence =
  Database["public"]["Tables"]["interview_evidence"]["Row"];

export type CreateInterviewEvidenceBody = Omit<
  InterviewEvidence,
  "id" | "created_at" | "updated_at"
>;

export interface EvidenceUploadResult {
  evidence: InterviewEvidence;
  publicUrl: string;
}
