import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useFeedbackDialogContext } from "@/contexts/FeedbackDialogContext";

export function FeedbackButton() {
  const { openDialog } = useFeedbackDialogContext();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={openDialog}
            className="h-8 w-8 p-0"
            aria-label="Send feedback"
            data-tour="feedback-button"
          >
            <MessageCircle className="h-4 w-4 dark:text-white" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Send feedback</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function FeedbackDropdownMenuItem({ label }: { label?: string }) {
  const { openDialog } = useFeedbackDialogContext();

  return (
    <DropdownMenuItem onClick={openDialog}>
      {label || "Send Feedback"}
    </DropdownMenuItem>
  );
}
