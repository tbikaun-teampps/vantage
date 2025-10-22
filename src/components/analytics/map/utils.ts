import { type DataType } from "@/types/assessment";

export const getScoreColor = (score: number, dataType: DataType) => {
  // Adjust color logic based on data type
  switch (dataType) {
    case "completion_rate":
      if (score >= 95) return "#22c55e"; // green
      if (score >= 85) return "#eab308"; // yellow
      if (score >= 75) return "#f97316"; // orange
      return "#ef4444"; // red

    case "total_interviews":
      if (score >= 100) return "#22c55e";
      if (score >= 50) return "#eab308";
      if (score >= 25) return "#f97316";
      return "#ef4444";

    default: // average_score
      if (score >= 2.4) return "#22c55e";
      if (score >= 2.2) return "#eab308";
      if (score >= 2.0) return "#f97316";
      return "#ef4444";
  }
};

export const getCircleRadius = (score: number, dataType: DataType) => {
  // Adjust radius calculation based on data type
  switch (dataType) {
    case "total_interviews":
      return Math.max(8, Math.min(40, score / 3)); // Scale for interview count
    case "completion_rate":
      return Math.max(8, score / 3); // Scale for percentage
    default:
      return Math.max(15, score * 12); // Scale for average score
  }
};