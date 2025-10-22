import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IconClipboardList,
  IconEdit,
  IconTrash,
  IconCheck,
} from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useResponseActions } from "@/hooks/interview/useResponseActions";

interface InterviewActionsProps {
  responseId: number;
  disabled?: boolean;
}

export function InterviewActions({
  responseId,
  disabled = false,
}: InterviewActionsProps) {
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [editingAction, setEditingAction] = useState<any>(null);
  const [actionForm, setActionForm] = useState({ title: "", description: "" });
  const isMobile = useIsMobile();

  const {
    actions,
    isLoading,
    addAction,
    updateAction,
    deleteAction,
    isAdding,
    isUpdating,
    isDeleting,
  } = useResponseActions(responseId);

  const openActionDialog = (action?: any) => {
    setEditingAction(action);
    setActionForm({
      title: action?.title || "",
      description: action?.description || "",
    });
    setShowActionDialog(true);
  };

  const closeActionDialog = () => {
    setShowActionDialog(false);
    setEditingAction(null);
    setActionForm({ title: "", description: "" });
  };

  const handleActionSubmit = async () => {
    if (!actionForm.description.trim()) return;

    if (editingAction) {
      await updateAction(editingAction.id, {
        title: actionForm.title.trim() || undefined,
        description: actionForm.description.trim(),
      });
      // Clear editing state and reset form after updating
      setEditingAction(null);
      setActionForm({ title: "", description: "" });
    } else {
      await addAction({
        title: actionForm.title.trim() || undefined,
        description: actionForm.description.trim(),
      });
      // Reset form for next action but keep dialog open
      setActionForm({ title: "", description: "" });
    }
  };

  const handleDeleteAction = async (actionId: number) => {
    await deleteAction(actionId);
  };

  const isSubmitting = isAdding || isUpdating || isDeleting;

  return (
    // <div className={"flex items-center space-x-2"}>
    <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
      <DialogTrigger asChild>
        <Button
          data-tour="interview-follow-up-actions"
          variant="outline"
          className="flex items-center space-x-2"
          disabled={disabled}
          size="sm"
        >
          <IconClipboardList className="h-4 w-4" />
          {!isMobile && <span>Follow-up Actions</span>}
          {actions.length > 0 && (
            <Badge variant="secondary" className={isMobile ? "" : "ml-2"}>
              {actions.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-h-[80vh] ${isMobile ? "" : "max-w-4xl"}`}>
        <DialogHeader>
          <DialogTitle>Follow-up Actions</DialogTitle>
          <DialogDescription>
            Manage action items and next steps for this question response.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 min-h-0">
          {/* Actions List */}
          <div className="flex-1 min-h-0">
            {actions.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <IconClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  No follow-up actions yet
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Add actions to track next steps for this question
                </p>
              </div>
            ) : (
              // <ScrollArea className="h-[300px] w-full">
              <div className="space-y-3 mb-4">
                {actions.map((action: any, index: number) => (
                  <Card key={action.id} className="relative group">
                    <CardContent>
                      <div className="flex items-start justify-between space-x-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Action {index + 1}
                            </Badge>
                            {action.title && (
                              <h4 className="font-medium text-sm truncate">
                                {action.title}
                              </h4>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {action.description}
                          </p>

                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>
                              Created{" "}
                              {new Date(action.created_at).toLocaleDateString()}
                            </span>
                            {action.updated_at !== action.created_at && (
                              <span>
                                Updated{" "}
                                {new Date(
                                  action.updated_at
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openActionDialog(action)}
                            className="h-8 w-8 p-0"
                          >
                            <IconEdit className="h-3 w-3" />
                            <span className="sr-only">Edit action</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAction(action.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <IconTrash className="h-3 w-3" />
                            <span className="sr-only">Delete action</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              // </ScrollArea>
            )}
          </div>

          {/* Add New Action Form */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                {editingAction ? "Edit Action" : "Add New Action"}
              </h3>
              {editingAction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAction(null);
                    setActionForm({ title: "", description: "" });
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="action-title">Title (Optional)</Label>
                <Input
                  id="action-title"
                  placeholder="e.g., Follow up on safety training"
                  value={actionForm.title}
                  onChange={(e) =>
                    setActionForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action-description">Description *</Label>
                <Textarea
                  id="action-description"
                  placeholder="Describe the action that needs to be taken..."
                  value={actionForm.description}
                  onChange={(e) =>
                    setActionForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeActionDialog}>
            Close
          </Button>
          <Button
            onClick={handleActionSubmit}
            disabled={!actionForm.description.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {editingAction ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>
                <IconCheck className="h-4 w-4 mr-2" />
                {editingAction ? "Update Action" : "Add Action"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    // {/* </div> */}
  );
}
