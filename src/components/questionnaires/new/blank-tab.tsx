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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { QuestionnaireStatusEnum } from "@/types/assessment";
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
      {/* Top Section: Basic Information */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Form */}
        <Card className="xl:col-span-2" data-tour="questionnaire-form">
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

            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={formData.status as string}
                onValueChange={(value) => handleInputChange("status", value)}
                disabled={isProcessing || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                You can change this status later from the questionnaire settings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Next Steps Info */}
          <Card data-tour="questionnaire-next-steps">
            <CardHeader>
              <CardTitle className="text-base">What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Questionnaire Creation</p>
                  <p className="text-xs text-muted-foreground">
                    Your questionnaire will be created with the basic
                    information provided
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Add Structure</p>
                  <p className="text-xs text-muted-foreground">
                    Add sections, steps, and questions to build your
                    questionnaire
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Configure Ratings</p>
                  <p className="text-xs text-muted-foreground">
                    Set up rating scales for questionnaire responses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Submit Buttons */}
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
      </div>
    </form>
  );
}
