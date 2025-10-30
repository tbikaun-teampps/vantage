import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type QuestionPart = {
  id: number;
  text: string;
  order_index: number;
  answer_type: string;
  options?:
    | {
        labels: string[];
      }
    | {
        max: number;
        min: number;
        step: number;
      };
};

interface InterviewQuestionElementsProps {
  question: {
    question_parts: Array<QuestionPart>;
    response: {
      id: number;
      question_part_responses?: Array<{
        id: number;
        question_part_id: number;
        answer_value?: string | null;
      }>;
    };
  };
  form: any; // React Hook Form instance
}

export function InterviewQuestionElements({
  question,
  form,
}: InterviewQuestionElementsProps) {
  const isMobile = useIsMobile();
  const handleSelection = (questionPartId: number, label: string) => {
    const fieldName = `question_part_${questionPartId}`;
    const currentValue = form.watch(fieldName);

    // Toggle: if same option is clicked, deselect it
    if (currentValue === label) {
      form.setValue(fieldName, undefined, { shouldDirty: true });
    } else {
      form.setValue(fieldName, label, { shouldDirty: true });
    }
  };

  const renderOptions = (part: QuestionPart) => {
    if (!part.options) return null;

    const selectedValue = form.watch(`question_part_${part.id}`);

    if (part.answer_type === "labelled_scale") {
      if ("labels" in part.options) {
        return (
          <div
            className={cn(
              "mt-2 grid gap-4 text-sm",
              isMobile ? "grid-cols-1" : "grid-cols-4"
            )}
          >
            {part.options.labels.map((label: string, index: number) => {
              const isSelected = selectedValue === label;
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleSelection(part.id, label)}
                  className={cn(
                    "whitespace-normal text-wrap min-w-0 flex-1 break-words transition-all duration-200",
                    isSelected &&
                      "bg-green-500 dark:bg-green-400 hover:bg-green-600 dark:hover:bg-green-500 text-primary-foreground",
                    isMobile ? "h-12" : "h-16"
                  )}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        );
      }
      return null;
    } else if (part.answer_type === "boolean") {
      return (
        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <Button
            variant="outline"
            onClick={() => handleSelection(part.id, "false")}
            className={cn(
              "transition-all duration-200",
              selectedValue === "false" &&
                "bg-green-500 dark:bg-green-400 hover:bg-green-600 dark:hover:bg-green-500 text-primary-foreground",
              isMobile ? "h-12" : "h-16"
            )}
          >
            No
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSelection(part.id, "true")}
            className={cn(
              "transition-all duration-200",
              selectedValue === "true" &&
                "bg-green-500 dark:bg-green-400 hover:bg-green-600 dark:hover:bg-green-500 text-primary-foreground",
              isMobile ? "h-12" : "h-16"
            )}
          >
            Yes
          </Button>
        </div>
      );
    } else if (["scale", "number"].includes(part.answer_type)) {
      // Scale has the options {"max": number, "min": number, "step": number}
      if (
        "max" in part.options &&
        "min" in part.options &&
        "step" in part.options
      ) {
        const scaleOptions = part.options;
        const scaleValues = [];
        for (
          let val = scaleOptions.min;
          val <= scaleOptions.max;
          val += scaleOptions.step
        ) {
          scaleValues.push(val);
        }
        return (
          <div
            className={cn(
              "mt-2 grid gap-4 text-sm",
              isMobile ? "grid-cols-3" : "grid-cols-10"
            )}
          >
            {scaleValues.map((value: number, index: number) => {
              const isSelected = selectedValue === value.toString();
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleSelection(part.id, value.toString())}
                  className={cn(
                    "whitespace-normal text-wrap min-w-0 flex-1 break-words transition-all duration-200",
                    isSelected &&
                      "bg-green-500 dark:bg-green-400 hover:bg-green-600 dark:hover:bg-green-500 text-primary-foreground",
                    isMobile ? "h-12" : "h-16"
                  )}
                >
                  {value}
                </Button>
              );
            })}
          </div>
        );
      }
      return null;
    } else if (part.answer_type === "percentage") {
      // Percentage scale from 0 to 100
      const percentageValues = [];
      for (let val = 0; val <= 100; val += 10) {
        percentageValues.push(val);
      }
      return (
        <div
          className={cn(
            "mt-2 grid gap-4 text-sm",
            isMobile ? "grid-cols-3" : "grid-cols-10"
          )}
        >
          {percentageValues.map((value: number, index: number) => {
            const isSelected = selectedValue === value.toString();
            return (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleSelection(part.id, value.toString())}
                className={cn(
                  "whitespace-normal text-wrap min-w-0 flex-1 break-words transition-all duration-200",
                  isSelected &&
                    "bg-green-500 dark:bg-green-400 hover:bg-green-600 dark:hover:bg-green-500 text-primary-foreground",
                  isMobile ? "h-12" : "h-16"
                )}
              >
                {value}%
              </Button>
            );
          })}
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div className={cn(isMobile ? "px-2" : "px-6")}>
      {/* <div className="mt-6 mb-4 text-lg font-medium">Question Elements</div> */}
      <div className="flex flex-col gap-4">
        {question.question_parts && question.question_parts.length > 0 ? (
          question.question_parts
            .sort((a, b) => a.order_index - b.order_index)
            .map((part) => (
              <div key={part.id}>
                <div>
                  <div className="flex gap-4">
                    <div className="mb-2 font-medium">
                      {part.order_index + 1}. {part.text}
                    </div>
                  </div>
                </div>
                {renderOptions(part)}
              </div>
            ))
        ) : (
          <div className="text-sm text-muted-foreground">
            No question elements available for this question.
          </div>
        )}
      </div>
    </div>
  );
}
