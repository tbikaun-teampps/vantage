import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { IconPencil } from "@tabler/icons-react";
import { toast } from "sonner";
import { QuestionRatingScaleDialog } from "@/components/questionnaires/detail/questions/question-editor/question-rating-scale-dialog";
import type {
  QuestionWithRatingScales,
  QuestionRatingScaleWithDetails,
  QuestionnaireRatingScale,
} from "@/types/assessment";
import { useQuestionActions } from "@/hooks/questionnaire/useQuestions";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";

interface InlineRatingScalesEditorProps {
  question: QuestionWithRatingScales;
  availableRatingScales?: QuestionnaireRatingScale[];
  disabled?: boolean;
  questionnaireId?: number; // Needed for bulk adding all rating scales
}

export function InlineRatingScalesEditor({
  question,
  availableRatingScales = [],
  disabled = false,
}: InlineRatingScalesEditorProps) {
  const userCanAdmin = useCanAdmin();

  const {
    addQuestionRatingScale,
    isAddingRatingScale,
    updateQuestionRatingScale,
    isUpdatingRatingScale,
    isDeletingRatingScale,
    isAddingAllRatingScales,
  } = useQuestionActions();

  const isLoading =
    isAddingRatingScale ||
    isUpdatingRatingScale ||
    isDeletingRatingScale ||
    isAddingAllRatingScales;
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [editingRating, setEditingRating] =
    useState<QuestionRatingScaleWithDetails | null>(null);
  const [ratingFormData, setRatingFormData] = useState({
    ratingScaleId: "",
    description: "",
  });

  const assignedRatingScaleIds =
    question.question_rating_scales?.map(
      (qrs) => qrs.questionnaire_rating_scale_id
    ) || [];
  const unassignedRatingScales = availableRatingScales.filter(
    (rs) => !assignedRatingScaleIds.includes(rs.id)
  );

  const handleEditRatingScale = (
    ratingScale: QuestionRatingScaleWithDetails
  ) => {
    setRatingFormData({
      ratingScaleId: ratingScale.questionnaire_rating_scale_id.toString(),
      description: ratingScale.description,
    });
    setEditingRating(ratingScale);
    setShowRatingDialog(true);
  };

  const handleSaveRatingScale = async () => {
    if (!ratingFormData.ratingScaleId || !ratingFormData.description.trim())
      return;

    try {
      if (editingRating) {
        // Update existing association
        await updateQuestionRatingScale({
          questionId: question.id,
          questionRatingScaleId: editingRating.id,
          description: ratingFormData.description.trim(),
        });
      } else {
        // Add new association
        await addQuestionRatingScale({
          questionId: question.id,
          questionnaire_rating_scale_id: parseInt(ratingFormData.ratingScaleId),
          description: ratingFormData.description.trim(),
        });
      }

      setShowRatingDialog(false);
      toast.success(
        editingRating
          ? "Rating scale updated successfully"
          : "Rating scale added successfully"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save rating scale"
      );
    }
  };

  const handleCancelRatingDialog = () => {
    setShowRatingDialog(false);
    setEditingRating(null);
    setRatingFormData({ ratingScaleId: "", description: "" });
  };

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="grid w-full gap-2">
        <Label htmlFor="rating-scales">Question Rating Scales</Label>
        <span className="text-xs text-muted-foreground">
          Update the descriptions of rating scales specific to this question.
        </span>
        <div id="rating-scales" className="space-y-2">
          {question.question_rating_scales &&
          question.question_rating_scales.length > 0 ? (
            question.question_rating_scales
              .sort((a, b) => a.value - b.value)
              .map((qrs) => (
                <div
                  key={qrs.id}
                  className="text-sm bg-muted/50 rounded-md p-2 border border-border"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-[40px]">
                        <Badge variant="outline" className="text-xs">
                          {qrs.value}
                        </Badge>
                      </div>
                      <span className="font-medium">{qrs.name}</span>
                    </div>
                    {userCanAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 cursor-pointer"
                        onClick={() => handleEditRatingScale(qrs)}
                        disabled={disabled}
                      >
                        <IconPencil className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="ml-[40px]">
                    <p className="text-muted-foreground">{qrs.description}</p>
                  </div>
                </div>
              ))
          ) : (
            <div className="border border-border rounded p-4 text-center">
              <span className="text-sm text-muted-foreground">
                No rating scales assigned yet
              </span>
            </div>
          )}
        </div>

        <QuestionRatingScaleDialog
          open={showRatingDialog}
          handleClose={handleCancelRatingDialog}
          isEditing={editingRating}
          data={ratingFormData}
          setData={setRatingFormData}
          isProcessing={isLoading}
          unassignedRatingScales={unassignedRatingScales}
          handleSaveRatingScale={handleSaveRatingScale}
        />
      </div>
    </div>
  );
}
