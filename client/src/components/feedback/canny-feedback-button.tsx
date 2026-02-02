import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CannyFeedbackButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 p-0"
            aria-label="Send feedback"
            data-tour="feedback-button"
          >
            <a data-canny-link href="https://team-pps.canny.io" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 dark:text-white" />
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Send feedback</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}