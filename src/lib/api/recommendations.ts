import { apiClient } from "./client";
import type { Tables } from "@/types/database";

export type Recommendation = Tables<"recommendations">;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function getRecommendations(
  companyId: string
): Promise<Recommendation[]> {
  const response = await apiClient.get<ApiResponse<Recommendation[]>>(
    `/companies/${companyId}/recommendations`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch recommendations");
  }

  return response.data.data;
}
