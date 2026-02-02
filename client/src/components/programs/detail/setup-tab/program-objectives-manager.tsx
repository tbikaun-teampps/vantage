import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconTarget,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import {
  useProgramObjectives,
  useCreateObjective,
  useUpdateObjective,
  useDeleteObjective,
} from "@/hooks/useProgramObjectives";
import type { ProgramObjective } from "@/types/api/programs";

interface ProgramObjectivesManagerProps {
  programId: number;
}

interface ObjectiveFormData {
  name: string;
  description: string;
}

export function ProgramObjectivesManager({
  programId,
}: ProgramObjectivesManagerProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [objectiveToDelete, setObjectiveToDelete] =
    useState<ProgramObjective | null>(null);
  const [formData, setFormData] = useState<ObjectiveFormData>({
    name: "",
    description: "",
  });

  const { data: objectives, isLoading } = useProgramObjectives(programId);
  const createObjectiveMutation = useCreateObjective();
  const updateObjectiveMutation = useUpdateObjective();
  const deleteObjectiveMutation = useDeleteObjective();

  const handleStartCreate = () => {
    setFormData({ name: "", description: "" });
    setIsCreating(true);
  };

  const handleStartEdit = (objective: ProgramObjective) => {
    setFormData({
      name: objective.name,
      description: objective.description || "",
    });
    setEditingId(objective.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: "", description: "" });
  };

  const handleSaveCreate = async () => {
    if (!formData.name.trim()) return;

    try {
      await createObjectiveMutation.mutateAsync({
        programId,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,

        }
      });
      setIsCreating(false);
      setFormData({ name: "", description: "" });
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId || !formData.name.trim()) return;

    try {
      await updateObjectiveMutation.mutateAsync({
        id: editingId,
        programId: programId,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        },
      });
      setEditingId(null);
      setFormData({ name: "", description: "" });
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleDeleteClick = (objective: ProgramObjective) => {
    setObjectiveToDelete(objective);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!objectiveToDelete) return;

    try {
      await deleteObjectiveMutation.mutateAsync({
        id: objectiveToDelete.id,
        programId: programId,
      });
      setShowDeleteDialog(false);
      setObjectiveToDelete(null);
    } catch {
      // Error handling is done in the hook
    }
  };

  const isLoading_any =
    createObjectiveMutation.isPending ||
    updateObjectiveMutation.isPending ||
    deleteObjectiveMutation.isPending;

  if (!objectives) return null;

  const canDelete = objectives.length > 1; // Enforce minimum one objective constraint

  if (isLoading) {
    return (
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTarget className="h-5 w-5" />
            Program Objectives
          </CardTitle>
          <CardDescription>Loading objectives...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-none border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Program Objectives
              </CardTitle>
              <CardDescription>
                {objectives.length} objective
                {objectives.length !== 1 ? "s" : ""} defined for this program
              </CardDescription>
            </div>
            <Button
              onClick={handleStartCreate}
              size="sm"
              disabled={isCreating || isLoading_any}
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Add Objective
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Create form */}
            {isCreating && (
              <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
                <Input
                  placeholder="Objective name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  disabled={isLoading_any}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  disabled={isLoading_any}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveCreate}
                    disabled={!formData.name.trim() || isLoading_any}
                  >
                    <IconCheck className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isLoading_any}
                  >
                    <IconX className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Existing objectives */}
            {objectives.map((objective) => (
              <div
                key={objective.id}
                className="border rounded-lg p-4 space-y-2"
              >
                {editingId === objective.id ? (
                  // Edit form
                  <div className="space-y-3">
                    <Input
                      placeholder="Objective name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      disabled={isLoading_any}
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      disabled={isLoading_any}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={!formData.name.trim() || isLoading_any}
                      >
                        <IconCheck className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isLoading_any}
                      >
                        <IconX className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <>
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{objective.name}</h4>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground mr-2">
                          {formatDistanceToNow(new Date(objective.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(objective)}
                          disabled={
                            editingId !== null || isCreating || isLoading_any
                          }
                        >
                          <IconEdit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(objective)}
                          disabled={
                            !canDelete ||
                            editingId !== null ||
                            isCreating ||
                            isLoading_any
                          }
                          className="text-destructive hover:text-destructive"
                        >
                          <IconTrash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {objective.description && (
                      <p className="text-sm text-muted-foreground">
                        {objective.description}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}

            {objectives.length === 0 && !isCreating && (
              <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                <IconTarget className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No objectives found</p>
                <p className="text-sm mb-4">
                  Objectives help define what this program aims to achieve
                </p>
                <Button onClick={handleStartCreate}>
                  <IconPlus className="h-4 w-4 mr-2" />
                  Add First Objective
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Objective</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{objectiveToDelete?.name}"? This
              action cannot be undone.
              {!canDelete && (
                <span className="block mt-2 text-destructive font-medium">
                  You cannot delete this objective because programs must have at
                  least one objective.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={!canDelete || deleteObjectiveMutation.isPending}
            >
              {deleteObjectiveMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
