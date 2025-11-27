import { Button } from "@/components/ui/button";
import { useInterviewNavigation } from "@/hooks/interview/useInterviewNavigation";
import { useInterviewProgress } from "@/hooks/interview/useInterviewProgress";
import { cn } from "@/lib/utils";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDeviceFloppy,
  IconCheck,
  IconLoader2,
} from "@tabler/icons-react";
import { InterviewCompletionDialog } from "./InterviewCompletionDialog";
import { useState } from "react";
import type { InterviewFeedback } from "@/types/api/interviews";

interface InterviewNavigationProps {
  interviewId: number;
  responseId: number;
  isSaving: boolean;
  handleSave: () => void;
  isMobile: boolean;
  isQuestionAnswered: () => boolean;
  isIndividualInterview: boolean;
  isFormDirty: boolean;
  onComplete: (feedback: InterviewFeedback) => Promise<void>;
  isCompleting: boolean;
}

export function InterviewNavigation({
  interviewId,
  responseId,
  isSaving,
  handleSave,
  isMobile,
  isQuestionAnswered,
  isIndividualInterview,
  isFormDirty,
  onComplete,
  isCompleting,
}: InterviewNavigationProps) {
  const canSave = isIndividualInterview
    ? isQuestionAnswered() && isFormDirty
    : isFormDirty;
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] =
    useState<boolean>(false);

  const { isFirst, isLast, onPrevious, onNext } = useInterviewNavigation(
    interviewId,
    isIndividualInterview
  );

  const { data: progress } = useInterviewProgress(interviewId);

  const allQuestionsAnswered =
    progress?.answered_questions === progress?.total_questions &&
    (progress?.total_questions ?? 0) > 0;

  // Handle completion confirmation
  const handleCompleteConfirm = async (feedback: InterviewFeedback) => {
    if (!onComplete) return;

    await onComplete(feedback);
    // Dialog will be unmounted by navigation, no need to close manually
  };

  if (isMobile) {
    return (
      <>
        <div className="flex gap-4 w-full max-w-2xl">
          <div
            className="grid grid-cols-1 gap-4 w-full"
            data-tour="interview-navigation-mobile"
          >
            <Button
              className={cn(
                "flex-1",
                isQuestionAnswered() || canSave
                  ? "bg-green-600 hover:bg-green-700 focus:ring-green-600 text-white"
                  : ""
              )}
              disabled={!isQuestionAnswered() || isSaving || !responseId}
              onClick={() => {
                if (canSave) {
                  handleSave();
                  return;
                }
                if (isLast && isIndividualInterview && allQuestionsAnswered) {
                  setIsCompletionDialogOpen(true);
                  return;
                }
                onNext();
              }}
            >
              {isSaving
                ? "Saving..."
                : canSave
                  ? "Save"
                  : isLast && allQuestionsAnswered
                    ? "Complete"
                    : "Next"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onPrevious}
              disabled={isFirst || isSaving}
            >
              Back
            </Button>
          </div>
          {/* <MobileActionBar responseId={responseId} /> */}
        </div>
        {/* Completion Dialog */}
        <InterviewCompletionDialog
          open={isCompletionDialogOpen}
          onOpenChange={setIsCompletionDialogOpen}
          onConfirm={handleCompleteConfirm}
          isLoading={isCompleting}
        />
      </>
    );
  }
  return (
    <>
      <div className="grid grid-cols-2 gap-4 mt-4 px-6">
        <Button
          variant="outline"
          size="default"
          onClick={onPrevious}
          disabled={isFirst || isSaving}
          className="w-full"
        >
          <IconChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button
          variant="default"
          size="default"
          className={cn(
            "w-full text-primary-foreground",
            isQuestionAnswered() || canSave
              ? "bg-green-500 dark:bg-green-400 hover:bg-green-600 dark:hover:bg-green-500 "
              : ""
          )}
          disabled={!isQuestionAnswered() || isSaving}
          onClick={() => {
            if (canSave) {
              handleSave();
              return;
            }
            if (isLast && isIndividualInterview && allQuestionsAnswered) {
              setIsCompletionDialogOpen(true);
              return;
            }
            onNext();
          }}
        >
          {isSaving ? (
            <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : canSave ? (
            <IconDeviceFloppy className="h-4 w-4 mr-2" />
          ) : isLast && allQuestionsAnswered ? (
            <IconCheck className="h-4 w-4 mr-2" />
          ) : null}
          {isSaving
            ? "Saving..."
            : canSave
              ? "Save"
              : isLast && allQuestionsAnswered
                ? "Complete"
                : "Next"}
          {!isSaving && !canSave && !(isLast && allQuestionsAnswered) && (
            <IconChevronRight className="h-4 w-4 ml-2" />
          )}
        </Button>
      </div>
      {/* Completion Dialog */}
      <InterviewCompletionDialog
        open={isCompletionDialogOpen}
        onOpenChange={setIsCompletionDialogOpen}
        onConfirm={handleCompleteConfirm}
        isLoading={isCompleting}
      />
    </>
  );
}
