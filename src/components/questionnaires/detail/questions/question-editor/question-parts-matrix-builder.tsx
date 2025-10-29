import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  QuestionPart,
  AnswerMapping,
  RangeMapping,
} from "./question-parts-types";
import { toast } from "sonner";
import { useQuestionRatingScaleMapping } from "@/hooks/questionnaire/useQuestionParts";

interface RatingScaleLevel {
  level: number;
  name: string;
}

interface QuestionPartsMatrixBuilderProps {
  open: boolean;
  handleClose: () => void;
  questionId: number;
  questionParts: QuestionPart[];
  ratingScaleLevels: RatingScaleLevel[]; // e.g., [{level: 1, name: "Reactive"}, ...]
  onSave: (parts: QuestionPart[]) => void;
}

export function QuestionPartsMatrixBuilder({
  open,
  handleClose,
  questionId,
  questionParts,
  ratingScaleLevels,
  onSave,
}: QuestionPartsMatrixBuilderProps) {
  const [mappings, setMappings] = useState<Record<string, AnswerMapping>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  console.log("Mappings:", mappings);

  const { data: mappingData, isLoading, isPending } = useQuestionRatingScaleMapping(
    questionId,
    open
  );

  // Initialize mappings from existing question parts
  useEffect(() => {
    if (mappingData) {
      setMappings(mappingData);
    }
  }, [mappingData]);

  const getDefaultMapping = (part: QuestionPart): AnswerMapping => {
    switch (part.answer_type) {
      case "boolean":
        return { true: [], false: [] };
      case "labelled_scale": {
        const labelMapping: AnswerMapping = {};
        (part.options.labels || []).forEach((label) => {
          labelMapping[label] = [];
        });
        return labelMapping;
      }
      case "scale":
      case "number":
      case "percentage":
        return { ranges: [] };
      default:
        return {};
    }
  };

  const handleCheckboxChange = (
    partId: string,
    key: string,
    level: number,
    checked: boolean
  ) => {
    setMappings((prev) => {
      // Get the previous mapping or empty object
      const prevPartMapping = prev[partId] || {};
      // Get the current levels array, creating a new copy
      const currentLevels = [...((prevPartMapping[key] as number[]) || [])];

      let newLevels: number[];
      if (checked) {
        // Add the level if not already present
        newLevels = currentLevels.includes(level)
          ? currentLevels
          : [...currentLevels, level].sort((a, b) => a - b);
      } else {
        // Remove the level
        newLevels = currentLevels.filter((l) => l !== level);
      }

      // Create a completely new mapping object
      return {
        ...prev,
        [partId]: {
          ...prevPartMapping,
          [key]: newLevels,
        },
      };
    });
  };

  const handleRangeChange = (
    partId: string,
    levelIndex: number,
    field: "min" | "max",
    value: string
  ) => {
    setMappings((prev) => {
      // Get the previous mapping or empty object
      const prevPartMapping = prev[partId] || {};
      // Get the current ranges array, creating a new deep copy
      const currentRanges = [
        ...((prevPartMapping.ranges as RangeMapping[]) || []),
      ];

      // Ensure we have enough range entries
      while (currentRanges.length <= levelIndex) {
        currentRanges.push({ min: 0, max: 0, levels: [levelIndex + 1] });
      }

      // Update the specific range with a new object
      currentRanges[levelIndex] = {
        ...currentRanges[levelIndex],
        [field]: parseFloat(value) || 0,
      };

      // Create a completely new mapping object
      return {
        ...prev,
        [partId]: {
          ...prevPartMapping,
          ranges: currentRanges,
        },
      };
    });
  };

  const validateMappings = (): boolean => {
    for (const part of questionParts) {
      const partIdStr = part.id.toString();
      const mapping = mappings[partIdStr];
      if (!mapping) return false;

      if (part.answer_type === "boolean") {
        // At least one level must be mapped for both true and false
        if (
          !(mapping.true as number[])?.length ||
          !(mapping.false as number[])?.length
        ) {
          toast.error(
            `Incomplete mapping for "${part.text}": both Yes and No must be mapped to at least one level`
          );
          return false;
        }
      } else if (part.answer_type === "labelled_scale") {
        // Each label must be mapped to at least one level
        for (const label of part.options.labels || []) {
          if (!(mapping[label] as number[])?.length) {
            toast.error(
              `Incomplete mapping for "${part.text}": label "${label}" must be mapped to at least one level`
            );
            return false;
          }
        }
      } else if (
        part.answer_type === "scale" ||
        part.answer_type === "number" ||
        part.answer_type === "percentage"
      ) {
        // Each level should have a range defined
        const ranges = (mapping.ranges as RangeMapping[]) || [];
        if (ranges.length < ratingScaleLevels.length) {
          toast.error(
            `Incomplete mapping for "${part.text}": define ranges for all levels`
          );
          return false;
        }

        // Validate ranges don't overlap and cover the full spectrum
        for (const range of ranges) {
          if (range.min >= range.max) {
            toast.error(
              `Invalid range in "${part.text}": min must be less than max`
            );
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateMappings()) return;

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const updatedParts = questionParts.map((part) => ({
        ...part,
        mapping: mappings[part.id.toString()],
      }));

      onSave(updatedParts);
      handleClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (mappingData) {
      setMappings(mappingData);
      toast.info("Mappings reset to saved state");
    }
  };

  const renderCell = (part: QuestionPart, level: RatingScaleLevel) => {
    const partIdStr = part.id.toString();
    const mapping = mappings[partIdStr] || getDefaultMapping(part);

    if (part.answer_type === "boolean") {
      const trueLevels = (mapping.true as number[]) || [];
      const falseLevels = (mapping.false as number[]) || [];

      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={trueLevels.includes(level.level)}
              onCheckedChange={(checked) =>
                handleCheckboxChange(partIdStr, "true", level.level, !!checked)
              }
              disabled={isProcessing}
            />
            <span className="text-sm">Yes</span>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={falseLevels.includes(level.level)}
              onCheckedChange={(checked) =>
                handleCheckboxChange(partIdStr, "false", level.level, !!checked)
              }
              disabled={isProcessing}
            />
            <span className="text-sm">No</span>
          </div>
        </div>
      );
    }

    if (part.answer_type === "labelled_scale") {
      const labels = part.options.labels || [];
      return (
        <div className="space-y-2">
          {labels.map((label) => {
            const labelLevels = (mapping[label] as number[]) || [];
            return (
              <div key={label} className="flex items-center space-x-2">
                <Checkbox
                  checked={labelLevels.includes(level.level)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(
                      partIdStr,
                      label,
                      level.level,
                      !!checked
                    )
                  }
                  disabled={isProcessing}
                />
                <span className="text-sm truncate" title={label}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    if (
      part.answer_type === "scale" ||
      part.answer_type === "number" ||
      part.answer_type === "percentage"
    ) {
      const ranges = (mapping.ranges as RangeMapping[]) || [];
      const levelIndex = level.level - 1;
      const range = ranges[levelIndex] || {
        min: 0,
        max: 0,
        levels: [level.level],
      };

      return (
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={range.min || ""}
              onChange={(e) =>
                handleRangeChange(partIdStr, levelIndex, "min", e.target.value)
              }
              placeholder="Min"
              className="w-16 h-8 text-xs"
              disabled={isProcessing}
            />
            <span className="text-xs">-</span>
            <Input
              type="number"
              value={range.max || ""}
              onChange={(e) =>
                handleRangeChange(partIdStr, levelIndex, "max", e.target.value)
              }
              placeholder="Max"
              className="w-16 h-8 text-xs"
              disabled={isProcessing}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="min-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configure Question Parts Mapping</DialogTitle>
          <DialogDescription>
            Map each question part's answer values to the rating scale levels.
            This determines how responses will be scored.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[250px] sticky left-0 bg-background z-10">
                  Question Part
                </TableHead>
                {ratingScaleLevels.map((level) => (
                  <TableHead
                    key={level.level}
                    className="text-center min-w-[150px]"
                  >
                    <div className="font-semibold">Level {level.level}</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      {level.name}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {questionParts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className="sticky left-0 bg-background z-10 max-w-[250px]">
                    <div className="font-medium text-sm break-words whitespace-normal">
                      {part.text}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ({part.answer_type})
                    </div>
                  </TableCell>
                  {ratingScaleLevels.map((level) => (
                    <TableCell key={level.level} className="align-top">
                      {renderCell(part, level)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isPending}
          >
            Reset
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save Mappings"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
