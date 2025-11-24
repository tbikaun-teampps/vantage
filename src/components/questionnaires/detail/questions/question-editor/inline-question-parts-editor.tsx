import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";
import {
  IconPlus,
  IconPencil,
  IconChevronUp,
  IconChevronDown,
  IconCopy,
  IconTableOptions,
  IconAlertCircle,
} from "@tabler/icons-react";
import { QuestionPartsDialog } from "./question-parts-dialog";
import { QuestionPartsWeightedScoringBuilder } from "./question-parts-weighted-scoring-builder";
import type { QuestionPartFormData, QuestionPart, AnswerType } from "./question-parts-types";
import {
  useQuestionParts,
  useQuestionPartsActions,
} from "@/hooks/questionnaire/useQuestionParts";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeightedScoringConfig } from "./question-parts-weighted-scoring-types";
import type {
  QuestionRatingScale,
} from "@/types/api/questionnaire";

interface InlineQuestionPartsEditorProps {
  questionId: number;
  ratingScales: QuestionRatingScale[];
  ratingScaleMapping?: WeightedScoringConfig | null;
  disabled?: boolean;
}

// Local type that extends QuestionPart
// Note: QuestionPart already includes mapping, so this is just an alias for clarity
type QuestionPartWithMapping = QuestionPart;

// Type guard helpers for options
const hasMinMax = (
  options: QuestionPart["options"]
): options is { min: number; max: number; step: number } | { min: number; max: number; decimal_places?: number } => {
  return options !== null && "min" in options && "max" in options;
};

const hasLabels = (
  options: QuestionPart["options"]
): options is { labels: string[] } => {
  return options !== null && "labels" in options;
};

const hasStep = (
  options: QuestionPart["options"]
): options is { min: number; max: number; step: number } => {
  return options !== null && "step" in options;
};

const hasDecimalPlaces = (
  options: QuestionPart["options"]
): options is { min: number; max: number; decimal_places?: number } => {
  return options !== null && "min" in options && "max" in options && !("step" in options);
};

const getDefaultFormData = (): QuestionPartFormData => ({
  text: "",
  answer_type: "boolean",
  min: "1",
  max: "5",
  step: "1",
  decimal_places: "0",
  labels: ["", ""],
});

const getAnswerTypeLabel = (answer_type: AnswerType): string => {
  const labels: Record<AnswerType, string> = {
    boolean: "Boolean",
    scale: "Scale",
    labelled_scale: "Labelled Scale",
    percentage: "Percentage",
    number: "Number",
  };
  return labels[answer_type];
};

const getAnswerTypeDetails = (part: QuestionPart): string => {
  switch (part.answer_type) {
    case "boolean":
      return `Yes / No`;
    case "scale":
      if (hasStep(part.options)) {
        return `${part.options.min || 1}-${part.options.max || 5}${part.options.step ? ` (step: ${part.options.step})` : ""}`;
      }
      return "Scale";
    case "labelled_scale":
      if (hasLabels(part.options)) {
        return part.options.labels && part.options.labels.length > 0
          ? part.options.labels.filter((l: string) => l.trim()).join(", ")
          : "No labels defined";
      }
      return "No labels defined";
    case "number":
      if (hasDecimalPlaces(part.options)) {
        return `${part.options.min || 0}-${part.options.max || 100}${part.options.decimal_places ? ` (decimal_places: ${part.options.decimal_places})` : ""}`;
      }
      return "Number";
    case "percentage":
      return "0-100%";
    default:
      return "";
  }
};

