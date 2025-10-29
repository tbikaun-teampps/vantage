import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { QuestionPart } from "./question-parts-types";
import {
  type WeightedScoringConfig,
  type PartScoring,
  type NumericScoring,
  type TestScenario,
  type NumericRange,
  isBooleanScoring,
  isNumericScoring,
  calculatePartLevel,
  calculateAverageLevel,
} from "./question-parts-weighted-scoring-types";
import { toast } from "sonner";
import { useQuestionRatingScaleMapping } from "@/hooks/questionnaire/useQuestionParts";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RatingScaleLevel {
  level: number;
  name: string;
}

interface QuestionPartsWeightedScoringBuilderProps {
  open: boolean;
  handleClose: () => void;
  questionId: number;
  questionParts: QuestionPart[];
  ratingScaleLevels: RatingScaleLevel[];
  onSave: (config: WeightedScoringConfig) => void;
}

export function QuestionPartsWeightedScoringBuilder({
  open,
  handleClose,
  questionId,
  questionParts,
  ratingScaleLevels,
  onSave,
}: QuestionPartsWeightedScoringBuilderProps) {
  const [config, setConfig] = useState<WeightedScoringConfig>({
    version: "weighted",
    partScoring: {},
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const { data: mappingData, isPending } = useQuestionRatingScaleMapping(
    questionId,
    open
  );

  // Initialize config from existing data or create defaults
  useEffect(() => {
    if (!mappingData) {
      // No existing mapping - create defaults
      const defaultConfig = createDefaultConfig(
        questionParts,
        ratingScaleLevels.length
      );
      setConfig(defaultConfig);
      return;
    }

    // Data should already be in weighted format from backend
    setConfig(mappingData);
  }, [mappingData, questionParts, ratingScaleLevels.length]);

  // No threshold calculation needed - levels are assigned directly!

  // Generate test scenarios for preview
  const testScenarios = useMemo<TestScenario[]>(() => {
    if (questionParts.length === 0 || ratingScaleLevels.length === 0) {
      return [];
    }

    const scenarios: TestScenario[] = [];
    const numLevels = ratingScaleLevels.length;

    // Scenario 1: All minimum level answers
    const minAnswers: Record<string, boolean | string | number> = {};
    const minPartLevels: number[] = [];

    questionParts.forEach((part) => {
      const partId = part.id.toString();
      const scoring = config.partScoring[partId];

      let answer: boolean | string | number;
      if (part.answer_type === "boolean") {
        // Choose answer with lower level
        const boolScoring = scoring as { true: number; false: number };
        answer =
          (boolScoring?.false || 1) <= (boolScoring?.true || numLevels)
            ? false
            : true;
      } else if (part.answer_type === "labelled_scale") {
        const labels = part.options.labels || [];
        const labelScoring = scoring as Record<string, number>;
        // Find label with minimum level
        const minLabel = labels.reduce((min, label) =>
          (labelScoring?.[label] || numLevels) <
          (labelScoring?.[min] || numLevels)
            ? label
            : min
        );
        answer = minLabel;
      } else {
        // Numeric: use min value
        answer = part.options.min || 0;
      }

      minAnswers[partId] = answer;
      const partLevel = calculatePartLevel(part, scoring, answer, numLevels);
      minPartLevels.push(partLevel);
    });

    scenarios.push({
      name: "All Minimum",
      description: "Lowest levels from all parts",
      answers: minAnswers,
      partLevels: minPartLevels,
      averageLevel: calculateAverageLevel(minPartLevels),
    });

    // Scenario 2: All maximum level answers
    const maxAnswers: Record<string, boolean | string | number> = {};
    const maxPartLevels: number[] = [];

    questionParts.forEach((part) => {
      const partId = part.id.toString();
      const scoring = config.partScoring[partId];

      let answer: boolean | string | number;
      if (part.answer_type === "boolean") {
        const boolScoring = scoring as { true: number; false: number };
        answer =
          (boolScoring?.true || numLevels) >= (boolScoring?.false || 1)
            ? true
            : false;
      } else if (part.answer_type === "labelled_scale") {
        const labels = part.options.labels || [];
        const labelScoring = scoring as Record<string, number>;
        const maxLabel = labels.reduce((max, label) =>
          (labelScoring?.[label] || 1) > (labelScoring?.[max] || 1)
            ? label
            : max
        );
        answer = maxLabel;
      } else {
        answer = part.options.max || 100;
      }

      maxAnswers[partId] = answer;
      const partLevel = calculatePartLevel(part, scoring, answer, numLevels);
      maxPartLevels.push(partLevel);
    });

    scenarios.push({
      name: "All Maximum",
      description: "Highest levels from all parts",
      answers: maxAnswers,
      partLevels: maxPartLevels,
      averageLevel: calculateAverageLevel(maxPartLevels),
    });

    // Scenario 3: Mixed/median values
    const mixedAnswers: Record<string, boolean | string | number> = {};
    const mixedPartLevels: number[] = [];

    questionParts.forEach((part) => {
      const partId = part.id.toString();
      const scoring = config.partScoring[partId];

      let answer: boolean | string | number;
      if (part.answer_type === "boolean") {
        answer = true; // Default to true for mixed
      } else if (part.answer_type === "labelled_scale") {
        const labels = part.options.labels || [];
        const midIndex = Math.floor(labels.length / 2);
        answer = labels[midIndex] || labels[0];
      } else {
        const min = part.options.min || 0;
        const max = part.options.max || 100;
        answer = min + (max - min) / 2;
      }

      mixedAnswers[partId] = answer;
      const partLevel = calculatePartLevel(part, scoring, answer, numLevels);
      mixedPartLevels.push(partLevel);
    });

    scenarios.push({
      name: "Mixed Values",
      description: "Middle/median answers",
      answers: mixedAnswers,
      partLevels: mixedPartLevels,
      averageLevel: calculateAverageLevel(mixedPartLevels),
    });

    return scenarios;
  }, [questionParts, config, ratingScaleLevels]);

  const handleLevelChange = (partId: string, key: string, value: string) => {
    const levelValue = parseInt(value, 10);
    const maxLevel = ratingScaleLevels.length;

    if (isNaN(levelValue) || levelValue < 1 || levelValue > maxLevel) {
      toast.error(`Level must be between 1 and ${maxLevel}`);
      return;
    }

    setConfig((prev) => {
      const prevScoring = prev.partScoring[partId] || {};
      return {
        ...prev,
        partScoring: {
          ...prev.partScoring,
          [partId]: {
            ...prevScoring,
            [key]: levelValue,
          },
        },
      };
    });
  };

  const handleRangeChange = (
    partId: string,
    rangeIndex: number,
    field: "min" | "max" | "level",
    value: string
  ) => {
    const numValue =
      field === "level" ? parseInt(value, 10) : parseFloat(value);
    if (value !== "" && isNaN(numValue)) {
      return; // Invalid input, ignore
    }

    setConfig((prev) => {
      const prevScoring = prev.partScoring[partId] as NumericScoring;
      const newRanges = [...(prevScoring || [])];

      if (!newRanges[rangeIndex]) {
        newRanges[rangeIndex] = { min: 0, max: 100, level: 1 };
      }

      newRanges[rangeIndex] = {
        ...newRanges[rangeIndex],
        [field]: numValue,
      };

      return {
        ...prev,
        partScoring: {
          ...prev.partScoring,
          [partId]: newRanges,
        },
      };
    });
  };

  const handleAddRange = (partId: string, part: QuestionPart) => {
    const min = part.options.min || 0;
    const max = part.options.max || 100;

    setConfig((prev) => {
      const prevScoring = prev.partScoring[partId] as NumericScoring;
      const newRanges = [...(prevScoring || [])];

      // Find the next available min value
      const lastRange = newRanges[newRanges.length - 1];
      const newMin = lastRange ? lastRange.max + 1 : min;

      newRanges.push({
        min: newMin,
        max: max,
        level: 1,
      });

      return {
        ...prev,
        partScoring: {
          ...prev.partScoring,
          [partId]: newRanges,
        },
      };
    });
  };

  const handleRemoveRange = (partId: string, rangeIndex: number) => {
    setConfig((prev) => {
      const prevScoring = prev.partScoring[partId] as NumericScoring;
      const newRanges = (prevScoring || []).filter((_, i) => i !== rangeIndex);

      return {
        ...prev,
        partScoring: {
          ...prev.partScoring,
          [partId]: newRanges,
        },
      };
    });
  };

  const validateConfig = (): boolean => {
    const maxLevel = ratingScaleLevels.length;

    // Check that all parts have scoring configured
    for (const part of questionParts) {
      const partId = part.id.toString();
      const scoring = config.partScoring[partId];

      if (!scoring) {
        toast.error(`Missing level assignment for "${part.text}"`);
        return false;
      }

      if (part.answer_type === "boolean") {
        if (!isBooleanScoring(scoring)) {
          toast.error(
            `Invalid configuration for boolean question "${part.text}"`
          );
          return false;
        }
        // Validate level values are in range
        if (
          scoring.true < 1 ||
          scoring.true > maxLevel ||
          scoring.false < 1 ||
          scoring.false > maxLevel
        ) {
          toast.error(
            `Levels for "${part.text}" must be between 1 and ${maxLevel}`
          );
          return false;
        }
      } else if (part.answer_type === "labelled_scale") {
        const labels = part.options.labels || [];
        const labelScoring = scoring as Record<string, number>;
        for (const label of labels) {
          if (!(label in labelScoring)) {
            toast.error(
              `Missing level assignment for label "${label}" in "${part.text}"`
            );
            return false;
          }
          const level = labelScoring[label];
          if (level < 1 || level > maxLevel) {
            toast.error(
              `Level for "${label}" in "${part.text}" must be between 1 and ${maxLevel}`
            );
            return false;
          }
        }
      } else if (
        part.answer_type === "scale" ||
        part.answer_type === "number" ||
        part.answer_type === "percentage"
      ) {
        if (!isNumericScoring(scoring)) {
          toast.error(
            `Invalid configuration for numeric question "${part.text}"`
          );
          return false;
        }

        const min = part.options.min || 0;
        const max = part.options.max || 100;
        const ranges = scoring;

        // Validate at least one range exists
        if (ranges.length === 0) {
          toast.error(`At least one range is required for "${part.text}"`);
          return false;
        }

        // Validate each range
        for (let i = 0; i < ranges.length; i++) {
          const range = ranges[i];

          // Validate range bounds are within question min/max
          if (range.min < min || range.max > max) {
            toast.error(
              `Range ${i + 1} for "${part.text}" must be within ${min}-${max}`
            );
            return false;
          }

          // Validate min < max
          if (range.min > range.max) {
            toast.error(
              `Range ${i + 1} for "${part.text}": min must be less than or equal to max`
            );
            return false;
          }

          // Validate level is within bounds
          if (range.level < 1 || range.level > maxLevel) {
            toast.error(
              `Range ${i + 1} for "${part.text}": level must be between 1 and ${maxLevel}`
            );
            return false;
          }

          // Check for overlaps with other ranges
          for (let j = i + 1; j < ranges.length; j++) {
            const otherRange = ranges[j];
            if (
              (range.min >= otherRange.min && range.min <= otherRange.max) ||
              (range.max >= otherRange.min && range.max <= otherRange.max) ||
              (otherRange.min >= range.min && otherRange.min <= range.max)
            ) {
              toast.error(
                `Ranges for "${part.text}" overlap - ranges ${i + 1} and ${j + 1}`
              );
              return false;
            }
          }
        }

        // Check for full coverage (no gaps)
        const sortedRanges = [...ranges].sort((a, b) => a.min - b.min);
        let covered = min;
        for (const range of sortedRanges) {
          if (range.min > covered) {
            toast.error(
              `Gap detected in ranges for "${part.text}" between ${covered} and ${range.min}`
            );
            return false;
          }
          covered = Math.max(covered, range.max + 1);
        }
        if (covered <= max) {
          toast.error(
            `Incomplete coverage for "${part.text}" - missing range from ${covered} to ${max}`
          );
          return false;
        }
      }
    }

    // Warn if single level scale
    if (ratingScaleLevels.length === 1) {
      toast.warning(
        "Single level scale: all answer combinations will map to Level 1"
      );
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateConfig()) return;

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Save weighted config directly
      onSave(config);
      handleClose();
      toast.success("Level mapping configuration saved");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (mappingData) {
      // Reset to saved weighted config
      setConfig(mappingData);
      toast.info("Configuration reset to saved state");
    }
  };

  const renderPartScoring = (part: QuestionPart) => {
    const partId = part.id.toString();
    const scoring = config.partScoring[partId];
    const maxLevel = ratingScaleLevels.length;

    // Generate level options for dropdown
    const levelOptions = Array.from({ length: maxLevel }, (_, i) => {
      const level = i + 1;
      const levelName = ratingScaleLevels.find((l) => l.level === level)?.name;
      return {
        value: level,
        label: levelName ? `Level ${level} (${levelName})` : `Level ${level}`,
      };
    });

    if (part.answer_type === "boolean") {
      const trueLabel = part.options.true_label || "Yes";
      const falseLabel = part.options.false_label || "No";
      const boolScoring = scoring as
        | { true: number; false: number }
        | undefined;

      return (
        <div className="flex gap-8 justify-center">
          <div className="flex gap-4">
            <Label htmlFor={`${partId}-true`} className="text-sm">
              {trueLabel}
            </Label>
            <Select
              value={boolScoring?.true?.toString() || "1"}
              onValueChange={(value) =>
                handleLevelChange(partId, "true", value)
              }
              disabled={isProcessing}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {levelOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-4">
            <Label htmlFor={`${partId}-false`} className="text-sm">
              {falseLabel}
            </Label>
            <Select
              value={boolScoring?.false?.toString() || "1"}
              onValueChange={(value) =>
                handleLevelChange(partId, "false", value)
              }
              disabled={isProcessing}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {levelOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    if (part.answer_type === "labelled_scale") {
      const labels = part.options.labels || [];
      const labelScoring = scoring as Record<string, number> | undefined;

      return (
        <div className="grid grid-cols-5 gap-2">
          {labels.map((label) => (
            <div key={label} className="flex items-center gap-4">
              <Label
                htmlFor={`${partId}-${label}`}
                className="text-sm truncate"
                title={label}
              >
                {label}
              </Label>
              <Select
                value={labelScoring?.[label]?.toString() || "1"}
                onValueChange={(value) =>
                  handleLevelChange(partId, label, value)
                }
                disabled={isProcessing}
              >
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      );
    }

    if (
      part.answer_type === "scale" ||
      part.answer_type === "number" ||
      part.answer_type === "percentage"
    ) {
      const min = part.options.min || 0;
      const max = part.options.max || 100;
      const numericScoring = scoring as NumericScoring | undefined;
      const ranges = numericScoring || [];

      return (
        <div className="space-y-3">
          {/* Range inputs */}
          <div className="grid grid-cols-3 gap-2 ">
            {ranges.map((range, i) => {
              return (
                <div
                  key={i}
                  className="border rounded p-3 space-y-2 bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Range {i + 1}</div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRange(partId, i)}
                      disabled={isProcessing || ranges.length === 1}
                      className="h-6 px-2"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label
                        htmlFor={`${partId}-range-${i}-min`}
                        className="text-xs"
                      >
                        Min
                      </Label>
                      <Input
                        id={`${partId}-range-${i}-min`}
                        type="number"
                        value={range.min ?? ""}
                        onChange={(e) =>
                          handleRangeChange(partId, i, "min", e.target.value)
                        }
                        disabled={isProcessing}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={`${partId}-range-${i}-max`}
                        className="text-xs"
                      >
                        Max
                      </Label>
                      <Input
                        id={`${partId}-range-${i}-max`}
                        type="number"
                        value={range.max ?? ""}
                        onChange={(e) =>
                          handleRangeChange(partId, i, "max", e.target.value)
                        }
                        disabled={isProcessing}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor={`${partId}-range-${i}-level`}
                        className="text-xs"
                      >
                        Level
                      </Label>
                      <Select
                        value={range.level?.toString() || "1"}
                        onValueChange={(value) =>
                          handleRangeChange(partId, i, "level", value)
                        }
                        disabled={isProcessing}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {levelOptions.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value.toString()}
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add range button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddRange(partId, part)}
            disabled={isProcessing}
            className="w-full"
          >
            Add Range
          </Button>

          {/* Help text */}
          <div className="text-xs text-muted-foreground text-center">
            Define numeric ranges ({min} - {max}) and their corresponding
            levels. Ranges must not overlap and should cover the entire range.
          </div>
        </div>
      );
    }

    return (
      <div className="text-sm text-muted-foreground">
        No configuration needed
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="min-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Configure Question Answer to Rating Scale Mapping
          </DialogTitle>
          <DialogDescription>
            Specify how answers to each question part map to rating scale
            levels. These are used to automatically calculate the overall
            question rating score based on weighted averages.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Panel 1: Question Configuration */}
          <div className="space-y-4">
            {questionParts.map((part, index) => (
              <div key={part.id} className="py-2 space-y-3">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 border-t border-gray-300" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-medium text-lg whitespace-nowrap">
                      {index + 1}. {part.text}
                    </span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {part.answer_type.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex-1 border-t border-gray-300" />
                </div>
                {renderPartScoring(part)}
              </div>
            ))}
          </div>

          {/* Panel 2: Preview */}
          {/* <Card className="shadow-none border-none p-0">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
              <CardDescription>
                See how different answer combinations map to levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testScenarios.length === 0 ? (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Configure level mapping to see test scenarios
                </div>
              ) : (
                <Card>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Scenario</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">
                            Part Levels
                          </TableHead>
                          <TableHead className="text-right">
                            Average Calculation
                          </TableHead>
                          <TableHead className="text-right">
                            Final Level
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testScenarios.map((scenario) => {
                          const levelName = ratingScaleLevels.find(
                            (l) => l.level === scenario.averageLevel
                          )?.name;
                          const avgCalc =
                            scenario.partLevels.length > 0
                              ? `(${scenario.partLevels.join(" + ")}) / ${scenario.partLevels.length}`
                              : "N/A";
                          return (
                            <TableRow key={scenario.name}>
                              <TableCell className="font-medium">
                                {scenario.name}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {scenario.description}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs">
                                {scenario.partLevels.join(", ")}
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs">
                                {avgCalc}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-primary/10 text-primary">
                                  <span className="font-medium">
                                    Level {scenario.averageLevel}
                                  </span>
                                  {levelName && (
                                    <span className="text-xs">
                                      ({levelName})
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card> */}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isPending || isProcessing}
          >
            Reset
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending || isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending || isProcessing}>
              {isProcessing ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to create default config for new questions
function createDefaultConfig(
  parts: QuestionPart[],
  maxLevel: number
): WeightedScoringConfig {
  const partScoring: Record<string, PartScoring> = {};

  parts.forEach((part) => {
    const partId = part.id.toString();

    if (part.answer_type === "boolean") {
      // Default: true maps to max level, false maps to level 1
      partScoring[partId] = {
        true: maxLevel,
        false: 1,
      };
    } else if (part.answer_type === "labelled_scale") {
      // Distribute levels evenly across labels
      const labels = part.options.labels || [];
      const labelScoring: Record<string, number> = {};

      labels.forEach((label, index) => {
        if (labels.length === 1) {
          // Single label defaults to max level
          labelScoring[label] = maxLevel;
        } else {
          // Distribute evenly: map label index to levels
          const levelForLabel = Math.round(
            (index / (labels.length - 1)) * (maxLevel - 1) + 1
          );
          labelScoring[label] = levelForLabel;
        }
      });
      partScoring[partId] = labelScoring;
    } else if (
      part.answer_type === "scale" ||
      part.answer_type === "number" ||
      part.answer_type === "percentage"
    ) {
      // Numeric questions: generate evenly distributed ranges
      const min = part.options.min || 0;
      const max = part.options.max || 100;
      const ranges: NumericRange[] = [];
      const rangeSize = (max - min) / maxLevel;

      // Generate ranges for each level
      for (let i = 0; i < maxLevel; i++) {
        const rangeMin = Math.floor(min + i * rangeSize);
        const rangeMax =
          i === maxLevel - 1 ? max : Math.floor(min + (i + 1) * rangeSize) - 1;

        ranges.push({
          min: rangeMin,
          max: rangeMax,
          level: i + 1,
        });
      }

      partScoring[partId] = ranges;
    }
  });

  return {
    version: "weighted",
    partScoring,
  };
}
