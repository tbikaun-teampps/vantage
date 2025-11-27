import { useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";

interface FeatureFlags {
  canCreateCompany: boolean;
  // canDeleteCompany: boolean;
  // canModifyCompanyStructure: boolean;
  // canCreateAssessment: boolean;
  // canDeleteAssessment: boolean;
  // canExportData: boolean;
  // canAccessAnalytics: boolean;
  // canManageSubscription: boolean;
}

/**
 * Hook to determine feature availability based on user profile and subscription tier
 * Returns feature flags object with boolean values for each feature
 */
export function useFeatureFlags(): FeatureFlags {
  const { data: profile } = useProfile();

  return useMemo(() => {
    const isDemoMode = profile?.subscription_tier === "demo";
    // const isPaidUser =
    //   profile?.subscription_tier !== "demo" &&
    //   profile?.subscription_tier !== "free";

    return {
      // Company management features - restricted in demo mode
      canCreateCompany: !isDemoMode,
      // canDeleteCompany: !isDemoMode,
      // canModifyCompanyStructure: !isDemoMode,

      // // Assessment features - available in demo but with limitations
      // canCreateAssessment: true,
      // canDeleteAssessment: !isDemoMode,

      // // Data and analytics features
      // canExportData: !isDemoMode,
      // canAccessAnalytics: true,

      // // Subscription management - not available in demo mode
      // canManageSubscription: !isDemoMode,
    };
  }, [profile?.subscription_tier]);
}
