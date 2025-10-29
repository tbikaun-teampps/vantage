// Types for question parts (UI-only mock)

export type AnswerType =
  | "boolean"
  | "scale"
  | "percentage"
  | "number"
  | "labelled_scale";

export interface QuestionPartOptions {
  // For scale/number types
  min?: number;
  max?: number;
  step?: number;
  decimal_places?: number;

  // For labelled_scale type
  labels?: string[];
}

// Mapping structure for different answer types
export interface RangeMapping {
  min: number;
  max: number;
  levels: number[]; // Array of rating scale level numbers that this range maps to
}

export interface AnswerMapping {
  // For boolean: { "true": [1,2], "false": [3,4,5] }
  // For labelled_scale: { "Basic": [1,2], "Detailed": [3,4,5] }
  // For scale/number/percentage: { "ranges": [{min:0, max:25, levels:[1]}, ...] }
  [key: string]: number[] | RangeMapping[];
}

export interface QuestionPart {
  id: number;
  text: string;
  answer_type: AnswerType;
  options: QuestionPartOptions;
  mapping?: AnswerMapping; // Maps answer values to rating scale levels
  order_index: number;
}

export interface QuestionPartFormData {
  text: string;
  answer_type: AnswerType;
  // Options for scale/number
  min: string;
  max: string;
  step: string;
  decimal_places: string;
  // Options for labelled_scale
  labels: string[];
}
