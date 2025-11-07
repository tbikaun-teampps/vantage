import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconCheck,
  IconX,
  IconClipboardText,
  IconLink,
  IconUnlink,
  IconExternalLink,
  IconPlus,
} from "@tabler/icons-react";
import { useQuestionnaires } from "@/hooks/useAssessments";
import { Link } from "react-router-dom";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import type { ProgramDetailResponseData } from "@/types/api/programs";

interface PresiteQuestionnaireSelectionProps {
  program: ProgramDetailResponseData;
  onPresiteQuestionnaireUpdate: (questionnaireId: number | null) => void;
  isUpdating?: boolean;
}

export function PresiteQuestionnaireSelection({
  program,
  onPresiteQuestionnaireUpdate,
  isUpdating = false,
}: PresiteQuestionnaireSelectionProps) {
  const companyId = useCompanyFromUrl();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] =
    useState<string>(
      program.presite_questionnaire_id?.toString() || "__clear__"
    );

  const { data: questionnaires = [], isLoading } = useQuestionnaires(companyId);
  const routes = useCompanyRoutes();

  const currentQuestionnaire = questionnaires.find(
    (q) => q.id === program.presite_questionnaire_id
  );

  const handleSave = () => {
    const newQuestionnaireId =
      selectedQuestionnaireId && selectedQuestionnaireId !== "__clear__"
        ? parseInt(selectedQuestionnaireId)
        : null;

    onPresiteQuestionnaireUpdate(newQuestionnaireId);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedQuestionnaireId(
      program.presite_questionnaire_id?.toString() || "__clear__"
    );
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card className="shadow-none border-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconClipboardText className="h-5 w-5" />
            <CardTitle>Presite Questionnaire</CardTitle>
          </div>
          <CardDescription>
            Loading questionnaire information...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div>
              <CardTitle>Self-Audit Questionnaire</CardTitle>
              <CardDescription>
                Link a questionnaire for self-audit interviews in this program
              </CardDescription>
            </div>
          </div>
          {!isEditing && (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isUpdating}
            >
              <IconPlus className="h-4 w-4 mr-2" />
              {currentQuestionnaire ? "Change" : "Link"} Questionnaire
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          // Display mode
          <div className="space-y-3">
            {currentQuestionnaire ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    <IconLink className="h-3 w-3 mr-1" />
                    Linked
                  </Badge>
                  <span className="font-medium underline">
                    <Link
                      to={routes.questionnaireDetail(currentQuestionnaire.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-blue-600"
                    >
                      {currentQuestionnaire.name}
                      <IconExternalLink className="h-3 w-3" />
                    </Link>
                  </span>
                </div>
                {currentQuestionnaire.description && (
                  <p className="text-sm text-muted-foreground">
                    {currentQuestionnaire.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This questionnaire will be used for self-audit interviews
                  within this program to gather preliminary insights.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-muted-foreground">
                    <IconUnlink className="h-3 w-3 mr-1" />
                    No questionnaire linked
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Link a questionnaire to provide structure for self-audit
                  interviews. This helps gather consistent preliminary data
                  before onsite-audit interviews.
                </p>
              </div>
            )}
          </div>
        ) : (
          // Edit mode
          <div className="space-y-4">
            <div className="space-y-2">
              <Select
                value={selectedQuestionnaireId}
                onValueChange={setSelectedQuestionnaireId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a questionnaire (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__clear__">
                    <div className="flex items-center gap-2">
                      <IconUnlink className="h-3 w-3" />
                      No questionnaire (clear selection)
                    </div>
                  </SelectItem>
                  {questionnaires.length === 0 ? (
                    <SelectItem value="no-questionnaires" disabled>
                      No questionnaires available
                    </SelectItem>
                  ) : (
                    questionnaires.map((questionnaire) => {
                      const isUsedByOnsite =
                        questionnaire.id === program.onsite_questionnaire_id;
                      return (
                        <SelectItem
                          key={questionnaire.id}
                          value={questionnaire.id.toString()}
                          disabled={isUsedByOnsite}
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span>{questionnaire.name}</span>
                              {isUsedByOnsite && (
                                <Badge variant="outline" className="text-xs">
                                  Used by onsite-audit
                                </Badge>
                              )}
                            </div>
                            {questionnaire.description && (
                              <span className="text-xs text-muted-foreground">
                                {questionnaire.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only active questionnaires are shown. This questionnaire will be
                pre-selected when scheduling self-audit interviews for this
                program.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                <IconCheck className="h-4 w-4 mr-2" />
                {isUpdating ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                <IconX className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
