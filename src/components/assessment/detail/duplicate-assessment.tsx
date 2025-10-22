import { Button } from "@/components/ui/button";
import { IconCopy, IconLoader } from "@tabler/icons-react";
import { useAssessmentActions } from "@/hooks/useAssessments";
import { toast } from "sonner";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";

interface DuplicateAssessmentProps {
  assessmentId: number;
}

export function DuplicateAssessment({
  assessmentId,
}: DuplicateAssessmentProps) {
  const { duplicateAssessment, isDuplicating } = useAssessmentActions();
  const navigate = useCompanyAwareNavigate();

  const handleDuplicate = async () => {
    try {
      const newAssessment = await duplicateAssessment(assessmentId);
      toast.success("Assessment duplicated successfully");
      navigate(`/assessments/onsite/${newAssessment.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to duplicate assessment"
      );
    }
  };

  return (
    <div
      className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4"
      data-tour="assessment-duplicate"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Duplicate Assessment
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Create a copy of this assessment with all its settings and structure.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDuplicate}
          disabled={isDuplicating}
          className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          {isDuplicating ? (
            <IconLoader className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <IconCopy className="h-4 w-4 mr-2" />
          )}
          {isDuplicating ? "Duplicating..." : "Duplicate"}
        </Button>
      </div>
    </div>
  );
}
