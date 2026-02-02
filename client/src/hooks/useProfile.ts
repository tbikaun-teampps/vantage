import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { MarkUserOnboarded, updateProfile } from "@/lib/api/profile";
import type { UpdateProfileBodyData } from "@/types/api/profile";
import { authApi } from "@/lib/api/auth";
import type { SubscriptionTier } from "@/types/api/auth";

// Query key factory for profile cache management
const profileKeys = {
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
    mutationFn: async (data: UpdateProfileBodyData) => {
      if (!user) throw new Error("User not authenticated");

      await updateProfile(data);

      // Fetch fresh session data to ensure all auth-related data is synced
      const sessionData = await authApi.validateSession();

      if (!sessionData.data) {
        throw new Error("Failed to fetch updated session");
      }
      return sessionData.data;
    },
    onSuccess: (sessionData) => {
      // Update auth store with complete session data
      authStore.setUser(sessionData.user);
      authStore.setProfile(sessionData.profile);
      authStore.setPermissions(sessionData.permissions);
      authStore.setCompanies(sessionData.companies);

      // Also update React Query cache
      if (user) {
        queryClient.setQueryData(
          profileKeys.detail(user.id),
          sessionData.profile
        );
      }
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (subscription_tier: SubscriptionTier) => {
      if (!user) throw new Error("User not authenticated");

      // Call backend to update subscription
      await authApi.updateSubscription(subscription_tier);

      // Fetch fresh session data to get updated subscription info
      const sessionData = await authApi.validateSession();

      if (!sessionData.data) {
        throw new Error("Failed to fetch updated session");
      }
      return sessionData.data;
    },
    onSuccess: (sessionData) => {
      // Update auth store with complete session data
      authStore.setUser(sessionData.user);
      authStore.setProfile(sessionData.profile);
      authStore.setPermissions(sessionData.permissions);
      authStore.setCompanies(sessionData.companies);

      // Also update React Query cache
      if (user) {
        queryClient.setQueryData(
          profileKeys.detail(user.id),
          sessionData.profile
        );
      }
    },
  });

  const markOnboardedMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      // Mark as onboarded
      await MarkUserOnboarded();

      // Fetch fresh profile with updated onboarded status
      const sessionData = await authApi.validateSession();

      if (!sessionData.data) {
        throw new Error("Failed to fetch updated session");
      }
      return sessionData.data.profile;
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

  const refreshSessionMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      // Fetch fresh session data to get updated user state (role, permissions, companies, etc.)
      const sessionData = await authApi.validateSession();

      if (!sessionData.data) {
        throw new Error("Failed to fetch updated session");
      }
      return sessionData.data;
    },
    onSuccess: (sessionData) => {
      // Update auth store with complete session data
      authStore.setUser(sessionData.user);
      authStore.setProfile(sessionData.profile);
      authStore.setPermissions(sessionData.permissions);
      authStore.setCompanies(sessionData.companies);

      // Also update React Query cache
      if (user) {
        queryClient.setQueryData(
          profileKeys.detail(user.id),
          sessionData.profile
        );
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

    refreshSession: refreshSessionMutation.mutateAsync,
    isRefreshingSession: refreshSessionMutation.isPending,
    refreshSessionError: refreshSessionMutation.error,

    updateSubscription: updateSubscriptionMutation.mutateAsync,
    isUpdatingSubscription: updateSubscriptionMutation.isPending,
    updateSubscriptionError: updateSubscriptionMutation.error,
  };
}
