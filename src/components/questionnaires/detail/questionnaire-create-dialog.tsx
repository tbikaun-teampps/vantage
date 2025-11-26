import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuestionnaireActions } from "@/hooks/useQuestionnaires";
import { toast } from "sonner";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
interface QuestionnaireCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuestionnaireCreateDialog({
  open,
  onOpenChange,
}: QuestionnaireCreateDialogProps) {
  const companyId = useCompanyFromUrl();
  const navigate = useCompanyAwareNavigate();
  const { createQuestionnaire, isCreating } = useQuestionnaireActions();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    guidelines: "",
    status: "draft" as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Questionnaire name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsProcessing(true);
    try {
      // Create the questionnaire
      const newQuestionnaire = await createQuestionnaire({
        name: formData.name.trim(),
        description: formData.description.trim(),
        guidelines: formData.guidelines.trim(),
        status: formData.status,
        company_id: companyId,
      });

      handleClose();

      // Navigate to the new questionnaire
      navigate(`/questionnaires/${newQuestionnaire.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create questionnaire"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      guidelines: "",
      status: "draft",
    });
    setErrors({});
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Questionnaire</DialogTitle>
          <DialogDescription>
            Create a new questionnaire template. You can add sections and
            questions after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Questionnaire Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter questionnaire name..."
              className={errors.name ? "border-destructive" : ""}
              disabled={isProcessing || isCreating}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the purpose of this questionnaire..."
              className={`min-h-[80px] ${
                errors.description ? "border-destructive" : ""
              }`}
              disabled={isProcessing || isCreating}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guidelines">Guidelines</Label>
            <Textarea
              id="guidelines"
              value={formData.guidelines}
              onChange={(e) => handleInputChange("guidelines", e.target.value)}
              placeholder="Guidelines for questionnaire completion... (optional)"
              className="min-h-[80px]"
              disabled={isProcessing || isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
              disabled={isProcessing || isCreating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing || isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing || isCreating}>
              {isProcessing ? "Creating..." : "Create Questionnaire"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
