import type { RecommendationsResponseData } from "@/types/api/recommendations";
import { apiClient } from "./client";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function getRecommendations(
  companyId: string
): Promise<RecommendationsResponseData> {
  const response = await apiClient.get<
    ApiResponse<RecommendationsResponseData>
  >(`/companies/${companyId}/recommendations`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch recommendations");
  }

  return response.data.data;
}
