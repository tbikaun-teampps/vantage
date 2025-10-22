import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { IconMessageCircle, IconCheck } from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useComments } from "@/hooks/interview/useComments";

interface InterviewCommentsProps {
  disabled?: boolean;
  responseId: number;
}

interface InterviewCommentsContentProps {
  disabled?: boolean;
  responseId: number;
  onClose?: () => void;
  showLabel?: boolean;
}

// Extracted content component that can be used in both Dialog and Drawer
export function InterviewCommentsContent({
  disabled = false,
  responseId,
  onClose,
  showLabel = true,
}: InterviewCommentsContentProps) {
  const [commentText, setCommentText] = useState("");

  const { comments, isLoading, updateComments, isUpdating } =
    useComments(responseId);

  // Initialize commentText when comments load
  useEffect(() => {
    setCommentText(comments);
  }, [comments]);

  const currentCommentValue = commentText || comments;
  const hasUnsavedChanges = commentText !== "" && commentText !== comments;

  const handleCommentChange = (value: string) => {
    setCommentText(value);
  };

  const handleSaveComments = async () => {
    await updateComments(commentText);
    setCommentText(""); // Reset to use hook's value
  };

  const handleCancel = () => {
    setCommentText(comments); // Reset to hook's value
  };

  return (
    <div className="space-y-4">
      <div>
        {showLabel && (
          <label htmlFor="comments" className="block text-sm font-medium mb-2">
            Comments
          </label>
        )}
        <Textarea
          id="comments"
          placeholder="Add your comments about this question response..."
          value={currentCommentValue}
          onChange={(e) => handleCommentChange(e.target.value)}
          className="min-h-[200px] resize-y"
          disabled={disabled || isLoading}
        />
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-muted-foreground">
            {currentCommentValue.length} characters
          </div>
          {hasUnsavedChanges && (
            <div className="text-xs text-amber-600">Unsaved changes</div>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={!hasUnsavedChanges || isUpdating}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSaveComments}
          disabled={!hasUnsavedChanges || isUpdating}
        >
          {isUpdating ? (
            "Saving..."
          ) : (
            <>
              <IconCheck className="h-4 w-4 mr-1" />
              Save Comments
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function InterviewComments({
  disabled = false,
  responseId,
}: InterviewCommentsProps) {
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const { comments } = useComments(responseId);
  const hasComments = comments && comments.trim().length > 0;

  return (
    <Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
          disabled={disabled}
        >
          <IconMessageCircle className="h-4 w-4" />
          {!isMobile && <span>Comments</span>}
          {hasComments && (
            <Badge variant="secondary" className={isMobile ? "" : "ml-2"}>
              ✓
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-h-[80vh] ${isMobile ? "" : "max-w-4xl"}`}>
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>
            Add comments to support your assessment of this question response.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <InterviewCommentsContent
            responseId={responseId}
            disabled={disabled}
            onClose={() => setCommentsDialogOpen(false)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setCommentsDialogOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
