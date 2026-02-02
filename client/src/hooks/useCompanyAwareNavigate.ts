import { useNavigate, useParams } from "react-router-dom";
import { useCallback } from "react";
import { COMPANY_SCOPED_PATTERNS } from "@/router/routes";

/**
 * Enhanced navigation hook that automatically injects companyId for company-scoped routes.
 * 
 * This hook intercepts navigation calls and automatically prepends the companyId
 * when navigating to routes that require it, using COMPANY_SCOPED_PATTERNS from routes.tsx.
 * 
 * Usage: Replace `useNavigate()` with `useCompanyAwareNavigate()` and use normally:
 * - navigate('/assessments') -> automatically becomes '/:companyId/assessments'
 * - navigate('/external/interview/123') -> stays as-is (not company-scoped)
 */
export function useCompanyAwareNavigate() {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();


  const enhancedNavigate = useCallback((
    to: string | number,
    options?: { replace?: boolean; state?: unknown }
  ) => {
    // Handle back/forward navigation (numbers)
    if (typeof to === 'number') {
      navigate(to);
      return;
    }

    // Handle routes that already contain /:companyId (like from routes.tsx)
    let processedPath = to;
    if (to.startsWith('/:companyId/') && companyId) {
      // Replace /:companyId with actual companyId
      processedPath = to.replace('/:companyId/', `/${companyId}/`);
      navigate(processedPath, options);
      return;
    }

    // Check if the path needs companyId injection
    const needsCompanyId = COMPANY_SCOPED_PATTERNS.some(pattern => {
      // Handle exact matches and sub-paths
      return to === pattern || to.startsWith(`${pattern}/`) || to.startsWith(`${pattern}?`);
    });

    if (needsCompanyId && companyId && !to.startsWith(`/${companyId}/`)) {
      // Inject companyId into the path
      const enhancedPath = `/${companyId}${to}`;
      navigate(enhancedPath, options);
    } else {
      // Use original path for:
      // - Non-company-scoped routes (/login, /external/*, etc.)
      // - Already company-scoped paths
      // - When no companyId is available
      navigate(to, options);
    }
  }, [navigate, companyId]);

  return enhancedNavigate;
}