import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useSettingsTab } from "@/hooks/questionnaire/useSettings";
import { useRatingScalesTab } from "@/hooks/questionnaire/useRatingScales";
import { useQuestionsTab } from "@/hooks/questionnaire/useQuestions";
import { useQuestionnaireActions } from "@/hooks/useQuestionnaires";
import type {
  QuestionnaireWithStructure,
  QuestionnaireRatingScale,
  SectionWithSteps,
  StepWithQuestions,
  Questionnaire,
  UpdateQuestionnaireData,
} from "@/types/assessment";
import type { QuestionnaireUsage } from "@/hooks/questionnaire/useSettings";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";

interface QuestionnaireDetailContextValue {
  // Questionnaire data
  questionnaire: QuestionnaireWithStructure | undefined;
  sections: SectionWithSteps[];
  ratingScales: QuestionnaireRatingScale[];

  // Loading states
  isLoading: boolean;
  error: Error | null;

  // Processing states
  isProcessing: boolean;
  isUpdating: boolean;
  isDuplicating: boolean;
  isDeleting: boolean;

  // Usage information
  questionnaireUsage: QuestionnaireUsage;

  // Active tab
  activeTab: string;

  // Computed values
  questionCount: number;
  ratingScaleCount: number;

  // Status functions
  getGeneralStatus: () => "complete" | "incomplete";
  getRatingsStatus: () => "complete" | "incomplete";
  getQuestionsStatus: () => "complete" | "incomplete";

  // Actions
  duplicateQuestionnaire: (id: number) => Promise<Questionnaire>;
  deleteQuestionnaire: (id: number) => Promise<void>;
  updateQuestionnaire: (params: {
    id: number;
    updates: UpdateQuestionnaireData;
  }) => Promise<Questionnaire>;
  handleTabChange: (newTab: string) => void;
}

const QuestionnaireDetailContext = createContext<
  QuestionnaireDetailContextValue | undefined
>(undefined);

interface QuestionnaireDetailProviderProps {
  questionnaireId: number;
  children: ReactNode;
}

export function QuestionnaireDetailProvider({
  questionnaireId,
  children,
}: QuestionnaireDetailProviderProps) {
  const [searchParams] = useSearchParams();
  const navigate = useCompanyAwareNavigate();

  // Determine active tab from URL
  const tabParam = searchParams.get("tab");
  const activeTab = ["settings", "rating-scales", "questions"].includes(
    tabParam || ""
  )
    ? tabParam!
    : "settings";

  // Handle tab changes
  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newTab === "settings") {
      params.delete("tab"); // Default tab, no need in URL
    } else {
      params.set("tab", newTab);
    }
    const queryString = params.toString();
    navigate(
      `/questionnaires/${questionnaireId}${
        queryString ? `?${queryString}` : ""
      }`
    );
  };

  // Tab data hooks - preload all tabs since counts are needed for TabSwitcher
  const settingsTab = useSettingsTab(questionnaireId);
  const ratingScalesTab = useRatingScalesTab(questionnaireId, true);
  const questionsTab = useQuestionsTab(questionnaireId, true);

  // Action hooks
  const {
    duplicateQuestionnaire,
    deleteQuestionnaire,
    updateQuestionnaire,
    isUpdating,
    isDuplicating,
    isDeleting,
  } = useQuestionnaireActions();

  // Derived data - prioritize more complete data sources
  const questionnaire =
    questionsTab.questionnaire ||
    (settingsTab.questionnaire as QuestionnaireWithStructure | undefined);
  const sections = questionsTab.sections;
  const ratingScales = ratingScalesTab.ratingScales;

  const isLoading = settingsTab.isLoading;
  const error = (settingsTab.error ||
    questionsTab.error ||
    ratingScalesTab.error) as Error | null;

  const questionnaireUsage: QuestionnaireUsage = settingsTab.usage || {
    isInUse: false,
    assessmentCount: 0,
    interviewCount: 0,
    programCount: 0,
  };

  const isProcessing = isUpdating || isDuplicating || isDeleting;

  // Computed values
  const questionCount = useMemo(() => {
    if (questionsTab.questionCount !== undefined) {
      return questionsTab.questionCount;
    }
    // Fallback calculation
    let count = 0;
    sections.forEach((section: SectionWithSteps) => {
      if (section.steps) {
        section.steps.forEach((step: StepWithQuestions) => {
          if (step.questions) {
            count += step.questions.length;
          }
        });
      }
    });
    return count;
  }, [questionsTab.questionCount, sections]);

  const ratingScaleCount = useMemo(() => {
    return ratingScales.length;
  }, [ratingScales]);

  // Status functions
  const getGeneralStatus = (): "complete" | "incomplete" => {
    if (!questionnaire) return "incomplete";
    const hasRequiredFields =
      questionnaire.name?.trim() && questionnaire.description?.trim();
    return hasRequiredFields ? "complete" : "incomplete";
  };

  const getRatingsStatus = (): "complete" | "incomplete" => {
    if (ratingScales.length > 0) {
      return "complete";
    }
    return "incomplete";
  };

  const getQuestionsStatus = (): "complete" | "incomplete" => {
    if (questionsTab.isComplete !== undefined) {
      return questionsTab.getQuestionsStatus() as "complete" | "incomplete";
    }
    // Fallback
    const hasQuestions = sections.some((section: SectionWithSteps) =>
      section.steps.some(
        (step: StepWithQuestions) => step.questions && step.questions.length > 0
      )
    );
    return hasQuestions ? "complete" : "incomplete";
  };

  const value: QuestionnaireDetailContextValue = {
    // Data
    questionnaire,
    sections,
    ratingScales,

    // Loading states
    isLoading,
    error,

    // Processing states
    isProcessing,
    isUpdating,
    isDuplicating,
    isDeleting,

    // Usage
    questionnaireUsage,

    // Active tab
    activeTab,

    // Computed values
    questionCount,
    ratingScaleCount,

    // Status functions
    getGeneralStatus,
    getRatingsStatus,
    getQuestionsStatus,

    // Actions
    duplicateQuestionnaire,
    deleteQuestionnaire,
    updateQuestionnaire,
    handleTabChange,
  };

  return (
    <QuestionnaireDetailContext.Provider value={value}>
      {children}
    </QuestionnaireDetailContext.Provider>
  );
}

export function useQuestionnaireDetail() {
  const context = useContext(QuestionnaireDetailContext);
  if (context === undefined) {
    throw new Error(
      "useQuestionnaireDetail must be used within a QuestionnaireDetailProvider"
    );
  }
  return context;
}
