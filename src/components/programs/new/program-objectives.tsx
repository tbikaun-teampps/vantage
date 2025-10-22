import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconPlus, IconTarget, IconX } from "@tabler/icons-react";
import type { ProgramObjective } from "./schema";

interface ProgramObjectivesProps {
  objectives: ProgramObjective[];
  onAddObjective: () => void;
  onRemoveObjective: (index: number) => void;
  onUpdateObjective: (index: number, field: keyof ProgramObjective, value: string) => void;
  error?: string;
}

export function ProgramObjectives({
  objectives,
  onAddObjective,
  onRemoveObjective,
  onUpdateObjective,
  error,
}: ProgramObjectivesProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>
              Program Objectives <span className="text-destructive">*</span>
            </CardTitle>
            <CardDescription>
              Define the key objectives and goals for this program
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddObjective}
          >
            <IconPlus className="h-4 w-4 mr-2" />
            Add Objective
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {objectives.map((objective, index) => (
            <div key={index} className="flex gap-3 p-3 border rounded-lg">
              <IconTarget className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Objective name"
                  value={objective.name}
                  onChange={(e) =>
                    onUpdateObjective(index, "name", e.target.value)
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
                disabled={objectives.length === 1}
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
                Add objectives to define what this program aims to achieve
              </p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}