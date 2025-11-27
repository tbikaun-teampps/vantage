import {
  RecommendationPriority,
  RecommendationStatus,
} from "../types/entities/recommendations";

export const RecommendationPriorityEnum: RecommendationPriority[] = [
  "low",
  "medium",
  "high",
];

export const RecommendationStatusEnum: RecommendationStatus[] = [
  "not_started",
  "in_progress",
  "completed",
];
