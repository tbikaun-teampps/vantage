import { useCompanyFromUrl } from "./useCompanyFromUrl";

/**
 * Hook that provides company-scoped route functions with auto-populated companyId.
 *
 * This gives you the best of both worlds:
 * - Auto-populated companyId from current URL context
 * - Type-safe route generation functions
 * - No need to manually pass companyId everywhere
 * - No nullable types to handle
 *
 * Usage:
 * const routes = useCompanyRoutes();
 * navigate(routes.dashboard()); // Auto-uses current companyId
 * navigate(routes.assessments()); // Auto-uses current companyId
 * navigate(routes.programDetail(123)); // Auto-uses current companyId + program ID
 */
export function useCompanyRoutes() {
  const companyId = useCompanyFromUrl();
  return {
    // Basic routes with auto-populated companyId
    dashboard: () => `/${companyId}/dashboard`,
    programs: () => `/${companyId}/programs`,
    programsNew: () => `/${companyId}/programs/new`,
    assessments: () => `/${companyId}/assessments`,
    assessmentsDesktop: () => `/${companyId}/assessments/desktop`,
    assessmentsOnsite: () => `/${companyId}/assessments/onsite`,
    newAssessment: () => `/${companyId}/assessments/new`,
    newOnsiteAssessment: () => `/${companyId}/assessments/onsite/new`,
    newDesktopAssessment: () => `/${companyId}/assessments/desktop/new`,
    interviews: () => `/${companyId}/interviews`,
    questionnaires: () => `/${companyId}/questionnaires`,
    newQuestionnaire: () => `/${companyId}/questionnaires/new`,
    analytics: () => `/${companyId}/analytics`,
    analyticsBenchmarks: () => `/${companyId}/analytics/benchmarks`,
    reports: () => `/${companyId}/reports`,
    settingsCompany: () => `/${companyId}/settings`,

    // Routes that need additional parameters
    programDetail: (id: string | number) => `/${companyId}/programs/${id}`,
    programDetailDesktop: (id: string | number) =>
      `/${companyId}/programs/${id}/desktop`,
    programDetailOnsite: (id: string | number) =>
      `/${companyId}/programs/${id}/onsite`,
    programDetailAnalytics: (id: string | number) =>
      `/${companyId}/programs/${id}/analytics`,
    assessmentOnsiteDetail: (id: string | number) =>
      `/${companyId}/assessments/onsite/${id}`,
    assessmentDesktopDetail: (id: string | number) =>
      `/${companyId}/assessments/desktop/${id}`,
    interviewDetail: (id: string | number) =>
      `/${companyId}/interviews/${id}`,
    externalInterviewDetail: (
      id: string | number,
      accessCode: string,
      email: string
    ) =>
      `/external/interview/${id}?code=${accessCode}&email=${encodeURIComponent(email)}`,
    questionnaireDetail: (id: string | number) =>
      `/${companyId}/questionnaires/${id}`,
    assessmentDetails: (type: "onsite" | "desktop", id: string | number) =>
      `/${companyId}/assessments/${type}/${id}`, // General assessment route

    // Access to the companyId for other use cases
    companyId,
  };
}

// http://localhost:5173/external/interview/334?code=vi77qo0bjx9vyhm9z4g9yr&email=david.anderson@vr.com.au
