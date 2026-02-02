import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { InterviewFormData } from "@/pages/interview/InterviewDetailPage";
import type { GetInterviewQuestionByIdResponseData } from "@/types/api/interviews";
import type { UseFormReturn } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

// Type for question parts in the interview context
// Defined inline since the question_parts property is optional on the response type
type InterviewQuestionPart = {
  id: number;
  text: string;
  order_index: number;
  answer_type: "number" | "boolean" | "scale" | "labelled_scale" | "percentage";
  options:
    | { labels: string[] }
    | { max: number; min: number; step: number }
    | { max: number; min: number; decimal_places?: number }
    | Record<string, never>
    | null;
};

interface InterviewQuestionElementsProps {
  question: GetInterviewQuestionByIdResponseData;
  form: UseFormReturn<InterviewFormData>; // React Hook Form instance
}

export function InterviewQuestionElements({
  question,
  form,
}: InterviewQuestionElementsProps) {
  const isMobile = useIsMobile();

  if (!question) {
    return null;
  }

  const handleSelection = (questionPartId: number, label: string) => {
    const fieldName =
      `question_part_${questionPartId}` as `question_part_${number}`;
    const currentValue = form.watch(fieldName);

    // Toggle: if same option is clicked, deselect it
    if (currentValue === label) {
      form.setValue(fieldName, undefined, { shouldDirty: true });
    } else {
      form.setValue(fieldName, label, { shouldDirty: true });
    }
  };

  const renderOptions = (part: InterviewQuestionPart) => {
    const selectedValue = form.watch(
      `question_part_${part.id}` as `question_part_${number}`
    );

    if (part.answer_type === "labelled_scale") {
      if (!part.options) return null;

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
    } else if (part.answer_type === "scale") {
      if (!part.options) return null;
      // Scale allows numeric input with min/max/step constraints
      if (
        "max" in part.options &&
        "min" in part.options &&
        "step" in part.options
      ) {
        const scaleOptions = part.options as {
          max: number;
          min: number;
          step: number;
        };
        return (
          <FormField
            control={form.control}
            name={`question_part_${part.id}` as `question_part_${number}`}
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormControl>
                  <Input
                    type="number"
                    min={scaleOptions.min}
                    max={scaleOptions.max}
                    step={scaleOptions.step}
                    placeholder={`Enter a value from ${scaleOptions.min} to ${scaleOptions.max}`}
                    className={cn("text-sm", isMobile ? "h-12" : "h-16")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }
      return null;
    } else if (part.answer_type === "number") {
      if (!part.options) return null;
      // Number type allows free-form input with min/max bounds and decimal precision
      if ("max" in part.options && "min" in part.options) {
        const numberOptions = part.options as {
          max: number;
          min: number;
          decimal_places?: number;
        };
        const decimalPlaces = numberOptions.decimal_places ?? 0;
        const step =
          decimalPlaces === 0 ? "1" : Math.pow(10, -decimalPlaces).toString();
        
        return (
          <FormField
            control={form.control}
            name={`question_part_${part.id}` as `question_part_${number}`}
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormControl>
                  <Input
                    type="number"
                    min={numberOptions.min}
                    max={numberOptions.max}
                    step={step}
                    placeholder={`Enter a number between ${numberOptions.min} and ${numberOptions.max}`}
                    className={cn("text-sm", isMobile ? "h-12" : "h-16")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }
      return null;
    } else if (part.answer_type === "percentage") {
      // Percentage allows free-form input from 0 to 100
      return (
        <FormField
          control={form.control}
          name={`question_part_${part.id}` as `question_part_${number}`}
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  placeholder="Enter a percentage (0-100)"
                  className={cn("text-sm", isMobile ? "h-12" : "h-16")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
