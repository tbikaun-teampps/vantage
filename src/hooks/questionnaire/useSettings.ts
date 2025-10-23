import { useQuery } from "@tanstack/react-query";
import { getQuestionnaireById, checkQuestionnaireUsage } from "@/lib/api/questionnaires";

// Query key factory for settings-specific data
export const settingsKeys = {
  all: ["questionnaire", "settings"] as const,
  basic: (id: number) => [...settingsKeys.all, "basic", id] as const,
  usage: (id: number) => [...settingsKeys.all, "usage", id] as const,
};

export interface QuestionnaireBasic {
  id: number;
  name: string;
  description: string;
  guidelines: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_deleted: boolean;
  deleted_at: string | null;
}

export interface QuestionnaireUsage {
  isInUse: boolean;
  assessmentCount: number;
  interviewCount: number;
  programCount: number;
  assessments?: unknown[];
  programs?: unknown[];
}

// Hook for basic questionnaire information (without heavy structure data)
export function useQuestionnaireSettings(id: number) {
  return useQuery({
    queryKey: settingsKeys.basic(id),
    queryFn: async (): Promise<QuestionnaireBasic> => {
      // We still need to call the full endpoint, but we only use the basic fields
      // In the future, we could create a lighter endpoint on the server
      const data = await getQuestionnaireById(id);

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        guidelines: data.guidelines,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
        created_by: data.created_by,
        is_deleted: data.is_deleted,
        deleted_at: data.deleted_at || null,
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!id,
  });
}

// Hook for questionnaire usage information
function useQuestionnaireUsage(id: number) {
  return useQuery({
    queryKey: settingsKeys.usage(id),
    queryFn: (): Promise<QuestionnaireUsage> => checkQuestionnaireUsage(id),
    staleTime: 30 * 1000, // 30 seconds - usage data changes more frequently
    enabled: !!id,
  });
}

// Combined hook for settings tab
export function useSettingsTab(id: number) {
  const settingsQuery = useQuestionnaireSettings(id);
  const usageQuery = useQuestionnaireUsage(id);

  return {
    // Settings data
    questionnaire: settingsQuery.data,
    isLoadingSettings: settingsQuery.isLoading,
    settingsError: settingsQuery.error,

    // Usage data
    usage: usageQuery.data,
    isLoadingUsage: usageQuery.isLoading,
    usageError: usageQuery.error,

    // Combined states
    isLoading: settingsQuery.isLoading || usageQuery.isLoading,
    error: settingsQuery.error || usageQuery.error,
  };
}