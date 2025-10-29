/**
 * Type definitions for weighted scoring configuration
 * Used for question parts mapping to rating scale levels
 */

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
 * Numeric range for numeric question parts
 */
export interface NumericRange {
  min: number;
  max: number;
  level: number;
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
export type PartScoring = BooleanScoring | LabelledScaleScoring | NumericScoring;

/**
 * Complete weighted scoring configuration
 * Stored in the rating_scale_mapping field of questionnaire_questions table
 */
export interface WeightedScoringConfig {
  version: "weighted";
  partScoring: {
    [partId: string]: PartScoring;
  };
}
