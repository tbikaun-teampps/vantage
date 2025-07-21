import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a typed Supabase client
export const createTypedClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
};

// Export a singleton instance for use in queries
export const typedSupabase = createTypedClient();

// Export database types for easy access
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Specific table types for analytics
export type Assessment = Tables['assessments']['Row'];
export type Interview = Tables['interviews']['Row'];
export type InterviewResponse = Tables['interview_responses']['Row'];
export type InterviewResponseAction = Tables['interview_response_actions']['Row'];
export type Company = Tables['companies']['Row'];
export type QuestionnaireQuestion = Tables['questionnaire_questions']['Row'];
export type QuestionnaireSections = Tables['questionnaire_sections']['Row'];
export type QuestionnaireSteps = Tables['questionnaire_steps']['Row'];