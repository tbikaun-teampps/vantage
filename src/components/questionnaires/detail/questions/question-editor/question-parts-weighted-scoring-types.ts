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
 * Uses thresholds to define upper bounds for each level (except the last)
 * Example: [30, 70] for 3 levels with range 0-100 means:
 *   Level 1: 0-30, Level 2: 31-70, Level 3: 71-100
 */
export interface NumericScoring {
  thresholds: number[]; // Upper bounds for levels 1 through N-1
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
  return "thresholds" in scoring;
}

/**
 * Get ranges for numeric question types based on user-defined thresholds
 * Thresholds define the upper bounds for levels 1 through N-1
 * @param part - The question part with min/max options
 * @param thresholds - Upper bounds for each level except the last
 */
export function getNumericRanges(
  part: QuestionPart,
  thresholds: number[]
): NumericRange[] {
  const min = part.options.min || 0;
  const max = part.options.max || 100;
  const numLevels = thresholds.length + 1;

  const ranges: NumericRange[] = [];

  // Build ranges from thresholds
  for (let i = 0; i < numLevels; i++) {
    const rangeMin = i === 0 ? min : thresholds[i - 1] + 1;
    const rangeMax = i === numLevels - 1 ? max : thresholds[i];

    ranges.push({
      min: rangeMin,
      max: rangeMax,
      level: i + 1,
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
      if (typeof answer === "number" && scoring && isNumericScoring(scoring)) {
        const ranges = getNumericRanges(part, scoring.thresholds);
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
