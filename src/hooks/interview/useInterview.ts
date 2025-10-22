import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useInterviewActions } from "@/hooks/interview/useInterviewActions";
import { useInterviewSummary } from "./useInterviewSummary";
import { useCompanyAwareNavigate } from "../useCompanyAwareNavigate";
import { useInterviewStructure } from "./useInterviewStructure";
interface DialogState {
  showComplete: boolean;
  showSettings: boolean;
  showExit: boolean;
}

export function useInterview(interviewId: number, isPublic: boolean = false) {
  const navigate = useCompanyAwareNavigate();
  const [searchParams] = useSearchParams();

  const { data: interviewData, isLoading: isLoadingInterview } =
    useInterviewSummary(interviewId);
  const { data: questionnaireStructure, isLoading: isLoadingStructure } =
    useInterviewStructure(interviewId);
  const { updateInterview, deleteInterview } = useInterviewActions();

  // Local UI state
  const [dialogs, setDialogs] = useState<DialogState>({
    showComplete: false,
    showSettings: false,
    showExit: false,
  });

  const isLoading = isLoadingInterview || isLoadingStructure;
  const isReady = !isLoading && !!questionnaireStructure && !!interviewData;

  // Get stable questions from questionnaire structure (not from responses)
  const allQuestions = useMemo(() => {
    if (!questionnaireStructure?.sections || !interviewData?.responses)
      return [];

    // Extract all questions from the stable questionnaire structure
    const questions = [];
    for (const section of questionnaireStructure.sections) {
      for (const step of section.steps) {
        for (const question of step.questions) {
          // Only include applicable questions that have responses in the interview
          const hasResponse = interviewData.responses.some(
            (response) =>
              response.questionnaire_question_id === question.id &&
              response.is_applicable !== false
          );
          if (hasResponse) {
            questions.push(question);
          }
        }
      }
    }

    return questions;
  }, [questionnaireStructure?.sections, interviewData?.responses]);

  const totalQuestions = allQuestions.length;

  // Count answered questions based on interview data
  const answeredQuestions = useMemo(() => {
    if (!interviewData?.responses || !allQuestions.length) return 0;

    return interviewData.responses.filter((response) => {
      // Only count applicable responses
      if (response.is_applicable === false) {
        return false;
      }

      // Must have rating_score
      const hasRating =
        response.rating_score !== null && response.rating_score !== undefined;

      if (isPublic) {
        // For public interviews, only check rating_score
        return hasRating;
      } else {
        // For private interviews, must have both rating_score AND at least one role
        const hasRoles =
          response.response_roles && response.response_roles.length > 0;
        return hasRating && hasRoles;
      }
    }).length;
  }, [interviewData?.responses, allQuestions.length, isPublic]);

  const progressPercentage =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Check and update interview completion status
  const checkAndUpdateInterviewCompletion = useCallback(async () => {
    if (!interviewData) return;

    const currentStatus = interviewData.status;

    // Determine the correct status based on answered applicable questions
    let newStatus: typeof currentStatus;

    if (answeredQuestions === totalQuestions && totalQuestions > 0) {
      newStatus = "completed";
    } else if (answeredQuestions === 0) {
      newStatus = "pending";
    } else {
      newStatus = "in_progress";
    }

    // Only update if status actually needs to change
    if (newStatus !== currentStatus) {
      try {
        await updateInterview({
          id: interviewData.id,
          updates: { status: newStatus },
          isPublic,
        });

        // Show toast only for specific meaningful transitions
        if (currentStatus === "pending" && newStatus === "in_progress") {
          toast.success("Interview started");
        } else if (currentStatus === "in_progress" && newStatus === "pending") {
          toast.info("Interview reset to pending");
        } else if (newStatus === "completed") {
          toast.success("Interview completed!");
        } else if (
          currentStatus === "completed" &&
          newStatus === "in_progress"
        ) {
          toast.info("Interview status changed to in progress");
        }
      } catch (error) {
        console.error("Failed to update interview status:", error);
        toast.error("Failed to update interview status");
      }
    }
  }, [
    interviewData,
    answeredQuestions,
    totalQuestions,
    updateInterview,
    isPublic,
  ]);

  // Check status whenever answered questions change (only when ready)
  useEffect(() => {
    if (isReady && totalQuestions > 0) {
      checkAndUpdateInterviewCompletion();
    }
  }, [
    answeredQuestions, // Only depends on rating changes
    totalQuestions,
    isReady,
    checkAndUpdateInterviewCompletion,
  ]);

  // Initialize URL with first question if no question parameter is present (only when ready)
  useEffect(() => {
    const questionIdParam = searchParams.get("question");
    if (!questionIdParam && allQuestions.length > 0 && isReady) {
      // Navigate to first question to establish clean URL structure
      // Using replace to not add an extra history entry
      const basePath = isPublic
        ? `/external/interview/${interviewId}`
        : `/assessments/onsite/interviews/${interviewId}`;

      // Preserve existing search parameters (especially code and email for public interviews)
      const searchString = searchParams.toString();
      const fullPath = searchString ? `${basePath}?${searchString}` : basePath;

      navigate(fullPath, {
        replace: true,
      });
    }
  }, [searchParams, allQuestions, interviewId, navigate, isPublic, isReady]);

  const toggleDialog = useCallback(
    (dialog: keyof DialogState, value?: boolean) => {
      setDialogs((prev) => ({
        ...prev,
        [dialog]: value !== undefined ? value : !prev[dialog],
      }));
    },
    []
  );

  const handleSettingsSave = useCallback(
    async (updates: {
      name?: string;
      status?: InterviewStatus;
      notes?: string;
    }) => {
      if (!interviewData) return;

      try {
        await updateInterview({
          id: interviewData.id,
          updates,
          isPublic,
        });
        toast.success("Interview settings updated successfully");
        toggleDialog("showSettings", false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update interview settings"
        );
      }
    },
    [interviewData, updateInterview, toggleDialog, isPublic]
  );

  const handleSettingsDelete = useCallback(async () => {
    if (!interviewData) return;

    try {
      await deleteInterview(interviewData.id);
      toast.success("Interview deleted successfully");
      toggleDialog("showSettings", false);
      navigate("/assessments/onsite/interviews");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete interview"
      );
    }
  }, [interviewData, deleteInterview, navigate, toggleDialog]);

  const handleSettingsExport = useCallback(async () => {
    if (!interviewData) return;

    try {
      const dataToExport = {
        interview: interviewData,
        responses: interviewData.responses,
        progress: {
          total_questions: totalQuestions,
          answered_questions: answeredQuestions,
          completion_percentage: progressPercentage,
        },
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `interview-${interviewData.id}-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Interview data exported successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to export interview data"
      );
    }
  }, [interviewData, totalQuestions, answeredQuestions, progressPercentage]);

  const confirmExit = useCallback(() => {
    if (isPublic) {
      // For public interviews, go to home page
      navigate("/");
    } else {
      // For internal interviews, go to interviews list
      navigate("/assessments/onsite/interviews");
    }
  }, [navigate, isPublic]);

  return {
    // Interview data
    interview: {
      data: interviewData,
      isLoading,
      error: null, // React Query handles errors automatically
      isSubmitting: false,
      isReady,
    },

    // Interview actions
    actions: {
      updateSettings: handleSettingsSave,
      delete: handleSettingsDelete,
      export: handleSettingsExport,
      exit: confirmExit,
    },

    // UI state
    ui: {
      dialogs,
      toggleDialog,
    },
  };
}
