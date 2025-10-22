import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { IconCircleCheckFilled } from "@tabler/icons-react";

interface InterviewRatingSectionProps {
  options: Array<{
    id: string;
    value: number;
    name: string;
  }>;
  form: any;
  isMobile: boolean;
}

export function InterviewRatingSection({
  options,
  form,
  isMobile,
}: InterviewRatingSectionProps) {
  const hasRating =
    form.watch("rating_score") !== null &&
    form.watch("rating_score") !== undefined;
  const isUnknown = form.watch("is_unknown") === true;
  const hasAnswer = hasRating || isUnknown;

  return (
    <div className="space-y-4">
      {!isMobile && (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Label className="text-md font-semibold">Rating</Label>
            <span className="text-red-500">*</span>
            {hasAnswer && (
              <IconCircleCheckFilled className="h-5 w-5 text-green-600" />
            )}
          </div>
          {/* Fixed height container to prevent layout shift */}
          <div className="h-2 flex items-center">
            {!hasAnswer && (
              <span className="text-xs text-red-500">
                Select a rating or mark as unsure
              </span>
            )}
          </div>
        </div>
      )}

      <FormField
        control={form.control}
        name="rating_score"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div
                data-tour="interview-rating"
                className={cn(
                  "grid gap-3",
                  isMobile
                    ? "grid-cols-1"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}
              >
                {options
                  .sort((a, b) => a.value - b.value)
                  .map((rating) => {
                    const isSelected =
                      field.value !== null &&
                      field.value !== undefined &&
                      Number(field.value) === Number(rating.value);
                    return (
                      <OptionButton
                        key={rating.id}
                        rating={rating}
                        isSelected={isSelected}
                        isMobile={isMobile}
                        field={field}
                        form={form}
                      />
                    );
                  })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* I don't know / I'm unsure option */}
      <FormField
        control={form.control}
        name="is_unknown"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div
                data-tour="interview-rating-unsure"
                className={cn(
                  "grid gap-3",
                  isMobile
                    ? "grid-cols-1"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}
              >
                <Button
                  type="button"
                  variant={isUnknown ? "default" : "outline"}
                  onClick={() => {
                    const newValue = !field.value;
                    field.onChange(newValue);
                    // Clear rating when marking as unknown (mutually exclusive)
                    if (newValue) {
                      form.setValue("rating_score", null, {
                        shouldDirty: true,
                      });
                    }
                  }}
                  className={cn(
                    "h-full justify-start text-left transition-all duration-200",
                    isUnknown &&
                      "bg-primary text-primary-foreground border-primary",
                    isMobile && "min-h-[44px]",
                    !isMobile && "h-full"
                  )}
                >
                  <div
                    className={`flex items-center ${isMobile ? "space-x-2" : "space-x-3"} w-full`}
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-semibold ${isMobile ? "text-sm" : "text-sm"} mb-1`}
                      >
                        I don't know / I'm unsure
                      </div>
                      <div className={`text-xs opacity-90 text-wrap`}>
                        Select this if you're unable to provide a rating for
                        this question
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

interface OptionButtonProps {
  rating: {
    id: string;
    value: number;
    name: string;
    description?: string;
  };
  isSelected: boolean;
  isMobile: boolean;
  field: any;
  form: any;
}

function OptionButton({
  rating,
  isSelected,
  isMobile,
  field,
  form,
}: OptionButtonProps) {
  return (
    <Button
      key={rating.id}
      type="button"
      variant={isSelected ? "default" : "outline"}
      onClick={() => {
        const newValue = isSelected ? null : rating.value;
        field.onChange(newValue);
        // Clear is_unknown when selecting a rating (mutually exclusive)
        if (newValue !== null) {
          form.setValue("is_unknown", false, { shouldDirty: true });
        }
      }}
      className={cn(
        "h-full justify-start text-left transition-all duration-200",
        isSelected && "bg-primary text-primary-foreground",
        isMobile && "min-h-[44px]"
      )}
    >
      <div
        className={`flex items-center ${
          isMobile ? "space-x-2" : "space-x-3"
        } w-full`}
      >
        {!isMobile && (
          <div className="text-xl font-bold flex-shrink-0 w-8 h-8 flex items-center justify-center">
            {rating.value}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div
            className={`font-semibold ${isMobile ? "text-xs" : "text-sm"} mb-1`}
          >
            {isMobile && rating.value + "."} {rating.name}
          </div>
          <div className="text-xs opacity-90 text-wrap">
            {rating.description || "No description"}
          </div>
        </div>
      </div>
    </Button>
  );
}
