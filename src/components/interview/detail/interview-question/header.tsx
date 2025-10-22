import { IconChevronRight, IconCircleCheckFilled } from "@tabler/icons-react";
import { InterviewComments } from "../InterviewComments";
import { InterviewEvidence } from "../InterviewEvidence";
import { InterviewActions } from "../InterviewActions";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useInterviewProgress } from "@/hooks/interview/useInterviewProgress";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface InterviewQuestionHeader {
  interviewId: number;
  isMobile: boolean;
  responseId?: number;
  breadcrumbs: {
    section: string;
    step: string;
    question: string;
  };
  isQuestionAnswered: () => boolean;
}

export function InterviewQuestionHeader({
  interviewId,
  isMobile,
  responseId,
  breadcrumbs,
  isQuestionAnswered,
}: InterviewQuestionHeader) {
  const { data: progress, isLoading } = useInterviewProgress(interviewId);

  if (!responseId) {
    return null;
  }

  if (isLoading || !progress) {
    return (
      <div className="flex items-center justify-center mb-2">
        <Skeleton className="h-12 w-96" />
      </div>
    );
  }

  return (
    <div>
      <div
        className="w-full flex justify-center"
        data-tour="interview-progress"
      >
        <div className="relative w-full">
          <Progress
            value={progress.progress_percentage}
            className={cn("h-4", !isMobile && "rounded-none")}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium mix-blend-difference text-white">
              {progress.answered_questions}/{progress.total_questions}
            </span>
          </div>
        </div>
      </div>
      <div className={`flex-shrink-0 ${isMobile ? "py-4" : "p-6"}`}>
        <div className="max-w-[1600px] mx-auto w-full">
          <div
            className={`flex items-start justify-between ${
              isMobile ? "flex-col space-y-3" : ""
            }`}
          >
            <div className="w-full" data-tour="interview-question-breadcrumbs">
              {breadcrumbs &&
                (isMobile ? (
                  <MobileBreadCrumbs
                    breadcrumbs={breadcrumbs}
                    isQuestionAnswered={isQuestionAnswered}
                  />
                ) : (
                  <DesktopBreadCrumbs
                    breadcrumbs={breadcrumbs}
                    isQuestionAnswered={isQuestionAnswered}
                  />
                ))}
            </div>

            {/* Comments & Evidence + Actions Buttons */}
            {!isMobile && (
              <div className="flex items-center space-x-2">
                <InterviewComments responseId={responseId} />
                <InterviewEvidence responseId={responseId} />
                {!isMobile && <InterviewActions responseId={responseId} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BreadcrumbProps {
  breadcrumbs: {
    section: string;
    step: string;
    question: string;
  };
  isQuestionAnswered: () => boolean;
}

function MobileBreadCrumbs({
  breadcrumbs,
  isQuestionAnswered,
}: BreadcrumbProps) {
  return (
    <div className="flex items-center text-xs gap-2 flex-nowrap overflow-x-auto">
      <span
        key="breadcrumb-section"
        className="flex items-center flex-shrink-0"
      >
        <Badge variant="secondary">
          <span className="max-w-[48ch] truncate">{breadcrumbs.section}</span>
        </Badge>
      </span>
      <IconChevronRight className="h-3 w-3 flex-shrink-0" />
      <span key="breadcrumb-step" className="flex items-center flex-shrink-0">
        <Badge variant="secondary">
          <span className="max-w-[48ch] truncate">{breadcrumbs.step}</span>
        </Badge>
      </span>
      <IconChevronRight className="h-3 w-3 flex-shrink-0" />
      <span
        key="breadcrumb-question"
        className="flex items-center flex-shrink-0 gap-2"
      >
        <Badge variant="secondary">
          <span className="max-w-[48ch] truncate">{breadcrumbs.question}</span>
        </Badge>
        {isQuestionAnswered() && (
          <IconCircleCheckFilled className="h-5 w-5 text-green-600" />
        )}
      </span>
    </div>
  );
}

function DesktopBreadCrumbs({
  breadcrumbs,
  isQuestionAnswered,
}: BreadcrumbProps) {
  return (
    <div className="flex items-center text-sm space-x-2 text-muted-foreground">
      <span
        key="breadcrumb-section"
        className="flex items-center flex-shrink-0"
      >
        <span className="max-w-[48ch] truncate">{breadcrumbs.section}</span>
      </span>
      <IconChevronRight className="h-3 w-3 flex-shrink-0" />
      <span key="breadcrumb-step" className="flex items-center flex-shrink-0">
        <span className="max-w-[48ch] truncate">{breadcrumbs.step}</span>
      </span>
      <IconChevronRight className="h-3 w-3 flex-shrink-0" />
      <span
        key="breadcrumb-question"
        className="flex items-center flex-shrink-0 gap-2"
      >
        <span className="max-w-[48ch] truncate">{breadcrumbs.question}</span>
        {isQuestionAnswered() && (
          <IconCircleCheckFilled className="h-5 w-5 text-green-600" />
        )}
      </span>
    </div>
  );
}
