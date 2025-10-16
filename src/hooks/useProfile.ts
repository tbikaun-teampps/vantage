import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api/client";
import type { UserProfile } from "@/types/assessment";

// Query key factory for profile cache management
export const profileKeys = {
  all: ["profile"] as const,
  detail: (userId: string) => [...profileKeys.all, "detail", userId] as const,
};

/**
 * Hook to get user profile from auth store
 * Profile is loaded on signin/initialize, no separate fetch needed
 */
export function useProfile() {
  const { profile, loading, authenticated } = useAuthStore();

  return {
    data: profile,
    isLoading: loading,
    error: !authenticated && !loading ? new Error("Not authenticated") : null,
    isError: !authenticated && !loading,
    isSuccess: !!profile,
  };
}

/**
 * Hook for profile mutations
 * Calls backend endpoints and updates auth store
 */
export function useProfileActions() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const { user } = authStore;

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      if (!user) throw new Error("User not authenticated");

      const response = await apiClient.put<{
        success: boolean;
        profile: UserProfile;
      }>("/users/profile", profileData);

      if (!response.data.success) {
        throw new Error("Failed to update profile");
      }

      return response.data.profile;
    },
    onSuccess: (updatedProfile) => {
      // Update auth store with new profile
      authStore.setProfile(updatedProfile);

      // Also update React Query cache
      if (user) {
        queryClient.setQueryData(profileKeys.detail(user.id), updatedProfile);
      }
    },
  });

  const markOnboardedMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      // Mark as onboarded
      await apiClient.put("/users/onboarded");

      // Fetch fresh profile with updated onboarded status
      const response = await apiClient.get<{
        success: boolean;
        data: {
          profile: UserProfile;
        };
      }>("/auth/session");

      if (!response.data.success || !response.data.data) {
        throw new Error("Failed to fetch updated profile");
      }

      return response.data.data.profile;
    },
    onSuccess: (updatedProfile) => {
      // Update auth store
      authStore.setProfile(updatedProfile);

      // Update React Query cache
      if (user) {
        queryClient.setQueryData(profileKeys.detail(user.id), updatedProfile);
      }
    },
  });

  return {
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error,

    markOnboarded: markOnboardedMutation.mutateAsync,
    isMarkingOnboarded: markOnboardedMutation.isPending,
    markOnboardedError: markOnboardedMutation.error,
  };
}
