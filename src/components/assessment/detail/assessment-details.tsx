import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { IconExternalLink, IconForms } from "@tabler/icons-react";
import type {
  AssessmentWithQuestionnaire,
  DesktopAssessment,
} from "@/types/assessment";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import { InlineFieldEditor } from "@/components/ui/inline-field-editor";
import { InlineSelectEditor } from "@/components/ui/inline-select-editor";
import type { SelectOption } from "@/components/ui/inline-select-editor";
import { getStatusIcon } from "@/components/assessment/detail/status-utils";

interface AssessmentDetailsProps {
  assessment: AssessmentWithQuestionnaire | DesktopAssessment;
  onStatusChange: (status: string) => Promise<void>;
  onNameChange: (name: string) => Promise<void>;
  onDescriptionChange: (description: string) => Promise<void>;
  onInterviewOverviewChange?: (overview: string) => Promise<void>;
  assessmentType: "onsite" | "desktop";
}

export function AssessmentDetails({
  assessment,
  onNameChange,
  onDescriptionChange,
  onStatusChange,
  onInterviewOverviewChange,
  assessmentType,
}: AssessmentDetailsProps) {
  const routes = useCompanyRoutes();

  if (!assessment) {
    return null;
  }

  // Validation functions
  const validateName = (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return "Name is required";
    }
    if (value.length > 200) {
      return "Name must be less than 200 characters";
    }
    return null;
  };

  const validateDescription = (value: string): string | null => {
    if (value && value.length > 1000) {
      return "Description must be less than 1000 characters";
    }
    return null;
  };

  const validateInterviewOverview = (value: string): string | null => {
    if (value && value.length > 1000) {
      return "Interview overview must be less than 1000 characters";
    }
    return null;
  };

  // Status options with icons
  const statusOptions: SelectOption[] = [
    {
      value: "draft",
      label: "Draft",
      icon: getStatusIcon("draft"),
    },
    {
      value: "active",
      label: "Active",
      icon: getStatusIcon("active"),
    },
    {
      value: "under_review",
      label: "Under Review",
      icon: getStatusIcon("under_review"),
    },
    {
      value: "completed",
      label: "Completed",
      icon: getStatusIcon("completed"),
    },
    {
      value: "archived",
      label: "Archived",
      icon: getStatusIcon("archived"),
    },
  ];

  return (
    <Card
      className="h-full shadow-none border-none"
      data-tour="assessment-details-card"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconForms className="h-5 w-5" />
          Assessment Details
        </CardTitle>
        <CardDescription>Basic information and configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Row 1: Assessment Name + Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <InlineFieldEditor
              label="Assessment Name"
              value={assessment.name}
              placeholder="Enter assessment name"
              type="input"
              onSave={onNameChange}
              validation={validateName}
              maxLength={200}
            />

            <InlineSelectEditor
              label="Status"
              value={assessment.status}
              options={statusOptions}
              placeholder="Select status"
              onSave={onStatusChange}
            />
          </div>

          {/* Row 2: Description */}
          <InlineFieldEditor
            label="Description"
            value={assessment.description || ""}
            placeholder="Enter assessment description (optional)"
            type="textarea"
            onSave={onDescriptionChange}
            validation={validateDescription}
            maxLength={1000}
            minRows={2}
          />

          {onInterviewOverviewChange && (
            <InlineFieldEditor
              label="Interview Overview"
              value={assessment.interview_overview || ""}
              placeholder="Enter interview overview (optional)"
              type="textarea"
              onSave={onInterviewOverviewChange}
              validation={validateInterviewOverview}
              maxLength={1000}
              minRows={2}
            />
          )}

          {/* Conditional Row 3: Questionnaire Template + Created */}
          {assessmentType === "onsite" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Questionnaire Template
                </Label>
                <p className="text-sm">
                  <Link
                    to={routes.questionnaireDetail(assessment.questionnaire_id!)}
                    className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
                  >
                    {assessment?.questionnaire?.name || "Loading..."}
                    <IconExternalLink className="h-3 w-3" />
                  </Link>
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(assessment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
