import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconCheck, IconX, IconTrash, IconPlus } from "@tabler/icons-react";
import type {
  QuestionPartFormData,
  QuestionPart,
} from "./question-parts-types";

interface QuestionPartsDialogProps {
  open: boolean;
  handleClose: () => void;
  isEditing: QuestionPart | null;
  data: QuestionPartFormData;
  setData: (
    data:
      | QuestionPartFormData
      | ((prev: QuestionPartFormData) => QuestionPartFormData)
  ) => void;
  isProcessing: boolean;
  handleSave: () => void;
  handleDelete?: () => void;
}

export function QuestionPartsDialog({
  open,
  handleClose,
  isEditing,
  data,
  setData,
  isProcessing,
  handleSave,
  handleDelete,
}: QuestionPartsDialogProps) {
  const isFormValid = () => {
    if (!data.text.trim()) return false;

    // Validate based on answer type
    if (data.answer_type === "scale" || data.answer_type === "number") {
      const min = parseFloat(data.min);
      const max = parseFloat(data.max);
      if (isNaN(min) || isNaN(max) || min >= max) return false;
    }

    if (data.answer_type === "labelled_scale") {
      // Require at least 2 labels with non-empty text
      const validLabels = data.labels.filter(
        (label) => label.trim().length > 0
      );
      if (validLabels.length < 2) return false;
    }

    return true;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Question Element" : "Add Question Element"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the question element details. Ensure you reconfigure your rating scales if necessary."
              : "Add a new question element with its answer type. Review the rating scale mappings to ensure it fits your needs."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="text" className="required">
              Question Text
            </Label>
            <Textarea
              id="text"
              value={data.text}
              onChange={(e) =>
                setData((prev) => ({ ...prev, text: e.target.value }))
              }
              placeholder="e.g., How often do you perform this task?"
              className="min-h-[80px]"
              disabled={isProcessing}
            />
          </div>

          {/* Answer Type */}
          <div className="space-y-2">
            <Label htmlFor="answer_type" className="required">
              Answer Type
            </Label>
            <Select
              value={data.answer_type}
              onValueChange={(value) =>
                setData((prev) => ({
                  ...prev,
                  answer_type: value as QuestionPartFormData["answer_type"],
                }))
              }
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select answer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                <SelectItem value="scale">Scale (e.g., 1-5)</SelectItem>
                <SelectItem value="labelled_scale">
                  Labelled Scale (custom options)
                </SelectItem>
                <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                <SelectItem value="number">Number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Answer Type Specific Options */}
          {data.answer_type === "boolean" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="true_label">True Label</Label>
                <Input
                  id="true_label"
                  value={data.true_label}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, true_label: e.target.value }))
                  }
                  placeholder="Yes"
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="false_label">False Label</Label>
                <Input
                  id="false_label"
                  value={data.false_label}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      false_label: e.target.value,
                    }))
                  }
                  placeholder="No"
                  disabled={isProcessing}
                />
              </div>
            </div>
          )}

          {data.answer_type === "labelled_scale" && (
            <div className="space-y-2">
              <Label htmlFor="labels" className="required">
                Scale Labels
              </Label>
              <div className="space-y-2">
                {data.labels.map((label, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 w-8 flex items-center justify-center text-sm text-muted-foreground">
                      {index + 1}.
                    </div>
                    <Input
                      value={label}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          labels: prev.labels.map((l, i) =>
                            i === index ? e.target.value : l
                          ),
                        }))
                      }
                      placeholder={`Label ${index + 1}`}
                      disabled={isProcessing}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          labels: prev.labels.filter((_, i) => i !== index),
                        }))
                      }
                      disabled={isProcessing || data.labels.length <= 2}
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    labels: [...prev.labels, ""],
                  }))
                }
                disabled={isProcessing}
                className="w-full"
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Add Label
              </Button>
              <p className="text-xs text-muted-foreground">
                Add at least 2 labels for your scale options
              </p>
            </div>
          )}

          {(data.answer_type === "scale" || data.answer_type === "number") && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min" className="required">
                  Min Value
                </Label>
                <Input
                  id="min"
                  type="number"
                  value={data.min}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, min: e.target.value }))
                  }
                  placeholder="1"
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max" className="required">
                  Max Value
                </Label>
                <Input
                  id="max"
                  type="number"
                  value={data.max}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, max: e.target.value }))
                  }
                  placeholder="5"
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="step">
                  {data.answer_type === "scale" ? "Step" : "Decimal Places"}
                </Label>
                <Input
                  id="step"
                  type="number"
                  value={
                    data.answer_type === "scale"
                      ? data.step
                      : data.decimal_places
                  }
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      [data.answer_type === "scale"
                        ? "step"
                        : "decimal_places"]: e.target.value,
                    }))
                  }
                  placeholder={data.answer_type === "scale" ? "1" : "0"}
                  disabled={isProcessing}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex w-full justify-between">
            {/* Delete button - only show when editing */}
            <div>
              {isEditing && handleDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
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
                onClick={handleClose}
                disabled={isProcessing}
              >
                <IconX className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isFormValid() || isProcessing}
              >
                <IconCheck className="h-4 w-4 mr-2" />
                {isProcessing
                  ? isEditing
                    ? "Updating..."
                    : "Adding..."
                  : isEditing
                    ? "Update Element"
                    : "Add Element"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
