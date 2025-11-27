// import type { QuestionPart } from "./question-parts-types";

/**
 * Scoring configuration for a boolean question part
 * Maps true/false to rating scale level values (1 to N)
 */
interface BooleanScoring {
  true: number; // Level number (1-N)
  false: number; // Level number (1-N)
}

/**
 * Scoring configuration for a labelled scale question part
 * Maps each label to a rating scale level value (1 to N)
 */
interface LabelledScaleScoring {
  [label: string]: number; // Level number (1-N)
}

/**
 * Scoring configuration for numeric question parts (scale, number, percentage)
 * Explicit ranges that map numeric values to rating scale levels
 * Example: [{ min: 0, max: 30, level: 1 }, { min: 31, max: 70, level: 2 }]
 */
export type NumericScoring = NumericRange[];

/**
 * Union type for all possible scoring configurations
 */
export type PartScoring =
  | BooleanScoring
  | LabelledScaleScoring
  | NumericScoring;

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
export function isBooleanScoring(
  scoring: PartScoring
): scoring is BooleanScoring {
  return "true" in scoring && "false" in scoring;
}

// function isLabelledScaleScoring(
//   scoring: PartScoring
// ): scoring is LabelledScaleScoring {
//   return !isBooleanScoring(scoring) && !isNumericScoring(scoring);
// }

export function isNumericScoring(
  scoring: PartScoring
): scoring is NumericScoring {
  return Array.isArray(scoring);
}

/**
 * Calculate which level a numeric answer maps to
 */
// function calculateNumericLevel(answer: number, ranges: NumericRange[]): number {
//   for (const range of ranges) {
//     if (answer >= range.min && answer <= range.max) {
//       return range.level;
//     }
//   }
//   // Default to highest level if answer exceeds all ranges
//   return ranges[ranges.length - 1]?.level || 1;
// }

/**
 * Calculate the level for a specific part based on its answer
 */
// export function calculatePartLevel(
//   part: QuestionPart,
//   scoring: PartScoring | undefined,
//   answer: boolean | string | number,
// ): number {
//   switch (part.answer_type) {
//     case "boolean":
//       if (scoring && isBooleanScoring(scoring)) {
//         return answer ? scoring.true : scoring.false;
//       }
//       return 1;

//     case "labelled_scale":
//       if (
//         scoring &&
//         isLabelledScaleScoring(scoring) &&
//         typeof answer === "string"
//       ) {
//         return scoring[answer] || 1;
//       }
//       return 1;

//     case "scale":
//     case "number":
//     case "percentage":
//       if (typeof answer === "number" && scoring && isNumericScoring(scoring)) {
//         return calculateNumericLevel(answer, scoring);
//       }
//       return 1;

//     default:
//       return 1;
//   }
// }

/**
 * Calculate average level across multiple parts (rounded to nearest integer)
 */
// export function calculateAverageLevel(levels: number[]): number {
//   if (levels.length === 0) return 1;
//   const sum = levels.reduce((acc, level) => acc + level, 0);
//   const average = sum / levels.length;
//   return Math.round(average);
// }
