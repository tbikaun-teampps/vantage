import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { UserPermissions } from "@/types/api/auth";

interface PermissionsHookReturn {
  permissions: UserPermissions | null;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  isSuccess: boolean;

  // Helper methods for common permission checks
  hasFeature: (feature: string) => boolean;
  canCreateCompanies: boolean;
}

/**
 * Hook to get user permissions from auth store
 * Permissions are loaded on signin/initialize from backend
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasFeature, canCreateCompanies, permissions } = usePermissions();
 *
 *   if (hasFeature('analytics')) {
 *     return <AnalyticsView />;
 *   }
 *
 *   if (canCreateCompanies) {
 *     return <CreateCompanyButton />;
 *   }
 *
 *   // Direct access to permissions object
 *   console.log(permissions?.maxCompanies);
 * }
 * ```
 */
export function usePermissions(): PermissionsHookReturn {
  const { permissions, loading, authenticated } = useAuthStore();

  // Memoize helper functions to prevent unnecessary re-renders
  const helpers = useMemo(() => {
    const hasFeature = (feature: string): boolean => {
      if (!permissions) return false;
      return permissions.features.includes(feature);
    };

    const canCreateCompanies = permissions
      ? permissions.maxCompanies > 0
      : false;

    return {
      hasFeature,
      canCreateCompanies,
    };
  }, [permissions]);

  return {
    permissions,
    isLoading: loading,
    error: !authenticated && !loading ? new Error("Not authenticated") : null,
    isError: !authenticated && !loading,
    isSuccess: !!permissions,
    ...helpers,
  };
}
