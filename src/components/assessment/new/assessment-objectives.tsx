import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconPlus, IconTarget, IconX } from "@tabler/icons-react";
import type { AssessmentObjective } from "@/types/assessment";

interface AssessmentObjectivesProps {
  objectives: AssessmentObjective[];
  formErrors: Record<string, string>;
  onAddObjective: () => void;
  onRemoveObjective: (index: number) => void;
  onUpdateObjective: (
    index: number,
    field: keyof AssessmentObjective,
    value: string
  ) => void;
  onShowObjectivesDialog: () => void;
}

export function AssessmentObjectives({
  objectives,
  formErrors,
  onAddObjective,
  onRemoveObjective,
  onUpdateObjective,
  onShowObjectivesDialog,
}: AssessmentObjectivesProps) {
  return (
    <Card className="shadow-none border-none" data-tour="assessment-objectives">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>
              Assessment Objectives <span className="text-destructive">*</span>
            </CardTitle>
            <CardDescription>
              Define the key objectives and goals for this assessment
            </CardDescription>
          </div>
          <div
            className="flex gap-2 ml-4"
            data-tour="assessment-objectives-actions"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddObjective}
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Add Custom
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onShowObjectivesDialog}
            >
              <IconTarget className="h-4 w-4 mr-2" />
              From Library
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Objectives List */}
        <div className="space-y-3">
          {objectives.map((objective, index) => (
            <div key={index} className="flex gap-3 p-3 border rounded-lg">
              <IconTarget className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Objective title"
                  value={objective.title}
                  onChange={(e) =>
                    onUpdateObjective(index, "title", e.target.value)
                  }
                  className="font-medium"
                />
                <Textarea
                  placeholder="Objective description (optional)"
                  value={objective.description || ""}
                  onChange={(e) =>
                    onUpdateObjective(index, "description", e.target.value)
                  }
                  rows={2}
                  className="text-sm"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveObjective(index)}
                className="text-destructive hover:text-destructive"
              >
                <IconX className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {objectives.length === 0 && (
            <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
              <IconTarget className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No objectives added yet</p>
              <p className="text-sm">
                Add objectives to define what this assessment aims to achieve
              </p>
            </div>
          )}
        </div>

        {formErrors.objectives && (
          <p className="text-sm text-destructive">{formErrors.objectives}</p>
        )}
      </CardContent>
    </Card>
  );
}
