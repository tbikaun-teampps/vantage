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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IconCheck, IconX } from "@tabler/icons-react";

interface QuestionRatingScaleDialogProps {
  open: boolean;
  handleClose: any;
  isEditing: any;
  data: any;
  setData: any;
  isProcessing: any;
  unassignedRatingScales: any;
  handleSaveRatingScale: any;
}

export function QuestionRatingScaleDialog({
  open,
  handleClose,
  isEditing,
  data,
  setData,
  isProcessing,
  unassignedRatingScales,
  handleSaveRatingScale,
}: QuestionRatingScaleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Question Rating Scale Description"
              : "Add Question Rating Scale Description"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the rating scale description for this question."
              : "Assign a rating scale to this question with a specific description."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ratingScale">Rating Scale</Label>
            <Select
              value={data.ratingScaleId}
              onValueChange={(value) => {
                const selectedRatingScale = unassignedRatingScales.find(
                  (scale) => scale.id === parseInt(value)
                );
                setData((prev) => ({
                  ...prev,
                  ratingScaleId: value,
                  description:
                    selectedRatingScale?.description || prev.description,
                }));
              }}
              disabled={!!isEditing || isProcessing} // Disable when editing
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a rating scale" />
              </SelectTrigger>
              <SelectContent>
                {isEditing ? (
                  // When editing, show the current rating scale
                  <SelectItem value={data.ratingScaleId}>
                    {isEditing.value} - {isEditing.name}
                  </SelectItem>
                ) : (
                  // When adding, show unassigned rating scales
                  unassignedRatingScales.map((ratingScale) => (
                    <SelectItem key={ratingScale.id} value={ratingScale.id}>
                      {ratingScale.value} - {ratingScale.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe what this rating level means for this specific question..."
              className="min-h-[80px]"
              disabled={isProcessing}
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex w-full justify-end">
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
                onClick={handleSaveRatingScale}
                disabled={
                  !data.ratingScaleId ||
                  !data.description.trim() ||
                  isProcessing
                }
              >
                <IconCheck className="h-4 w-4 mr-2" />
                {isProcessing
                  ? isEditing
                    ? "Updating..."
                    : "Adding..."
                  : isEditing
                    ? "Update"
                    : "Add"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
