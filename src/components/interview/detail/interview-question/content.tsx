import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface InterviewQuestionContentProps {
  question: {
    question_text: string;
    context?: string;
  };
}

export function InterviewQuestionContent({
  question,
}: InterviewQuestionContentProps) {
  const isMobile = useIsMobile();
  return (
    <div className="space-y-4" data-tour="interview-question">
      {question.context ? (
        // Traditional layout when context exists
        <div className={cn("flex flex-col", isMobile ? "px-2" : "")}>
          {/* Question Text */}
          <div className="text-left">
            <h2
              className={cn(
                "font-bold text-foreground leading-relaxed whitespace-pre-line",
                isMobile ? "text-sm" : "text-xl"
              )}
            >
              {question.question_text}
            </h2>
          </div>

          {/* Context */}
          <div className="text-left">
            <p
              className={cn(
                "text-muted-foreground whitespace-pre-line mt-2",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              {question.context}
            </p>
          </div>
        </div>
      ) : (
        // Typeform-style centered layout when no context
        <div className="flex justify-center">
          <div className="max-w-4xl w-full">
            <div className="rounded-xl p-8 bg-muted">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground leading-relaxed">
                    {question.question_text}
                  </h2>
                  <p className="text-muted-foreground">
                    Please select your rating below
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
