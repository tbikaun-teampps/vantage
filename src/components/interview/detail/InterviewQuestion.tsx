import { useIsMobile } from "@/hooks/use-mobile";
import { Form } from "@/components/ui/form";
import { InterviewQuestionHeader } from "./interview-question/header";
import { InterviewQuestionContent } from "./interview-question/content";
import { InterviewRatingSection } from "./interview-question/rating-section";
import { InterviewRolesSection } from "./interview-question/roles-section";
import { useInterviewQuestion } from "@/hooks/interview/useQuestion";
import { useInterviewProgress } from "@/hooks/interview/useInterviewProgress";
import { useInterviewSummary } from "@/hooks/interview/useInterviewSummary";
import { Progress } from "@/components/ui/progress";
import { InterviewSidebar } from "./InterviewSidebar";
import { InterviewQuestionElements } from "./interview-question/question-elements";
import { InterviewComments } from "./InterviewComments";
import { InterviewEvidence } from "./InterviewEvidence";
import { InterviewActions } from "./InterviewActions";
import { InterviewNavigation } from "./InterviewNavigation";
import type { CompleteInterviewBodyData } from "@/types/api/interviews";
import type { InterviewFormData } from "@/pages/interview/InterviewDetailPage";
import type { UseFormReturn } from "react-hook-form";

interface InterviewQuestionProps {
  questionId: number;
  form: UseFormReturn<InterviewFormData>;
  isIndividualInterview: boolean;
  interviewId: number;
  handleSave: () => void;
  isSaving: boolean;
  isCompleting: boolean;
  onComplete: (feedback: CompleteInterviewBodyData) => Promise<void>;
}

export function InterviewQuestion({
  questionId,
  form,
  isIndividualInterview,
  interviewId,
  handleSave,
  isSaving,
  isCompleting = false,
  onComplete,
}: InterviewQuestionProps) {
  const isMobile = useIsMobile();

  const { data: question, isLoading: isLoadingQuestion } = useInterviewQuestion(
    interviewId,
    questionId
  );

  // Get progress data to check if all questions are answered
  const { data: progress } = useInterviewProgress(interviewId);

  // Get interview summary for desktop header
  const { data: summary } = useInterviewSummary(interviewId);

  // Check if current question is answered
  const isQuestionAnswered = () => {
    // Return false if question hasn't loaded yet
    if (!question) return false;
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

  // Mobile layout
  if (isMobile) {
    // Show simple loading state for mobile
    if (
      isLoadingQuestion ||
      !question ||
      !question.response ||
      !question.options
    ) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-muted-foreground">Loading question...</div>
        </div>
      );
    }

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
        <div className="overflow-y-auto max-h-screen p-4">
          <Form {...form}>
            <div className="flex flex-col gap-4 max-w-[1600px] mx-auto pb-48">
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

              {!isIndividualInterview && (
                <InterviewRolesSection
                  form={form}
                  isMobile={isMobile}
                  options={question.options.applicable_roles}
                />
              )}

              <InterviewNavigation
                interviewId={interviewId}
                responseId={question.response.id}
                isSaving={isSaving}
                handleSave={handleSave}
                isMobile={isMobile}
                isQuestionAnswered={isQuestionAnswered}
                isIndividualInterview={isIndividualInterview}
                isFormDirty={form.formState.isDirty}
                onComplete={onComplete}
                isCompleting={isCompleting}
              />
            </div>
          </Form>
        </div>
      </>
    );
  }

  // Desktop layout - two-column design
  return (
    <div className="flex h-screen overflow-hidden max-w-[1600px] mx-auto">
      {/* Left Sidebar */}
      <InterviewSidebar
        interviewId={interviewId}
        isIndividualInterview={isIndividualInterview}
      />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
        {/* Content Header with Interview Metadata */}
        <div className="flex-shrink-0 border-b border-border">
          {/* Interview & Assessment Names + Action Buttons */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold truncate">
                  {summary?.name || "Interview"}
                </h1>
                <p className="text-sm text-muted-foreground truncate">
                  {summary?.assessment?.name || "Assessment"}
                </p>
              </div>

              {/* Comments, Evidence + Actions Buttons */}
              {question && question.response && (
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <InterviewComments responseId={question.response.id} />
                  <InterviewEvidence responseId={question.response.id} />
                  {!isIndividualInterview && (
                    <InterviewActions responseId={question.response.id} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="relative w-full">
          <Progress
            value={progress?.progress_percentage || 0}
            className="h-4 rounded-none"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium mix-blend-difference text-white">
              {progress?.answered_questions || 0}/
              {progress?.total_questions || 0}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingQuestion || !question ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading question...</div>
            </div>
          ) : (
            <Form {...form}>
              <div className="flex flex-col gap-4 max-w-[1200px] mx-auto p-6 pb-24">
                <InterviewQuestionContent
                  isIndividualInterview={isIndividualInterview}
                  question={question}
                />

                {isIndividualInterview && (
                  <InterviewQuestionElements question={question} form={form} />
                )}

                {!isIndividualInterview && question.options && (
                  <InterviewRatingSection
                    form={form}
                    options={question.options.rating_scales}
                    isMobile={false}
                  />
                )}

                {!isIndividualInterview && question.options && (
                  <InterviewRolesSection
                    form={form}
                    isMobile={false}
                    options={question.options.applicable_roles}
                  />
                )}

                {/* Desktop Bottom Action Buttons */}
                {question.response && (
                  <InterviewNavigation
                    interviewId={interviewId}
                    responseId={question.response.id}
                    isSaving={isSaving}
                    handleSave={handleSave}
                    isMobile={isMobile}
                    isQuestionAnswered={isQuestionAnswered}
                    isIndividualInterview={isIndividualInterview}
                    isFormDirty={form.formState.isDirty}
                    onComplete={onComplete}
                    isCompleting={isCompleting}
                  />
                )}
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
