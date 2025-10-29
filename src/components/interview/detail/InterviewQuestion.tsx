import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Form } from "@/components/ui/form";
import { InterviewQuestionHeader } from "./interview-question/header";
import { InterviewQuestionContent } from "./interview-question/content";
import { InterviewRatingSection } from "./interview-question/rating-section";
import { InterviewRolesSection } from "./interview-question/roles-section";
import {
  InterviewCompletionDialog,
  type InterviewFeedback,
} from "./InterviewCompletionDialog";
import { useInterviewQuestion } from "@/hooks/interview/useQuestion";
import { useInterviewNavigation } from "@/hooks/interview/useInterviewNavigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MobileActionBar } from "./MobileActionBar";
import { InterviewActionBar } from "./InterviewActionBar";
import { InterviewQuestionElements } from "./interview-question/question-elements";

interface InterviewQuestionProps {
  questionId: number;
  form: any; // React Hook Form instance
  isIndividualInterview: boolean;
  interviewId: number;
  handleSave: () => void;
  isSaving: boolean;
  onComplete?: (feedback: InterviewFeedback) => Promise<void>;
}

export function InterviewQuestion({
  questionId,
  form,
  isIndividualInterview,
  interviewId,
  handleSave,
  isSaving,
  onComplete,
}: InterviewQuestionProps) {
  const isMobile = useIsMobile();
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] =
    useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  const { data: question, isLoading: isLoadingQuestion } = useInterviewQuestion(
    interviewId,
    questionId
  );

  // Use navigation hook for mobile buttons
  const { isFirst, isLast, onPrevious, onNext } = useInterviewNavigation(
    interviewId,
    isIndividualInterview
  );

  // Handle completion confirmation
  const handleCompleteConfirm = async (feedback: InterviewFeedback) => {
    if (!onComplete) return;

    setIsCompleting(true);
    try {
      await onComplete(feedback);
      setIsCompletionDialogOpen(false);
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoadingQuestion || !question) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading question...</div>
      </div>
    );
  }

  // Check if current question is answered
  const isQuestionAnswered = () => {
    if (isIndividualInterview) {
      // Check if all question_parts have selections in the form
      if (!question.question_parts || question.question_parts.length === 0) {
        return false;
      }

      // All parts must have a value in the form
      return question.question_parts.every((part) => {
        const value = form.watch(`question_part_${part.id}`);
        return value !== undefined && value !== null && value.trim() !== "";
      });
    } else {
      const rating = form.watch("rating_score");
      const isUnknown = form.watch("is_unknown");
      const roleIds = form.watch("role_ids");

      // Question is answered if either rating is provided OR marked as unknown
      const hasAnswer =
        (rating !== null && rating !== undefined) || isUnknown === true;

      if (!hasAnswer) return false;

      // For private interviews, check if at least one role is selected when roles are available
      // Note: Role validation will be handled by the RolesSection component itself
      if (!roleIds || roleIds.length === 0) {
        return false;
      }

      return true;
    }
  };

  // For individual interviews: require all parts answered AND dirty state
  // For private interviews: just check dirty state
  const canSave = isIndividualInterview
    ? isQuestionAnswered() && form.formState.isDirty
    : form.formState.isDirty;

  return (
    <>
      <InterviewQuestionHeader
        interviewId={interviewId}
        isMobile={isMobile}
        responseId={question.response.id}
        breadcrumbs={question.breadcrumbs || {}}
        isQuestionAnswered={isQuestionAnswered}
        isIndividualInterview={isIndividualInterview}
      />
      <div
        className={cn("overflow-y-auto max-h-screen", isMobile ? "p-4" : "")}
      >
        <Form {...form}>
          <div
            className={cn(
              "flex flex-col gap-4 max-w-[1600px] mx-auto mb-48",
              isMobile ? "pb-48" : "" // Padding for mobile action bar (stops being trapped under mobile browser toolbars)
            )}
          >
            <InterviewQuestionContent
              isIndividualInterview={isIndividualInterview}
              question={question}
            />

            {isIndividualInterview && (
              <InterviewQuestionElements question={question} form={form} />
            )}

            {!isIndividualInterview && (
              <InterviewRatingSection
                form={form}
                options={question.options.rating_scales}
                isMobile={isMobile}
              />
            )}

            {/* Roles Section - Hidden for individual interviews */}
            {!isIndividualInterview && question && (
              <InterviewRolesSection
                form={form}
                isMobile={isMobile}
                options={question.options.applicable_roles}
              />
            )}
            {isMobile ? (
              <div className="flex gap-4 w-full max-w-2xl">
                <div
                  className="flex gap-4 w-full"
                  data-tour="interview-navigation-mobile"
                >
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onPrevious}
                    disabled={isFirst || isSaving}
                  >
                    Back
                  </Button>
                  <Button
                    className={cn(
                      "flex-1",
                      isQuestionAnswered() || canSave
                        ? "bg-green-600 hover:bg-green-700 focus:ring-green-600 text-white"
                        : ""
                    )}
                    disabled={
                      !isQuestionAnswered() ||
                      isSaving ||
                      !question?.response?.id
                    }
                    onClick={() => {
                      // If there are unsaved changes, save first
                      if (canSave) {
                        handleSave();
                        return;
                      }
                      // If at last question, show completion dialog (if individual interview)
                      if (isLast && isIndividualInterview) {
                        setIsCompletionDialogOpen(true);
                        return;
                      }

                      // Otherwise, navigate to next
                      onNext();
                    }}
                  >
                    {isSaving
                      ? "Saving..."
                      : canSave
                        ? "Save"
                        : isLast
                          ? "Complete"
                          : "Next"}
                  </Button>
                </div>
                <MobileActionBar responseId={question?.response?.id} />
              </div>
            ) : (
              // {/* Fixed Action Bar with Dropdown Navigation */}
              <InterviewActionBar
                isSaving={isSaving}
                isDirty={canSave}
                onSave={handleSave}
                isIndividualInterview={isIndividualInterview}
                onComplete={
                  isLast && isQuestionAnswered() && !canSave
                    ? () => setIsCompletionDialogOpen(true)
                    : undefined
                }
              />
            )}
          </div>
        </Form>
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
