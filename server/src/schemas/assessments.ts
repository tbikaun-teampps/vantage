import {
  AssessmentStatus,
  AssessmentType,
} from "../types/entities/assessments";

export const AssessmentStatusEnum: AssessmentStatus[] = [
  "draft",
  "active",
  "under_review",
  "completed",
  "archived",
];

export const AssessmentTypeEnum: AssessmentType[] = ["onsite", "desktop"];

export type AssessmentMeasurementDefinitionStatus =
  | "in_use"
  | "available"
  | "unavailable";

export const AssessmentMeasurementDefinitionStatusEnum: AssessmentMeasurementDefinitionStatus[] =
  ["in_use", "available", "unavailable"];