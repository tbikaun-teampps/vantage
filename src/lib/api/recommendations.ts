import type { GetRecommendationsResponseData } from "@/types/api/recommendations";
import { apiClient } from "./client";
import type { ApiResponse } from "./utils";

export async function getRecommendations(
  companyId: string
): Promise<GetRecommendationsResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetRecommendationsResponseData>
  >(`/companies/${companyId}/recommendations`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch recommendations");
  }

  return response.data.data;
}
