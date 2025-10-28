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
 * Stored in the rating_scale_mapping field of questionnaire_questions table
 */
export interface WeightedScoringConfig {
  version: "weighted";
  partScoring: {
    [partId: string]: PartScoring;
  };
}
