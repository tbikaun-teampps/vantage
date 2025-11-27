import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { useRatingScaleActions } from "@/hooks/questionnaire/useRatingScales";
import { ratingScaleSets } from "@/lib/library/rating-scales";
import { toast } from "sonner";
import { formatDistance } from "date-fns";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";
import type {
  BatchCreateQuestionnaireRatingScalesBodyData,
  GetQuestionnaireRatingScalesResponseData,
} from "@/types/api/questionnaire";

interface RatingsFormProps {
  ratings: GetQuestionnaireRatingScalesResponseData;
  questionnaireId: number;
  isLoading?: boolean;
  onAddRating?: () => void;
  showActions?: boolean;
  disabled?: boolean;
}

export default function RatingsForm({
  ratings,
  questionnaireId,
  isLoading = false,
  onAddRating,
  showActions = true,
  disabled = false,
}: RatingsFormProps) {
  const userCanAdmin = useCanAdmin();

  const {
    createRatingScale,
    createRatingScalesBatch,
    updateRatingScale,
    deleteRatingScale,
    isCreatingRatingScale,
    isUpdatingRatingScale,
    isDeletingRatingScale,
  } = useRatingScaleActions(questionnaireId);

  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [editingRating, setEditingRating] = useState<
    GetQuestionnaireRatingScalesResponseData[number] | null
  >(null);
  const [formData, setFormData] = useState({
    value: "",
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derive processing state from React Query mutations
  const isProcessing =
    isCreatingRatingScale || isUpdatingRatingScale || isDeletingRatingScale;
  const [deleteRating, setDeleteRating] =
    useState<GetQuestionnaireRatingScalesResponseData[number] | null>(null);

  // Rating scale library state
  const [selectedTab, setSelectedTab] = useState("create");

  const resetForm = () => {
    setFormData({ value: "", name: "", description: "" });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Rating name is required";
    }

    if (!formData.value.trim()) {
      newErrors.value = "Rating value is required";
    } else {
      const numValue = parseInt(formData.value);
      if (isNaN(numValue) || numValue < 0) {
        newErrors.value = "Rating value must be 0 or greater";
      } else {
        // Check for duplicate values (excluding current editing item)
        const existingRating = ratings.find(
          (r) =>
            r.value === numValue &&
            (!editingRating || r.id !== editingRating.id)
        );
        if (existingRating) {
          newErrors.value = "This rating value already exists";
        }
      }
    }

    // Check for duplicate names (excluding current editing item)
    const existingName = ratings.find(
      (r) =>
        r.name.toLowerCase() === formData.name.toLowerCase().trim() &&
        (!editingRating || r.id !== editingRating.id)
    );
    if (existingName) {
      newErrors.name = "This rating name already exists";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddClick = () => {
    if (onAddRating) {
      onAddRating();
    } else {
      setShowAddDialog(true);
    }
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    await createRatingScale({
      questionnaireId,
      ratingData: {
        value: parseInt(formData.value),
        name: formData.name.trim(),
        description: formData.description.trim(),
      },
    });

    resetForm();
    setShowAddDialog(false);
  };

  const handleUpdate = async () => {
    if (!validateForm() || !editingRating) return;
    // Build updates object with only dirty fields
    const updates: Record<string, any> = {};

    if (parseInt(formData.value) !== editingRating.value) {
      updates.value = parseInt(formData.value);
    }

    if (formData.name.trim() !== editingRating.name) {
      updates.name = formData.name.trim();
    }

    if (formData.description.trim() !== (editingRating.description || "")) {
      updates.description = formData.description.trim();
    }

    // If nothing changed, just close the dialog
    if (Object.keys(updates).length === 0) {
      resetForm();
      setEditingRating(null);
      toast.info("No changes to save");
      return;
    }

    await updateRatingScale({
      id: editingRating.id,
      updates,
    });

    resetForm();
    setEditingRating(null);
  };

  const handleEdit = (
    rating: GetQuestionnaireRatingScalesResponseData[number]
  ) => {
    setFormData({
      value: rating.value.toString(),
      name: rating.name,
      description: rating.description || "",
    });
    setEditingRating(rating);
  };

  const handleDelete = (
    rating: GetQuestionnaireRatingScalesResponseData[number]
  ) => {
    setDeleteRating(rating);
    // Close the edit dialog if open
    setEditingRating(null);
  };

  const confirmDelete = async () => {
    if (!deleteRating) return;
    await deleteRatingScale(deleteRating.id);
    setDeleteRating(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowAddDialog(false);
    setEditingRating(null);
    setSelectedTab("create");
  };

  const handleUseRatingSet = async (
    data: BatchCreateQuestionnaireRatingScalesBodyData
  ) => {
    await createRatingScalesBatch(data);

    setShowAddDialog(false);
    setSelectedTab("create");
  };

  const sortedRatings = [...ratings].sort((a, b) => a.value - b.value);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading rating scales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showActions && userCanAdmin && (
        <div className="flex items-center justify-between">
          <Button
            onClick={handleAddClick}
            size="sm"
            disabled={isProcessing || disabled}
          >
            <IconPlus className="h-4 w-4 mr-2" />
            Add Rating
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {sortedRatings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="space-y-3">
              <p>No rating levels defined yet</p>
              {userCanAdmin && (
                <Button
                  variant="outline"
                  onClick={handleAddClick}
                  disabled={isProcessing || disabled}
                >
                  <IconPlus className="h-4 w-4 mr-2" />
                  Add First Rating
                </Button>
              )}
            </div>
          </div>
        ) : (
          sortedRatings
            .sort((a, b) => a.value - b.value)
            .map((rating) => (
              <div
                key={rating.id}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-[40px]">
                      <Badge variant="outline">{rating.value}</Badge>
                    </div>
                    <h3 className="font-medium">{rating.name}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      Created:{" "}
                      {formatDistance(new Date(rating.created_at), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Updated:{" "}
                      {formatDistance(new Date(rating.updated_at), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                    {userCanAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(rating)}
                        disabled={isProcessing || disabled}
                      >
                        <IconEdit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {rating.description && (
                  <p className="text-sm text-muted-foreground ml-[40px]">
                    {rating.description}
                  </p>
                )}
              </div>
            ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={showAddDialog || !!editingRating}
        onOpenChange={() => {
          if (showAddDialog || editingRating) {
            handleCancel();
          }
        }}
      >
        <DialogContent className={!editingRating ? "max-w-4xl" : undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingRating ? "Edit Rating" : "Add New Rating"}
            </DialogTitle>
            <DialogDescription>
              {editingRating
                ? "Update the rating level details."
                : "Create individual rating levels or choose from pre-built rating scale sets."}
            </DialogDescription>
          </DialogHeader>

          {editingRating ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    placeholder="e.g., 0, 1, 2, 3..."
                    className={errors.value ? "border-destructive" : ""}
                    disabled={isProcessing || disabled}
                  />
                  {errors.value && (
                    <p className="text-sm text-destructive">{errors.value}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Poor, Good, Excellent"
                    className={errors.name ? "border-destructive" : ""}
                    disabled={isProcessing || disabled}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Description of what this rating level means... (optional)"
                  className="min-h-[80px]"
                  disabled={isProcessing || disabled}
                />
              </div>
            </div>
          ) : (
            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Individual</TabsTrigger>
                <TabsTrigger value="library">From Scale Sets</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Value *</Label>
                    <Input
                      id="value"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                      placeholder="e.g., 0, 1, 2, 3..."
                      className={errors.value ? "border-destructive" : ""}
                      disabled={isProcessing || disabled}
                    />
                    {errors.value && (
                      <p className="text-sm text-destructive">{errors.value}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Poor, Good, Excellent"
                      className={errors.name ? "border-destructive" : ""}
                      disabled={isProcessing || disabled}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Description of what this rating level means... (optional)"
                    className="min-h-[80px]"
                    disabled={isProcessing || disabled}
                  />
                </div>
              </TabsContent>

              <TabsContent value="library" className="space-y-4">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    {ratingScaleSets.map((scaleSet, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:bg-accent transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h4 className="font-medium text-sm">
                                  {scaleSet.name}
                                </h4>
                                <Badge variant="secondary" className="text-xs">
                                  {scaleSet.category}
                                </Badge>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground">
                              {scaleSet.description}
                            </p>

                            <div className="space-y-2">
                              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Rating Levels ({scaleSet.scales.length})
                              </h5>
                              <div className="grid grid-cols-1 gap-2">
                                {scaleSet.scales.map((scale) => (
                                  <div
                                    key={scale.value}
                                    className="flex items-center gap-3 p-2 bg-muted/50 rounded"
                                  >
                                    <Badge
                                      variant="outline"
                                      className="font-mono text-xs"
                                    >
                                      {scale.value}
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm font-medium">
                                        {scale.name}
                                      </span>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {scale.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-end pt-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUseRatingSet({
                                    scales: scaleSet.scales,
                                  })
                                }
                                disabled={isProcessing || disabled}
                              >
                                Use This Scale Set
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <div className="flex w-full justify-between">
              {/* Delete button - only show when editing */}
              <div>
                {editingRating && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleDelete(editingRating)}
                    disabled={isProcessing}
                  >
                    <IconTrash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>

              {/* Cancel and Save buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isProcessing}
                >
                  <IconX className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={editingRating ? handleUpdate : handleAdd}
                  disabled={
                    !formData.name.trim() ||
                    !formData.value.trim() ||
                    isProcessing
                  }
                >
                  <IconCheck className="h-4 w-4 mr-2" />
                  {isProcessing
                    ? editingRating
                      ? "Updating..."
                      : "Adding..."
                    : editingRating
                      ? "Update Rating"
                      : "Add Rating"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteRating}
        onOpenChange={() => setDeleteRating(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rating Scale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the rating "{deleteRating?.name}"?
              This action cannot be undone.{" "}
              <strong>
                If this rating scale is assigned to any questions, deletion will
                fail.
              </strong>{" "}
              You must first remove it from all questions that use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isProcessing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing ? "Deleting..." : "Delete Rating"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
