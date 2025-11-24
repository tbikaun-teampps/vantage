import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconTarget } from "@tabler/icons-react";
import type { AssessmentObjectives } from "@/types/api/assessments";

interface AssessmentObjectivesProps {
  objectives: AssessmentObjectives;
}

export function AssessmentObjectives({
  objectives,
}: AssessmentObjectivesProps) {
  if (!objectives || objectives.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-none border-none" data-tour="assessment-objectives">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTarget className="h-5 w-5" />
          Assessment Objectives
        </CardTitle>
        <CardDescription>
          {objectives.length} objective{objectives.length !== 1 ? "s" : ""}{" "}
          defined for this assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {objectives.map((objective, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h4 className="font-medium text-sm">{objective.title}</h4>
              {objective.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {objective.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
