import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { QuestionnaireStatusEnum } from "@/types/api/questionnaire";
import { IconDeviceFloppy, IconLoader, IconPlus } from "@tabler/icons-react";

interface NewQuestionnaireBlankTabProps {
  formData: {
    name: string;
    description: string;
    guidelines: string;
    status: Omit<QuestionnaireStatusEnum, "archived">;
  };
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  errors: Record<string, string>;
  isProcessing: boolean;
  isLoading: boolean;
}

export function NewQuestionnaireBlankTab({
  formData,
  handleInputChange,
  handleSubmit,
  errors,
  isProcessing,
  isLoading,
}: NewQuestionnaireBlankTabProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col gap-4">
        {/* Main Form */}
        <Card
          className="shadow-none border-none"
          data-tour="questionnaire-form"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconPlus className="h-5 w-5" />
              Questionnaire Details
            </CardTitle>
            <CardDescription>
              Provide basic information about your questionnaire. You can add
              sections and questions after creation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Questionnaire Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter questionnaire name..."
                className={errors.name ? "border-destructive" : ""}
                disabled={isProcessing || isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe the purpose of this questionnaire..."
                className={`min-h-[100px] ${
                  errors.description ? "border-destructive" : ""
                }`}
                disabled={isProcessing || isLoading}
                rows={4}
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
                onChange={(e) =>
                  handleInputChange("guidelines", e.target.value)
                }
                placeholder="Guidelines for questionnaire completion... (optional)"
                className="min-h-[100px]"
                disabled={isProcessing || isLoading}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Provide instructions or context for users completing this
                questionnaire
              </p>
            </div>
          </CardContent>
        </Card>

        <div
          className="flex flex-col sm:flex-row gap-3 justify-end"
          data-tour="questionnaire-actions"
        >
          <Button
            type="submit"
            disabled={isProcessing || isLoading}
            className="sm:w-auto"
          >
            {isProcessing && (
              <IconLoader className="mr-2 h-4 w-4 animate-spin" />
            )}
            <IconDeviceFloppy className="h-4 w-4 mr-2" />
            {isProcessing ? "Creating..." : "Create Questionnaire"}
          </Button>
        </div>
      </div>
    </form>
  );
}
