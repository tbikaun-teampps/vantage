import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQuestionActions } from "@/hooks/questionnaire/useQuestions";
import { useAllSharedRoles } from "@/hooks/useSharedRoles";
import type {
  QuestionWithRatingScales,
  QuestionRatingScaleWithDetails,
  QuestionnaireRatingScale,
} from "@/types/assessment";
import MultiSelect from "../multi-select";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconChevronDown,
  IconChevronUp,
  IconStack,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionRatingScaleDialog } from "../question-rating-scale-dialog";

// Zod schema for question validation
const questionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  question_text: z
    .string()
    .min(1, "Question text is required")
    .max(2000, "Question text must be less than 2000 characters"),
  context: z
    .string()
    .max(1000, "Context must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionEditorProps {
  question: QuestionWithRatingScales;
  onChange: (question: QuestionWithRatingScales) => void;
  onSave?: (updates: Partial<QuestionFormData>) => Promise<void>;
  disabled?: boolean;
  questionDisplayNumber: string;
  availableRatingScales?: QuestionnaireRatingScale[];
}

export function QuestionEditor({
  question,
  onChange,
  onSave,
  questionDisplayNumber,
  disabled = false,
  availableRatingScales = [],
}: QuestionEditorProps) {
  const { updateQuestionRatingScales } = useQuestionActions();
  const { data: sharedRoles = [] } = useAllSharedRoles();

  // Initialize React Hook Form with Zod validation
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: question.title || "",
      question_text: question.question_text || "",
      context: question.context || "",
    },
  });

  // Get dirty fields for the save button
  const { isDirty, dirtyFields } = form.formState;

  // Reset form when question changes
  React.useEffect(() => {
    form.reset({
      title: question.title || "",
      question_text: question.question_text || "",
      context: question.context || "",
    });
  }, [question, form]);

  // Handle form submission - only send dirty fields
  const handleSave = async (data: QuestionFormData) => {
    if (!isDirty || !onSave) return;

    // Create update object with only dirty fields
    const updates: Partial<QuestionFormData> = {};
    if (dirtyFields.title) updates.title = data.title;
    if (dirtyFields.question_text) updates.question_text = data.question_text;
    if (dirtyFields.context) updates.context = data.context;

    try {
      await onSave(updates);
      // Reset dirty state after successful update
      form.reset(data);
    } catch (error) {
      // Error is handled by the parent component
      console.error("Failed to update question:", error);
    }
  };

  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [editingRating, setEditingRating] =
    useState<QuestionRatingScaleWithDetails | null>(null);
  const [ratingFormData, setRatingFormData] = useState({
    ratingScaleId: "",
    description: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [ratingSectionExpanded, setRatingSectionExpanded] = useState(true);
  const [deleteRatingScale, setDeleteRatingScale] =
    useState<QuestionRatingScaleWithDetails | null>(null);

  const assignedRatingScaleIds =
    question.question_rating_scales?.map(
      (qrs) => qrs.questionnaire_rating_scale_id
    ) || [];
  const unassignedRatingScales = availableRatingScales.filter(
    (rs) => !assignedRatingScaleIds.includes(rs.id)
  );

  const handleAddRatingScale = () => {
    if (disabled) return;

    setRatingFormData({ ratingScaleId: "", description: "" });
    setEditingRating(null);
    setShowRatingDialog(true);
  };

  const handleAddAllRatingScales = async () => {
    if (disabled || isProcessing || unassignedRatingScales.length === 0) return;

    setIsProcessing(true);
    try {
      // Create associations for all unassigned rating scales using their default descriptions
      const allAssociations = [
        // Keep existing associations
        ...(question.question_rating_scales || []).map((qrs) => ({
          ratingScaleId: qrs.questionnaire_rating_scale_id,
          description: qrs.description,
        })),
        // Add new associations for all unassigned scales
        ...unassignedRatingScales.map((scale) => ({
          ratingScaleId: scale.id,
          description:
            scale.description || `Rating level ${scale.value} - ${scale.name}`,
        })),
      ];

      await updateQuestionRatingScales({
        questionId: question.id,
        ratingScaleAssociations: allAssociations,
      });

      toast.success(
        `Added ${unassignedRatingScales.length} rating scale${
          unassignedRatingScales.length !== 1 ? "s" : ""
        } with default descriptions`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add all rating scales"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditRatingScale = (
    ratingScale: QuestionRatingScaleWithDetails
  ) => {
    if (disabled) return;

    setRatingFormData({
      ratingScaleId: ratingScale.questionnaire_rating_scale_id,
      description: ratingScale.description,
    });
    setEditingRating(ratingScale);
    setShowRatingDialog(true);
  };

  const handleSaveRatingScale = async () => {
    if (!ratingFormData.ratingScaleId || !ratingFormData.description.trim())
      return;

    setIsProcessing(true);
    try {
      const currentAssociations = question.question_rating_scales || [];
      let updatedAssociations;

      if (editingRating) {
        // Update existing association
        updatedAssociations = currentAssociations.map((qrs) =>
          qrs.id === editingRating.id
            ? {
                ratingScaleId: ratingFormData.ratingScaleId,
                description: ratingFormData.description.trim(),
              }
            : {
                ratingScaleId: qrs.questionnaire_rating_scale_id,
                description: qrs.description,
              }
        );
      } else {
        // Add new association
        updatedAssociations = [
          ...currentAssociations.map((qrs) => ({
            ratingScaleId: qrs.questionnaire_rating_scale_id,
            description: qrs.description,
          })),
          {
            ratingScaleId: ratingFormData.ratingScaleId,
            description: ratingFormData.description.trim(),
          },
        ];
      }

      await updateQuestionRatingScales({
        questionId: question.id,
        ratingScaleAssociations: updatedAssociations,
      });
      setShowRatingDialog(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save rating scale association"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRatingScale = (
    ratingScaleToDelete: QuestionRatingScaleWithDetails
  ) => {
    if (disabled) return;
    setDeleteRatingScale(ratingScaleToDelete);
  };

  const confirmDeleteRatingScale = async () => {
    if (!deleteRatingScale) return;

    setIsProcessing(true);
    try {
      const updatedAssociations = (question.question_rating_scales || [])
        .filter((qrs) => qrs.id !== deleteRatingScale.id)
        .map((qrs) => ({
          ratingScaleId: qrs.questionnaire_rating_scale_id,
          description: qrs.description,
        }));

      await updateQuestionRatingScales({
        questionId: question.id,
        ratingScaleAssociations: updatedAssociations,
      });
      setDeleteRatingScale(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete rating scale association"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRatingDialog = () => {
    setShowRatingDialog(false);
    setEditingRating(null);
    setRatingFormData({ ratingScaleId: "", description: "" });
  };

  return (
    <div className="space-y-4 p-4 bg-background rounded-lg border border-border font-medium">
      <div className="flex items-center justify-between">
        <span className="text-sm">{questionDisplayNumber}</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter concise question title..."
                    disabled={disabled}
                    onChange={(e) => {
                      field.onChange(e);
                      // Update parent state for immediate UI feedback
                      onChange({ ...question, title: e.target.value });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="question_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Text</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="min-h-[160px]"
                    placeholder="Enter the full question text..."
                    disabled={disabled}
                    onChange={(e) => {
                      field.onChange(e);
                      // Update parent state for immediate UI feedback
                      onChange({ ...question, question_text: e.target.value });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="context"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Context</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="min-h-[160px]"
                    placeholder="Provide additional context or instructions for this question"
                    disabled={disabled}
                    onChange={(e) => {
                      field.onChange(e);
                      // Update parent state for immediate UI feedback
                      onChange({ ...question, context: e.target.value });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label>Rating Scales</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRatingScale}
              disabled={
                disabled || isProcessing || unassignedRatingScales.length === 0
              }
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Add Rating Scale
            </Button>
            {unassignedRatingScales.length > 1 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddAllRatingScales}
                    disabled={disabled || isProcessing}
                    className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                  >
                    <IconStack className="h-4 w-4 mr-2" />
                    Add All ({unassignedRatingScales.length})
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Add all unassigned rating scales with their default
                    descriptions
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRatingSectionExpanded(!ratingSectionExpanded)}
              className="p-1 h-8 w-8"
            >
              {ratingSectionExpanded ? (
                <IconChevronUp className="h-4 w-4" />
              ) : (
                <IconChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {ratingSectionExpanded && (
          <div className="space-y-4">
            {unassignedRatingScales.length === 0 &&
              availableRatingScales.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  All available rating scales have been assigned to this
                  question.
                </p>
              )}

            {availableRatingScales.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No rating scales available. Create rating scales in the Ratings
                tab first.
              </p>
            )}

            <div className="space-y-4">
              {question.question_rating_scales &&
              question.question_rating_scales.length > 0 ? (
                question.question_rating_scales.map((qrs) => (
                  <div
                    key={qrs.id}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{qrs.value}</Badge>
                        <span className="font-medium">{qrs.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRatingScale(qrs)}
                          disabled={disabled || isProcessing}
                        >
                          <IconEdit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRatingScale(qrs)}
                          disabled={disabled || isProcessing}
                          className="text-destructive hover:text-destructive"
                        >
                          <IconTrash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {qrs.description}
                    </p>
                    {qrs.description && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Scale: {qrs.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                  No rating scales assigned to this question
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label>Applicable Roles</Label>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          These are all roles available in the system. When conducting
          interviews, only roles that exist in the company&apos;s organisational
          structure will be available for selection. Leave empty to apply to all
          roles.
        </p>

        {sharedRoles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No shared roles available. Create shared roles in settings first.
          </p>
        ) : (
          <MultiSelect
            options={sharedRoles.map((role) => ({
              id: role.id,
              name: role.name,
              description: role.description,
            }))}
            value={question.question_roles?.map((qar) => qar.role.name) || []}
            searchable={true}
            onChange={(selectedRoleNames) => {
              if (disabled || isProcessing) return;

              // Map role names to role objects for the question data
              const selectedRoles = sharedRoles.filter((role) =>
                selectedRoleNames.includes(role.name)
              );

              // Update question with new role associations
              const updatedQuestion = {
                ...question,
                question_roles: selectedRoles.map((role) => ({
                  id: `temp_${role.id}`, // Temporary ID for new associations
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  created_by: "",
                  questionnaire_question_id: question.id,
                  shared_role_id: role.id,
                  role: {
                    id: role.id,
                    name: role.name,
                    description: role.description,
                    created_at: new Date().toISOString(),
                    created_by: "",
                  },
                })),
              };

              onChange(updatedQuestion);
            }}
            placeholder="Select roles or leave empty to apply to all roles..."
            disabled={disabled || isProcessing}
          />
        )}
      </div>

      {/* Save Button - only show when there are changes */}
      {isDirty && onSave && (
        <div className="flex items-center gap-2 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span>You have unsaved changes</span>
          </div>
          <div className="flex-1" />
          <Button
            onClick={form.handleSubmit(handleSave)}
            disabled={disabled || !isDirty}
            size="sm"
          >
            <IconDeviceFloppy className="h-4 w-4 mr-2" />
            {disabled ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}

      {/* Rating Scale Assignment Dialog */}
      <QuestionRatingScaleDialog
        open={showRatingDialog}
        handleClose={handleCancelRatingDialog}
        isEditing={editingRating}
        data={ratingFormData}
        setData={setRatingFormData}
        isProcessing={isProcessing}
        unassignedRatingScales={unassignedRatingScales}
        handleSaveRatingScale={handleSaveRatingScale}
      />

      {/* Delete Rating Scale Confirmation Dialog */}
      <AlertDialog
        open={!!deleteRatingScale}
        onOpenChange={() => setDeleteRatingScale(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Rating Scale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the &quot;
              {deleteRatingScale?.rating_scale.name}&quot; rating scale from
              this question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRatingScale}
              disabled={isProcessing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing ? "Removing..." : "Remove Rating Scale"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
