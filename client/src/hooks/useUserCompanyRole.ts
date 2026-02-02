import { useAuthStore } from "@/stores/auth-store";
import { useCompanyFromUrl } from "./useCompanyFromUrl";
import { useMemo } from "react";

/**
 * Hook to get the current user's role in the current company
 * Returns the role from the auth store (loaded during sign-in/session validation)
 */
export function useUserCompanyRole() {
  const { user, companies, loading: authLoading } = useAuthStore();

  // This will throw if no company is selected, which is expected behavior
  let companyId: string | null = null;
  try {
    companyId = useCompanyFromUrl();
  } catch {
    // If we're not on a company route, companyId will remain null
  }

  const role = useMemo(() => {
    if (!user || !companyId) return null;
    const userCompany = companies.find((c) => c.id === companyId);
    return userCompany?.role || null;
  }, [user, companyId, companies]);

  return {
    data: role,
    isLoading: authLoading,
    error: null,
    // Match React Query interface for backward compatibility
    isSuccess: !authLoading,
    isError: false,
  };
}

/**
 * Utility hook to check if user has at least the minimum required role
 * Role hierarchy: viewer < admin < owner
 */
function useHasMinRole(minRole: "viewer" | "admin" | "owner"): boolean {
  const { data: userRole, isLoading } = useUserCompanyRole();

  // If still loading, return false for safety (deny access)
  if (isLoading || !userRole) {
    return false;
  }

  const roleHierarchy = { viewer: 0, admin: 1, owner: 2 };
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? -1;
  const minLevel = roleHierarchy[minRole];

  return userLevel >= minLevel;
}

/**
 * Utility hook to check if user is an admin or owner
 */
export function useCanAdmin(): boolean {
  return useHasMinRole("admin");
}