import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface InterviewQuestionContentProps {
  isIndividualInterview: boolean;
  question: {
    question_text?: string;
    context?: string;
    question_parts?: Array<{
      id: number;
      order_index: number;
      text: string;
    }>;
  };
}

export function InterviewQuestionContent({
  isIndividualInterview,
  question,
}: InterviewQuestionContentProps) {
  const isMobile = useIsMobile();
  // For individual interviews
  if (isIndividualInterview) {
    return (
      <div
        className={cn("flex justify-center", isMobile ? "px-2" : "px-6")}
        data-tour="interview-question"
      >
        <div className="w-full">
          <h1  className="text-lg font-bold">{question.title}</h1>
          {/* <h1 className="text-md font-bold">Context</h1> */}
          <h2 className="text-foreground leading-relaxed whitespace-pre-line">
            {question.context}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-4", isMobile ? "px-2" : "px-6")}
      data-tour="interview-question"
    >
      {question.context ? (
        // Traditional layout when context exists
        <div className="flex flex-col">
          <h1  className="text-2xl font-bold mb-2">{question.title}</h1>
          {/* Question Text */}
          <div className="text-left">
            <h2 className="text-lg text-foreground leading-relaxed whitespace-pre-line">
              {question.question_text}
            </h2>
          </div>

          {/* Context */}
          <div className="text-left">
            <p className="text-sm text-muted-foreground whitespace-pre-line mt-2">
              {question.context}
            </p>
          </div>
        </div>
      ) : (
        // Centered layout when no context
        <div className="flex justify-center">
          <div className="max-w-4xl w-full">
            <div className="rounded-xl p-8 bg-muted">
              <div className="text-center space-y-6">
                <h1  className="text-2xl font-bold  mb-2">{question.title}</h1>
                <div className="space-y-4">
                  <h2 className="text-lg text-foreground leading-relaxed">
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
