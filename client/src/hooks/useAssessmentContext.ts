import { useLocation } from "react-router-dom";
import { routes } from "@/router/routes";
import type { AssessmentTypeEnum } from "@/types/api/assessments";

/**
 * Hook to determine the current assessment context based on the current route
 * Returns the assessment type (onsite/desktop) and appropriate creation route
 */
export function useAssessmentContext() {
  const location = useLocation();

  // Determine assessment type based on current path
  const getAssessmentType = (): AssessmentTypeEnum | null => {
    const path = location.pathname;

    if (path.includes("/assessments/desktop")) {
      return "desktop";
    }

    if (path.includes("/assessments/onsite")) {
      return "onsite";
    }

    // Default to null for general assessments page
    return null;
  };

  const assessmentType = getAssessmentType();

  // Get the appropriate creation route based on context
  const getCreateRoute = (): string => {
    if (assessmentType === "desktop") {
      return routes.newDesktopAssessment;
    }

    if (assessmentType === "onsite") {
      return routes.newOnsiteAssessment;
    }

    // Default to the unified assessment creation page
    return routes.newAssessment;
  };

  // Get the appropriate list route based on context
  const getListRoute = (): string => {
    if (assessmentType === "desktop") {
      return routes.assessmentsDesktop;
    }

    if (assessmentType === "onsite") {
      return routes.assessmentsOnsite;
    }

    // Default to general assessments page
    return routes.assessments;
  };

  // Helper to get context-aware route for navigation
  const getContextRoute = (routeType: "create" | "list"): string => {
    return routeType === "create" ? getCreateRoute() : getListRoute();
  };

  return {
    assessmentType,
    isOnsite: assessmentType === "onsite",
    isDesktop: assessmentType === "desktop",
    isGeneral: assessmentType === null,
    createRoute: getCreateRoute(),
    listRoute: getListRoute(),
    getContextRoute,
  };
}
