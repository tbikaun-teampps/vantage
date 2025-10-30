import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export interface InterviewFeedback {
  interviewRating: number;
  interviewComment: string;
  experienceRating: number;
  experienceComment: string;
}

interface InterviewCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (feedback: InterviewFeedback) => void;
  isLoading?: boolean;
}

export function InterviewCompletionDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: InterviewCompletionDialogProps) {
  const [interviewRating, setInterviewRating] = useState<string>("");
  const [interviewComment, setInterviewComment] = useState("");
  const [experienceRating, setExperienceRating] = useState<string>("");
  const [experienceComment, setExperienceComment] = useState("");

  const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

  const handleConfirm = () => {
    if (!interviewRating || !experienceRating) return;

    onConfirm({
      interviewRating: parseInt(interviewRating),
      interviewComment,
      experienceRating: parseInt(experienceRating),
      experienceComment,
    });
  };

  const isFormValid = interviewRating !== "" && experienceRating !== "";

  return (
    <AlertDialog
      open={open}
      onOpenChange={(newOpen) => {
        // Prevent closing dialog during loading
        if (isLoading && !newOpen) return;
        onOpenChange(newOpen);
      }}
    >
      <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Congratulations!</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 flex flex-col">
            <span>You've completed the interview.</span>
            <span>
              A summary of your interview will be sent to your email address.
            </span>
            <span className="font-medium text-foreground">
              Please note: Once you complete the interview, it cannot be
              reopened or edited.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* Interview Quality Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              How would you rate the interview content?
            </Label>
            <RadioGroup
              value={interviewRating}
              onValueChange={setInterviewRating}
            >
              <div className="flex gap-4 items-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center gap-2">
                    <Label
                      htmlFor={`interview-${value}`}
                      className="text-xs text-muted-foreground cursor-pointer"
                    >
                      {ratingLabels[value - 1]}
                    </Label>
                    <RadioGroupItem
                      id={`interview-${value}`}
                      value={value.toString()}
                    />
                  </div>
                ))}
              </div>
            </RadioGroup>
            <Textarea
              placeholder="Additional comments (optional)"
              value={interviewComment}
              onChange={(e) => setInterviewComment(e.target.value)}
              className="min-h-20"
            />
          </div>

          {/* Experience Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              How would you rate your interview experience?
            </Label>
            <RadioGroup
              value={experienceRating}
              onValueChange={setExperienceRating}
            >
              <div className="flex gap-4 items-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center gap-2">
                    <Label
                      htmlFor={`experience-${value}`}
                      className="text-xs text-muted-foreground cursor-pointer"
                    >
                      {ratingLabels[value - 1]}
                    </Label>
                    <RadioGroupItem
                      id={`experience-${value}`}
                      value={value.toString()}
                    />
                  </div>
                ))}
              </div>
            </RadioGroup>
            <Textarea
              placeholder="Additional comments (optional)"
              value={experienceComment}
              onChange={(e) => setExperienceComment(e.target.value)}
              className="min-h-20"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              "Complete Interview"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
