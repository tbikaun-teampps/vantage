import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "@/router/routes";
import { useCompanyFromUrl } from "./useCompanyFromUrl";

interface UseCompanyProtectedDataOptions {
  resourceId?: string;
  resourceType: "interview" | "assessment" | "questionnaire";
  redirectTo?: string;
}

export function useCompanyProtectedData({
  resourceId,
  resourceType,
  redirectTo = routes.dashboard,
}: UseCompanyProtectedDataOptions) {
  const navigate = useNavigate();
  const companyId = useCompanyFromUrl();
  const [isValidating, setIsValidating] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!companyId) {
      navigate(redirectTo);
      return;
    }

    if (!resourceId) {
      setIsValidating(false);
      setHasAccess(true);
      return;
    }

    // This validation should ideally happen server-side
    // For now, we'll clear local state and redirect
    setIsValidating(true);

    // When company changes, immediately redirect if on a detail page
    const currentPath = window.location.pathname;
    const isDetailPage =
      currentPath.includes("/interviews/") ||
      currentPath.includes("/assessments/onsite/") ||
      currentPath.includes("/questionnaires/");

    if (isDetailPage) {
      // Clear any cached data
      sessionStorage.removeItem(`${resourceType}_${resourceId}`);
      navigate(redirectTo);
    }

    setIsValidating(false);
  }, [companyId, resourceId, resourceType, navigate, redirectTo]);

  return { isValidating, hasAccess, companyId };
}
