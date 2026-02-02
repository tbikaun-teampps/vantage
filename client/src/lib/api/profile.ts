import { apiClient } from "./client";
import type {
  UpdateProfileBodyData,
  UpdateProfileResponseData,
} from "@/types/api/profile";
import type { ApiResponse } from "./utils";

export async function updateProfile(
  data: UpdateProfileBodyData
): Promise<UpdateProfileResponseData> {
  const response = await apiClient.put<ApiResponse<UpdateProfileResponseData>>(
    "/users/profile",
    data
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update profile");
  }

  return response.data.data;
}

// Function for marking user as onboarded
export async function MarkUserOnboarded() {
  await apiClient.put("/users/onboarded");
}
