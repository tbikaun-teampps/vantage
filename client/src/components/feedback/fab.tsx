import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFeedbackActions } from "@/hooks/useFeedback";
import { toast } from "sonner";
import type { FeedbackType } from "@/types/api/feedback";

export default function FeedbackFloatingActionButton() {
  const { submitFeedback, isSubmitting, feedbackError, resetErrors } =
    useFeedbackActions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<FeedbackType>("general");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    try {
      await submitFeedback({ message: message.trim(), type });
      toast.success("Thank you for your feedback!");
      setMessage("");
      setType("general");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit feedback"
      );
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setMessage("");
    setType("general");
    resetErrors();
  };

  return (
    <>
      {/* Floating Action Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-[#eb59ff] to-[#032a83] hover:from-[#f472b6] hover:to-[#1e40af] border-0"
              aria-label="Send feedback"
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            className="bg-popover text-popover-foreground"
          >
            <p className="text-sm">Send feedback</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Feedback Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Send Feedback
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {feedbackError && (
              <Alert variant="destructive">
                <AlertDescription>{feedbackError.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="feedback-type">Type</Label>
              <Select
                value={type}
                onValueChange={(value: FeedbackType) => setType(value)}
              >
                <SelectTrigger id="feedback-type">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Feedback</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="suggestion">
                    Improvement Suggestion
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-message">Message</Label>
              <Textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind..."
                className="min-h-[100px] resize-none"
                maxLength={1000}
                required
              />
              <div className="text-xs text-muted-foreground text-right">
                {message.length}/1000
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
