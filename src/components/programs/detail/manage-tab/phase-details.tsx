import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { IconEdit } from "@tabler/icons-react";
import type { ProgramPhase } from "@/types/program";

interface PhaseDetailsProps {
  phase: ProgramPhase;
  onEditPhase: (phase: ProgramPhase) => void;
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

const statusLabels = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  archived: "Archived",
} as const;

export function PhaseDetails({ phase, onEditPhase }: PhaseDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Assessment Details</h3>
          <Button variant="outline" size="sm" onClick={() => onEditPhase(phase)}>
            <IconEdit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-6 gap-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Assessment Name
            </Label>
            <p className="text-sm">
              {phase.name || `Assessment ${phase.sequence_number}`}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Status
            </Label>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${statusColors[phase.status as keyof typeof statusColors]}`}
              >
                {statusLabels[phase.status as keyof typeof statusLabels]}
              </Badge>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Planned Start Date
            </Label>
            <p className="text-sm">
              {phase.planned_start_date
                ? new Date(phase.planned_start_date).toLocaleDateString()
                : "Not set"}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Actual Start Date
            </Label>
            <p className="text-sm">
              {phase.actual_start_date
                ? new Date(phase.actual_start_date).toLocaleDateString()
                : "Not set"}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Planned End Date
            </Label>
            <p className="text-sm">
              {phase.planned_end_date
                ? new Date(phase.planned_end_date).toLocaleDateString()
                : "Not set"}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Actual End Date
            </Label>
            <p className="text-sm">
              {phase.actual_end_date
                ? new Date(phase.actual_end_date).toLocaleDateString()
                : "Not set"}
            </p>
          </div>
        </div>

        {phase.notes && (
          <div className="mt-4">
            <Label className="text-sm font-medium text-muted-foreground">
              Notes
            </Label>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {phase.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}