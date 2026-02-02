import { useQuery } from "@tanstack/react-query";
import {
  getQuestionnaireById,
  checkQuestionnaireUsage,
} from "@/lib/api/questionnaires";
import type { GetQuestionnaireByIdResponseData } from "@/types/api/questionnaire";

// Query key factory for settings-specific data
export const settingsKeys = {
  all: ["questionnaire", "settings"] as const,
  basic: (id: number) => [...settingsKeys.all, "basic", id] as const,
  usage: (id: number) => [...settingsKeys.all, "usage", id] as const,
};

// Hook for basic questionnaire information (without heavy structure data)
function useQuestionnaireSettings(id: number) {
  return useQuery({
    queryKey: settingsKeys.basic(id),
    queryFn: async (): Promise<GetQuestionnaireByIdResponseData> => {
      return await getQuestionnaireById(id);
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!id,
  });
}

// Hook for questionnaire usage information
function useQuestionnaireUsage(id: number) {
  return useQuery({
    queryKey: settingsKeys.usage(id),
    queryFn: () => checkQuestionnaireUsage(id),
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
