import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CreateAssessmentFormData } from "@/types/api/assessments";

interface DetailsProps {
  formData: CreateAssessmentFormData;
  formErrors: Record<string, string>;
  onInputChange: (field: keyof CreateAssessmentFormData, value: string) => void;
}

export function AssessmentDetails({
  formData,
  formErrors,
  onInputChange,
}: DetailsProps) {
  return (
    <Card
      className="shadow-none border-none"
      data-tour="assessment-questionnaire-selection"
    >
      <CardHeader>
        <CardTitle>Assessment Details</CardTitle>
        <CardDescription>
          Provide the basic information for this assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assessment Name and Description */}
        <div className="space-y-4" data-tour="assessment-basic-info">
          {/* Assessment Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Assessment Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter assessment name"
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              className={formErrors.name ? "border-destructive" : ""}
            />
            {formErrors.name && (
              <p className="text-sm text-destructive">{formErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a description for this assessment (optional)"
              value={formData.description || ""}
              onChange={(e) => onInputChange("description", e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
