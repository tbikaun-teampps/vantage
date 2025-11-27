import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  IconTarget,
  IconShieldCheck,
  IconTrendingUp,
  IconLeaf,
  IconAlertTriangle,
  IconSchool,
  IconSearch,
  IconCheck,
} from "@tabler/icons-react";
import { OBJECTIVES } from "@/lib/library/objectives";
import type {
  CreateObjectiveFormData,
} from "@/types/api/assessments";

interface ObjectivesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onObjectivesSelected: (objectives: CreateObjectiveFormData[]) => void;
  existingObjectives: CreateObjectiveFormData[];
}

// Map categories to icons
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Safety & Compliance": IconShieldCheck,
  "Operational Efficiency": IconTrendingUp,
  "Quality Management": IconTarget,
  "Environmental Impact": IconLeaf,
  "Risk Management": IconAlertTriangle,
  "Training & Development": IconSchool,
};

export function ObjectivesDialog({
  open,
  onOpenChange,
  onObjectivesSelected,
  existingObjectives,
}: ObjectivesDialogProps) {
  const [selectedObjectives, setSelectedObjectives] = useState<
    CreateObjectiveFormData[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter objectives based on search
  const filteredCategories = OBJECTIVES.map((category) => ({
    ...category,
    objectives: category.objectives.filter(
      (obj) =>
        obj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.objectives.length > 0);

  const isObjectiveSelected = (objective: CreateObjectiveFormData) => {
    return selectedObjectives.some(
      (obj) =>
        obj.title === objective.title &&
        obj.description === objective.description
    );
  };

  const toggleObjective = (objective: CreateObjectiveFormData) => {
    if (isObjectiveSelected(objective)) {
      setSelectedObjectives((prev) =>
        prev.filter(
          (obj) =>
            !(
              obj.title === objective.title &&
              obj.description === objective.description
            )
        )
      );
    } else {
      setSelectedObjectives((prev) => [...prev, objective]);
    }
  };

  const handleAddSelected = () => {
    onObjectivesSelected(selectedObjectives);
    setSelectedObjectives([]);
    setSearchQuery("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedObjectives([]);
    setSearchQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose Objectives from Library</DialogTitle>
          <DialogDescription>
            Select pre-defined objectives that align with your assessment goals
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search objectives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected Count */}
        {selectedObjectives.length > 0 && (
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {selectedObjectives.length} objective
              {selectedObjectives.length !== 1 ? "s" : ""} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedObjectives([])}
            >
              Clear selection
            </Button>
          </div>
        )}

        {/* Objectives Grid */}
        <div className="flex-1 overflow-auto">
          <ScrollArea className="h-full pr-2">
            <div className="space-y-6">
              {filteredCategories.map((category, categoryIndex) => {
                const Icon = categoryIcons[category.category] || IconTarget;

                return (
                  <div key={categoryIndex}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{category.category}</h3>
                      <Badge variant="outline" className="ml-auto">
                        {category.objectives.length} objectives
                      </Badge>
                    </div>

                    <div className="grid gap-3">
                      {category.objectives.map((objective, objectiveIndex) => {
                        const isSelected = isObjectiveSelected(objective);
                        const isAlreadyAdded = existingObjectives.some(
                          (existing) => existing.title === objective.title
                        );

                        return (
                          <div
                            key={objectiveIndex}
                            className={`
                              border rounded-lg p-3 cursor-pointer transition-all
                              ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "hover:border-gray-400 hover:bg-muted/50"
                              }
                              ${
                                isAlreadyAdded
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            `}
                            onClick={() =>
                              !isAlreadyAdded && toggleObjective(objective)
                            }
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`
                                w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
                                ${
                                  isSelected
                                    ? "border-primary bg-primary"
                                    : "border-gray-300"
                                }
                              `}
                              >
                                {isSelected && (
                                  <IconCheck className="h-3 w-3 text-white" />
                                )}
                              </div>

                              <div className="flex-1">
                                <h4 className="font-medium text-sm mb-1">
                                  {objective.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {objective.description}
                                </p>
                                {isAlreadyAdded && (
                                  <Badge
                                    variant="secondary"
                                    className="mt-2 text-xs"
                                  >
                                    Already added
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredCategories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <IconSearch className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p>No objectives found matching &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddSelected}
            disabled={selectedObjectives.length === 0}
          >
            Add {selectedObjectives.length || ""} Objective
            {selectedObjectives.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
