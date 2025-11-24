import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  TableWidgetConfig as TableWidgetConfigType,
  WidgetConfig,
  ScopeConfig,
} from "@/types/api/dashboard";
import { useWidgetConfigOptions } from "@/hooks/useWidgetConfigOptions";
import { Loader2 } from "lucide-react";

type TableEntityType = "actions" | "recommendations" | "comments";

interface TableWidgetConfigProps {
  config?: TableWidgetConfigType;
  currentScope?: ScopeConfig;
  onConfigChange: (config: WidgetConfig) => void;
}

export const TableWidgetConfig: React.FC<TableWidgetConfigProps> = ({
  config,
  currentScope,
  onConfigChange,
}) => {
  const [selectedEntityType, setSelectedEntityType] = useState<TableEntityType>(
    config?.entityType || "actions"
  );
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    number | "all"
  >(currentScope?.assessmentId || "all");
  const [selectedProgramId, setSelectedProgramId] = useState<number | "all">(
    currentScope?.programId || "all"
  );

  const { data: configOptions, isLoading } = useWidgetConfigOptions();

  // Update pending config whenever selection changes
  const handleEntityTypeChange = (value: TableEntityType) => {
    setSelectedEntityType(value);
    updateConfig(value, selectedAssessmentId, selectedProgramId);
  };

  const handleAssessmentChange = (value: string) => {
    const assessmentId = value === "all" ? "all" : Number(value);
    setSelectedAssessmentId(assessmentId);
    updateConfig(selectedEntityType, assessmentId, selectedProgramId);
  };

  const handleProgramChange = (value: string) => {
    const programId = value === "all" ? "all" : Number(value);
    setSelectedProgramId(programId);
    updateConfig(selectedEntityType, selectedAssessmentId, programId);
  };

  const updateConfig = (
    entityType: TableEntityType,
    assessmentId: number | "all",
    programId: number | "all"
  ) => {
    const newConfig: WidgetConfig = {
      table: { entityType },
    };

    // Add scope only if not "all"
    if (entityType === "actions" || entityType === "comments") {
      if (assessmentId !== "all") {
        newConfig.scope = { assessmentId };
      }
    } else if (entityType === "recommendations") {
      if (programId !== "all") {
        newConfig.scope = { programId };
      }
    }

    onConfigChange?.(newConfig);
  };

  const actionTypeOptions = [
    {
      value: "actions" as TableEntityType,
      title: "Actions",
      description: "Show actions raised in interviews",
    },
    {
      value: "recommendations" as TableEntityType,
      title: "Recommendations",
      description: "Show recommendations for next steps",
    },
    {
      value: "comments" as TableEntityType,
      title: "Comments",
      description: "Show comments raised in interviews",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Table Type</Label>
        <div className="space-y-2">
          {actionTypeOptions.map((option) => (
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
        </div>
      </div>

      {/* Scope Selection */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          {(selectedEntityType === "actions" ||
            selectedEntityType === "comments") && (
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
          )}

          {selectedEntityType === "recommendations" && (
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
          )}
        </>
      )}
    </div>
  );
};