export function InlineQuestionPartsEditor({
  questionId,
  ratingScales,
  ratingScaleMapping,
  disabled = false,
}: InlineQuestionPartsEditorProps) {
  const userCanAdmin = useCanAdmin();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [showMatrixBuilder, setShowMatrixBuilder] = useState<boolean>(false);
  const [editingPart, setEditingPart] = useState<QuestionPartWithMapping | null>(null);
  const [formData, setFormData] =
    useState<QuestionPartFormData>(getDefaultFormData());

  const { data: rawQuestionParts = [], isLoading: isLoadingQuestionParts } =
    useQuestionParts(questionId);

  // Populate parts with their mappings from the question's rating_scale_mapping
  const questionParts: QuestionPartWithMapping[] = (rawQuestionParts as QuestionPart[]).map((part) => ({
    ...part,
    mapping: ratingScaleMapping?.partScoring?.[part.id.toString()] as QuestionPart["mapping"],
  }));

  const {
    createQuestionPart,
    isCreatingQuestionPart,
    createQuestionPartError,
    updateQuestionPart,
    isUpdatingQuestionPart,
    updateQuestionPartError,
    deleteQuestionPart,
    isDeletingQuestionPart,
    deleteQuestionPartError,
    duplicateQuestionPart,
    isDuplicatingQuestionPart,
    duplicateQuestionPartError,
    reorderQuestionParts,
    // isReorderingQuestionParts,
    reorderQuestionPartsError,
    updateQuestionRatingScaleMapping,
    isUpdatingQuestionRatingScaleMapping,
    updateQuestionRatingScaleMappingError,
  } = useQuestionPartsActions(questionId);

  const isProcessing =
    isCreatingQuestionPart ||
    isUpdatingQuestionPart ||
    isDeletingQuestionPart ||
    isDuplicatingQuestionPart ||
    isUpdatingQuestionRatingScaleMapping;

  const handleAdd = () => {
    setFormData(getDefaultFormData());
    setEditingPart(null);
    setShowDialog(true);
  };

  const handleEdit = (part: QuestionPartWithMapping) => {
    if (disabled) return;

    let min = "1";
    let max = "5";
    let step = "1";
    let decimal_places = "0";
    let labels = ["", ""];

    if (hasMinMax(part.options)) {
      min = part.options.min?.toString() || "1";
      max = part.options.max?.toString() || "5";

      if (hasStep(part.options)) {
        step = part.options.step?.toString() || "1";
      } else if (hasDecimalPlaces(part.options)) {
        decimal_places = part.options.decimal_places?.toString() || "0";
      }
    } else if (hasLabels(part.options)) {
      labels = part.options.labels || ["", ""];
    }

    setFormData({
      text: part.text,
      answer_type: part.answer_type,
      min,
      max,
      step,
      decimal_places,
      labels,
    });
    setEditingPart(part);
    setShowDialog(true);
  };

  const handleSave = async () => {
    // Build the correct options object based on answer_type
    let options:
      | { labels: string[] }
      | { max: number; min: number; step: number }
      | { max: number; min: number; decimal_places?: number }
      | undefined;

    if (formData.answer_type === "labelled_scale") {
      options = {
        labels: formData.labels.filter((l) => l.trim().length > 0),
      };
    } else if (formData.answer_type === "scale") {
      options = {
        min: parseFloat(formData.min),
        max: parseFloat(formData.max),
        step: parseFloat(formData.step),
      };
    } else if (formData.answer_type === "number") {
      options = {
        min: parseFloat(formData.min),
        max: parseFloat(formData.max),
        decimal_places: parseInt(formData.decimal_places),
      };
    }

    const newPart = {
      text: formData.text,
      answer_type: formData.answer_type,
      options,
      order_index: editingPart?.order_index ?? questionParts.length,
    };

    if (editingPart) {
      // Update existing part
      await updateQuestionPart({
        partId: editingPart.id,
        updates: newPart,
      });
    } else {
      // Add new part
      console.log("Creating question part: ", newPart);
      await createQuestionPart(newPart);
    }

    setShowDialog(false);
    setEditingPart(null);
    setFormData(getDefaultFormData());
  };

  const handleDelete = async () => {
    if (!editingPart) return;
    await deleteQuestionPart(editingPart.id);

    setShowDialog(false);
    setEditingPart(null);
  };

  const handleDuplicate = async (part: QuestionPartWithMapping) => {
    if (disabled) return;
    await duplicateQuestionPart(part.id);
  };

  const handleMoveUp = async (part: QuestionPartWithMapping) => {
    if (disabled || part.order_index === 0) return;

    await reorderQuestionParts(
      questionParts
        .map((p) => p.id)
        .sort(
          (a, b) =>
            questionParts.find((p) => p.id === a)!.order_index -
            questionParts.find((p) => p.id === b)!.order_index
        )
    );
  };

  const handleMoveDown = async (part: QuestionPartWithMapping) => {
    if (disabled || part.order_index === questionParts.length - 1) return;
    // setQuestionParts((prev) => {
    //   const newParts = [...prev];
    //   const currentIndex = newParts.findIndex((p) => p.id === part.id);
    //   if (currentIndex < newParts.length - 1) {
    //     // Swap with next item
    //     [newParts[currentIndex], newParts[currentIndex + 1]] = [
    //       newParts[currentIndex + 1],
    //       newParts[currentIndex],
    //     ];
    //     // Update order indices
    //     return newParts.map((p, index) => ({ ...p, order_index: index }));
    //   }
    //   return prev;
    // });
    await reorderQuestionParts(
      questionParts
        .map((p) => p.id)
        .sort(
          (a, b) =>
            questionParts.find((p) => p.id === a)!.order_index -
            questionParts.find((p) => p.id === b)!.order_index
        )
    );
  };

  const handleCancelDialog = () => {
    setShowDialog(false);
    setEditingPart(null);
    setFormData(getDefaultFormData());
  };

  const handleSaveMappings = async (config: WeightedScoringConfig) => {
    // Update the question's rating_scale_mapping field with weighted config
    await updateQuestionRatingScaleMapping({ rating_scale_mapping: config });
  };

  const getMappingSummary = (part: QuestionPartWithMapping): string | null => {
    if (!part.mapping) return null;

    const mappedLevels = new Set<number>();

    // Extract all mapped levels
    Object.values(part.mapping).forEach((value) => {
      if (Array.isArray(value) && value.length > 0) {
        if (typeof value[0] === "number") {
          // Boolean or labelled_scale mapping - array of numbers
          (value as number[]).forEach((level) => mappedLevels.add(level));
        } else if (typeof value[0] === "object" && value[0] !== null && "levels" in value[0]) {
          // Range mapping - array of RangeMapping objects
          value.forEach((range) => {
            if (typeof range === "object" && range !== null && "levels" in range) {
              (range.levels as number[]).forEach((level) => mappedLevels.add(level));
            }
          });
        }
      }
    });

    if (mappedLevels.size === 0) return null;

    const levels = Array.from(mappedLevels).sort((a, b) => a - b);
    if (levels.length === 1) {
      return `→ Level ${levels[0]}`;
    } else if (levels.length === ratingScales.length) {
      return `→ All Levels`;
    } else {
      return `→ Levels ${Math.min(...levels)}-${Math.max(...levels)}`;
    }
  };

  // Collect all errors
  const errors = [
    createQuestionPartError,
    updateQuestionPartError,
    deleteQuestionPartError,
    duplicateQuestionPartError,
    reorderQuestionPartsError,
    updateQuestionRatingScaleMappingError,
  ].filter(Boolean);

  return (
    <>
      <div className="flex flex-col w-full gap-2">
        <div className="grid w-full gap-2">
          <Label htmlFor="question-parts">Question Elements</Label>
          <span className="text-xs text-muted-foreground">
            Define the individual elements that make up this question. Each
            element can have its own answer type and is mappable to the
            questions rating scale. This makes it easier to interviewees to
            answer questions, without overwhelming them with a single large
            rating scale.
          </span>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errors.map((error, index) => (
                  <div key={index}>
                    {error instanceof Error ? error.message : String(error)}
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          <div id="question-parts" className="space-y-2">
            {!ratingScales ? (
              <div className="border border-border rounded p-4 text-center">
                <span className="text-sm text-muted-foreground">
                  No rating scales available. Ensure rating scales are assigned
                  to the question.
                </span>
              </div>
            ) : isLoadingQuestionParts ? (
              <div className="rounded text-center">
                <Skeleton className="h-24 w-full" />
              </div>
            ) : questionParts && questionParts.length > 0 ? (
              questionParts
                .sort((a, b) => a.order_index - b.order_index)
                .map((part, index) => (
                  <div
                    key={part.id}
                    className="text-sm bg-muted/50 rounded-md p-3 border border-border"
                  >
                    <div className="flex items-start gap-3">
                      {/* Order number and reorder buttons */}
                      <div className="flex flex-col items-center gap-1 pt-0.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 cursor-pointer"
                          onClick={() => handleMoveUp(part)}
                          disabled={disabled || index === 0}
                        >
                          <IconChevronUp className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-medium text-muted-foreground w-5 text-center">
                          {index + 1}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 cursor-pointer"
                          onClick={() => handleMoveDown(part)}
                          disabled={
                            disabled || index === questionParts.length - 1
                          }
                        >
                          <IconChevronDown className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium flex-1">{part.text}</p>
                          {userCanAdmin && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 cursor-pointer"
                                onClick={() => handleDuplicate(part)}
                                disabled={disabled || isDuplicatingQuestionPart}
                              >
                                <IconCopy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 cursor-pointer"
                                onClick={() => handleEdit(part)}
                                disabled={disabled}
                              >
                                <IconPencil className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {getAnswerTypeLabel(part.answer_type)}
                          </Badge>
                          <span>{getAnswerTypeDetails(part)}</span>
                          {getMappingSummary(part) && (
                            <>
                              <span>•</span>
                              <span className="text-primary font-medium">
                                {getMappingSummary(part)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="border border-border rounded p-4 text-center">
                <span className="text-sm text-muted-foreground">
                  No question elements added yet
                </span>
              </div>
            )}
          </div>
          {!isLoadingQuestionParts && questionParts && (
            <div className="flex justify-between gap-2">
              <div>
                {userCanAdmin && questionParts.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setShowMatrixBuilder(true)}
                    disabled={disabled}
                  >
                    <IconTableOptions className="h-3 w-3 mr-1" />
                    Configure Rating Scale Mappings
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {userCanAdmin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={handleAdd}
                    disabled={disabled}
                  >
                    <IconPlus className="h-3 w-3 mr-1" />
                    Add Element
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <QuestionPartsDialog
        open={showDialog}
        handleClose={handleCancelDialog}
        isEditing={editingPart}
        data={formData}
        setData={setFormData}
        isProcessing={isProcessing}
        handleSave={handleSave}
        handleDelete={handleDelete}
      />

      <QuestionPartsWeightedScoringBuilder
        open={showMatrixBuilder}
        handleClose={() => setShowMatrixBuilder(false)}
        questionId={questionId}
        questionParts={questionParts}
        ratingScaleLevels={ratingScales.map((rs) => ({
          level: rs.value,
          name: rs.name,
        }))}
        onSave={handleSaveMappings}
      />
    </>
  );
}
