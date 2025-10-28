import type { QuestionPart } from "./question-parts-types";

/**
 * Scoring configuration for a boolean question part
 * Maps true/false to rating scale level values (1 to N)
 */
export interface BooleanScoring {
  true: number;  // Level number (1-N)
  false: number; // Level number (1-N)
}

/**
 * Scoring configuration for a labelled scale question part
 * Maps each label to a rating scale level value (1 to N)
 */
export interface LabelledScaleScoring {
  [label: string]: number; // Level number (1-N)
}

/**
 * Scoring configuration for numeric question parts (scale, number, percentage)
 * Controls whether higher values map to higher or lower levels
 */
export interface NumericScoring {
  reversed: boolean; // If true, higher values map to lower levels
}

/**
 * Union type for all possible scoring configurations
 */
export type PartScoring = BooleanScoring | LabelledScaleScoring | NumericScoring;

/**
 * Complete weighted scoring configuration
 * Stored in the rating_scale_mapping field
 */
export interface WeightedScoringConfig {
  version: "weighted";
  partScoring: {
    [partId: string]: PartScoring;
  };
}

/**
 * Test scenario for the preview panel
 * Shows how a specific combination of answers maps to a level
 */
export interface TestScenario {
  name: string;
  description: string;
  answers: {
    [partId: string]: boolean | string | number;
  };
  partLevels: number[]; // Individual levels from each part
  averageLevel: number; // Final averaged level (rounded)
}

/**
 * Auto-calculated range for numeric questions
 */
export interface NumericRange {
  min: number;
  max: number;
  level: number;
}

/**
 * Helper type to identify if a scoring config is for a specific type
 */
export function isBooleanScoring(scoring: PartScoring): scoring is BooleanScoring {
  return "true" in scoring && "false" in scoring;
}

export function isLabelledScaleScoring(
  scoring: PartScoring
): scoring is LabelledScaleScoring {
  return !isBooleanScoring(scoring) && !isNumericScoring(scoring);
}

export function isNumericScoring(scoring: PartScoring): scoring is NumericScoring {
  return "reversed" in scoring;
}

/**
 * Get auto-calculated ranges for numeric question types
 * Distributes the min-max range evenly across all levels
 * @param part - The question part with min/max options
 * @param numLevels - Number of rating scale levels
 * @param reversed - If true, higher values map to lower levels
 */
export function getNumericRanges(
  part: QuestionPart,
  numLevels: number,
  reversed = false
): NumericRange[] {
  const min = part.options.min || 0;
  const max = part.options.max || 100;
  const rangeSize = (max - min) / numLevels;

  const ranges: NumericRange[] = [];
  for (let i = 0; i < numLevels; i++) {
    const rangeMin = min + i * rangeSize;
    const rangeMax = i === numLevels - 1 ? max : min + (i + 1) * rangeSize;

    // If reversed, higher ranges get lower levels
    const level = reversed ? numLevels - i : i + 1;

    ranges.push({
      min: Math.round(rangeMin * 100) / 100,
      max: Math.round(rangeMax * 100) / 100,
      level: level,
    });
  }

  return ranges;
}

/**
 * Calculate which level a numeric answer maps to
 */
export function calculateNumericLevel(
  answer: number,
  ranges: NumericRange[]
): number {
  for (const range of ranges) {
    if (answer >= range.min && answer <= range.max) {
      return range.level;
    }
  }
  // Default to highest level if answer exceeds all ranges
  return ranges[ranges.length - 1]?.level || 1;
}

/**
 * Calculate the level for a specific part based on its answer
 */
export function calculatePartLevel(
  part: QuestionPart,
  scoring: PartScoring | undefined,
  answer: boolean | string | number,
  numLevels: number
): number {
  switch (part.answer_type) {
    case "boolean":
      if (scoring && isBooleanScoring(scoring)) {
        return answer ? scoring.true : scoring.false;
      }
      return 1;

    case "labelled_scale":
      if (scoring && isLabelledScaleScoring(scoring) && typeof answer === "string") {
        return scoring[answer] || 1;
      }
      return 1;

    case "scale":
    case "number":
    case "percentage":
      if (typeof answer === "number") {
        const reversed = scoring && isNumericScoring(scoring) ? scoring.reversed : false;
        const ranges = getNumericRanges(part, numLevels, reversed);
        return calculateNumericLevel(answer, ranges);
      }
      return 1;

    default:
      return 1;
  }
}

/**
 * Calculate average level across multiple parts (rounded to nearest integer)
 */
export function calculateAverageLevel(levels: number[]): number {
  if (levels.length === 0) return 1;
  const sum = levels.reduce((acc, level) => acc + level, 0);
  const average = sum / levels.length;
  return Math.round(average);
}
