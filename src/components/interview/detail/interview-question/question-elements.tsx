import { Button } from "@/components/ui/button";
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
        true_label: string;
        false_label: string;
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

    switch (part.answer_type) {
      case "labelled_scale": {
        if ("labels" in part.options) {
          return (
            <div className="mt-2 grid grid-cols-4 gap-4 text-sm ">
              {part.options.labels.map((label: string, index: number) => {
                const isSelected = selectedValue === label;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleSelection(part.id, label)}
                    className={cn(
                      "whitespace-normal text-wrap min-w-0 flex-1 h-16 break-words transition-all duration-200",
                      isSelected && "bg-primary text-primary-foreground"
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
      }
      case "boolean": {
        if ("true_label" in part.options && "false_label" in part.options) {
          const booleanOptions = part.options;
          return (
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <Button
                variant="outline"
                onClick={() =>
                  handleSelection(part.id, booleanOptions.false_label)
                }
                className={cn(
                  "transition-all duration-200",
                  selectedValue === booleanOptions.false_label &&
                    "bg-primary text-primary-foreground"
                )}
              >
                {booleanOptions.false_label}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  handleSelection(part.id, booleanOptions.true_label)
                }
                className={cn(
                  "transition-all duration-200",
                  selectedValue === booleanOptions.true_label &&
                    "bg-primary text-primary-foreground"
                )}
              >
                {booleanOptions.true_label}
              </Button>
            </div>
          );
        }
        return null;
      }
      case "scale": {
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
            <div className="mt-2 grid grid-cols-10 gap-4 text-sm ">
              {scaleValues.map((value: number, index: number) => {
                const isSelected = selectedValue === value.toString();
                return (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleSelection(part.id, value.toString())}
                    className={cn(
                      "whitespace-normal text-wrap min-w-0 flex-1 h-16 break-words transition-all duration-200",
                      isSelected && "bg-primary text-primary-foreground"
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
      }
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mt-6 mb-4 text-lg font-medium">Question Elements</div>
      <div className="flex flex-col gap-4">
        {question.question_parts && question.question_parts.length > 0 ? (
          question.question_parts
            .sort((a, b) => a.order_index - b.order_index)
            .map((part) => (
              <div key={part.id}>
                <div className="p-4 border border-border rounded-md bg-muted/50">
                  <div className="flex gap-4">
                    <div className="mb-2 font-medium">
                      {part.order_index + 1}
                    </div>
                    <div className="mb-2">{part.text}</div>
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
