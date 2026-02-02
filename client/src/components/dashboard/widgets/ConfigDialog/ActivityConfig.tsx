import React, { useState } from "react";
import type {
  EntityWidgetConfig,
  ScopeConfig,
  WidgetConfig,
} from "@/types/api/dashboard";
import { useWidgetConfigOptions } from "@/hooks/useWidgetConfigOptions";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EntityType = NonNullable<EntityWidgetConfig>["entityType"];

interface ActivityWidgetConfigProps {
  config?: EntityWidgetConfig;
  currentScope?: ScopeConfig;
  onConfigChange: (config: WidgetConfig) => void;
}

export const ActivityWidgetConfig: React.FC<ActivityWidgetConfigProps> = ({
  config,
  currentScope,
  onConfigChange,
}) => {
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>(
    config?.entityType || "assessments"
  );

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    number | "all"
  >(currentScope?.assessmentId || "all");
  const [selectedProgramId, setSelectedProgramId] = useState<number | "all">(
    currentScope?.programId || "all"
  );

  const { data: configOptions, isLoading } = useWidgetConfigOptions();

  // Update pending config whenever selection changes
  const handleEntityTypeChange = (value: EntityType) => {
    setSelectedEntityType(value);
    updateConfig(value, selectedAssessmentId, selectedProgramId);
  };

  const handleAssessmentChange = (value: string) => {
    const assessmentId = value === "all" ? "all" : Number(value);
    setSelectedAssessmentId(assessmentId);
    // When selecting an assessment, clear program filter to enforce mutual exclusivity
    if (assessmentId !== "all") {
      setSelectedProgramId("all");
      updateConfig(selectedEntityType, assessmentId, "all");
    } else {
      updateConfig(selectedEntityType, assessmentId, selectedProgramId);
    }
  };

  const handleProgramChange = (value: string) => {
    const programId = value === "all" ? "all" : Number(value);
    setSelectedProgramId(programId);
    // When selecting a program, clear assessment filter to enforce mutual exclusivity
    if (programId !== "all") {
      setSelectedAssessmentId("all");
      updateConfig(selectedEntityType, "all", programId);
    } else {
      updateConfig(selectedEntityType, selectedAssessmentId, programId);
    }
  };

  const updateConfig = (
    entityType: EntityType,
    assessmentId: number | "all",
    programId: number | "all"
  ) => {
    const newConfig: WidgetConfig = {
      entity: { entityType },
    };

    // Add scope only for interviews entity type and only one filter at a time
    if (entityType === "interviews") {
      if (assessmentId !== "all") {
        newConfig.scope = { assessmentId };
      } else if (programId !== "all") {
        newConfig.scope = { programId };
      }
      // If both are "all", no scope is added
    }

    onConfigChange?.(newConfig);
  };

  const activityTypeOptions = [
    {
      value: "interviews" as EntityType,
      title: "Interviews",
      tags: [],
      description: "Shows recent activity on interviews",
    },
    {
      value: "assessments" as EntityType,
      title: "Assessments",
      tags: [],
      description: "Shows recent activity on assessments",
    },
    {
      value: "programs" as EntityType,
      title: "Programs",
      tags: [],
      description: "Shows recent activity on programs",
    },
  ];

  return (
    <div className="space-y-2">
      {activityTypeOptions.map((option) => (
        <div
          key={option.value}
          onClick={() => handleEntityTypeChange(option.value)}
          className={`
                p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm
                ${
                  selectedEntityType === option.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }
              `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4
                className={`font-medium text-sm ${
                  selectedEntityType === option.value
                    ? "text-blue-900 dark:text-blue-100"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {option.title}
              </h4>
              <p
                className={`text-xs mt-1 ${
                  selectedEntityType === option.value
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {option.description}
              </p>
              {/* <div className="flex gap-1 mt-2">
                    {option.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`
                          text-xs px-2 py-1 rounded-full
                          ${
                            selectedEntityType === option.value
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }
                        `}
                      >
                        {tag}
                      </span>
                    ))}
                  </div> */}
            </div>
            <div
              className={`
                  w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0
                  ${
                    selectedEntityType === option.value
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  }
                `}
            ></div>
          </div>
        </div>
      ))}
      {/* Scope Selection */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          {selectedEntityType === "interviews" && (
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Filter by Assessment
                </Label>
                <Select
                  value={
                    selectedAssessmentId === "all"
                      ? "all"
                      : String(selectedAssessmentId)
                  }
                  onValueChange={handleAssessmentChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assessments</SelectItem>
                    {configOptions?.assessments.map((assessment) => (
                      <SelectItem
                        key={assessment.id}
                        value={String(assessment.id)}
                      >
                        {assessment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Program</Label>
                <Select
                  value={
                    selectedProgramId === "all"
                      ? "all"
                      : String(selectedProgramId)
                  }
                  onValueChange={handleProgramChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {configOptions?.programs.map((program) => (
                      <SelectItem key={program.id} value={String(program.id)}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
