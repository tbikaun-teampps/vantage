import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import type { GetQuestionnairesResponseData } from "@/types/api/questionnaire";
import type { CreateAssessmentFormData } from "@/types/api/assessments";

interface QuestionnaireSelectionProps {
  questionnaires: GetQuestionnairesResponseData;
  formData: CreateAssessmentFormData;
  formErrors: Record<string, string>;
  onInputChange: (field: keyof CreateAssessmentFormData, value: string) => void;
}

export function QuestionnaireSelection({
  questionnaires,
  formData,
  formErrors,
  onInputChange,
}: QuestionnaireSelectionProps) {
  const routes = useCompanyRoutes();
  return (
    <Card
      className="shadow-none border-none"
      data-tour="assessment-questionnaire-selection"
    >
      <CardHeader>
        <CardTitle>Questionnaire Selection</CardTitle>
        <CardDescription>
          Choose the questionnaire template for this assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="questionnaire_id">
            Questionnaire Template
            <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.questionnaire_id?.toString() || ""}
            onValueChange={(value) => onInputChange("questionnaire_id", value)}
          >
            <SelectTrigger
              className={
                formErrors.questionnaire_id ? "border-destructive" : ""
              }
              data-tour="questionnaire-template-selector"
            >
              <SelectValue placeholder="Choose a questionnaire" />
            </SelectTrigger>
            <SelectContent>
              {questionnaires.length === 0 ? (
                <SelectItem value="no-active-questionnaires" disabled>
                  No active questionnaires available
                </SelectItem>
              ) : (
                questionnaires.map((questionnaire) => (
                  <SelectItem
                    key={questionnaire.id}
                    value={questionnaire.id.toString()}
                  >
                    <div className="flex flex-col text-left">
                      <span>{questionnaire.name}</span>
                      {questionnaire.description && (
                        <span className="text-xs text-muted-foreground">
                          {questionnaire.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {formErrors.questionnaire_id && (
            <p className="text-sm text-destructive">
              {formErrors.questionnaire_id}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Only active questionnaires are shown. Under review, draft and
            archived questionnaires are hidden from this list.
          </p>
          {questionnaires.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Need a questionnaire?</span>
              <Link
                to={routes.newQuestionnaire()}
                className="text-primary hover:text-primary/80 underline font-medium"
              >
                Create new questionnaire
              </Link>
              <span>or</span>
              <Link
                to={routes.questionnaires()}
                className="text-primary hover:text-primary/80 underline font-medium"
              >
                manage existing ones
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
