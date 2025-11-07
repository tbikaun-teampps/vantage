import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  useAssessmentById,
  useAssessmentActions,
} from "@/hooks/useAssessments";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import type { AssessmentStatus } from "@/types/domains/assessment";

export function useAssessmentDetail(assessmentId: number) {
  const navigate = useCompanyAwareNavigate();
  const { assessmentType } = useAssessmentContext();
  const companyId = useCompanyFromUrl();

  const {
    data: assessment,
    isLoading: assessmentLoading,
    error: assessmentError,
  } = useAssessmentById(assessmentId);
  const { updateAssessment, deleteAssessment } = useAssessmentActions();

  // Local state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handlers
  const handleBack = useCallback(() => {
    navigate(`/${companyId}/assessments/${assessmentType}`);
  }, [navigate, assessmentType, companyId]);

  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!assessment) return;

      await updateAssessment(assessment.id, {
        status: newStatus as AssessmentStatus,
      });
    },
    [assessment, updateAssessment]
  );

  const handleNameChange = useCallback(
    async (newName: string) => {
      if (!assessment) return;

      await updateAssessment(assessment.id, {
        name: newName.trim(),
      });
    },
    [assessment, updateAssessment]
  );

  const handleDescriptionChange = useCallback(
    async (newDescription: string) => {
      if (!assessment) return;

      await updateAssessment(assessment.id, {
        description: newDescription.trim() || undefined,
      });
    },
    [assessment, updateAssessment]
  );

  const handleInterviewOverviewChange = useCallback(
    async (newOverview: string) => {
      if (!assessment) return;

      await updateAssessment(assessment.id, {
        interview_overview: newOverview.trim() || undefined,
      });
    },
    [assessment, updateAssessment]
  );

  const handleDelete = useCallback(async () => {
    if (!assessment) return;

    setIsDeleting(true);
    try {
      await deleteAssessment(assessmentId);
      toast.success("Assessment deleted successfully");
      navigate(`/${companyId}/assessments/${assessmentType}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete assessment"
      );
      setIsDeleting(false);
    }
  }, [
    assessment,
    deleteAssessment,
    assessmentId,
    navigate,
    assessmentType,
    companyId,
  ]);

  // Loading and error states
  const isLoading = assessmentLoading;
  const error = assessmentError?.message;

  return {
    // Data
    assessment,

    // Loading states
    isLoading,
    error,

    // Dialog state
    showDeleteDialog,
    isDeleting,

    // Handlers
    handleBack,
    handleStatusChange,
    handleNameChange,
    handleDescriptionChange,
    handleInterviewOverviewChange,
    setShowDeleteDialog,
    handleDelete,
  };
}