export const routes = {
  // Root
  home: "/",

  // Auth routes
  login: "/login",
  forgotPassword: "/forgot-password",
  welcome: "/welcome", // This is protected -- onboarding after authentication.

  // Company selection
  selectCompany: "/select-company",
  enterpriseWelcome: "/enterprise-welcome",

  // Company-scoped routes
  dashboard: "/:companyId/dashboard",

  // Program routes
  programs: "/:companyId/programs",
  programsNew: "/:companyId/programs/new",
  programDetail: "/:companyId/programs/:id",

  // Assessment routes
  assessments: "/:companyId/assessments",
  assessmentsDesktop: "/:companyId/assessments/desktop",
  assessmentsOnsite: "/:companyId/assessments/onsite",
  assessmentOnsiteDetail: "/:companyId/assessments/onsite/:id",
  assessmentDesktopDetail: "/:companyId/assessments/desktop/:id",
  newAssessment: "/:companyId/assessments/new",
  newOnsiteAssessment: "/:companyId/assessments/onsite/new",
  newDesktopAssessment: "/:companyId/assessments/desktop/new",

  // Interview routes
  interviews: "/:companyId/interviews",
  interviewDetail: "/:companyId/interviews/:id",

  // Questionnaire routes
  questionnaires: "/:companyId/questionnaires",
  questionnaireDetail: "/:companyId/questionnaires/:id",
  newQuestionnaire: "/:companyId/questionnaires/new",

  // Analytics routes
  analytics: "/:companyId/analytics",
  analyticsBenchmarks: "/:companyId/analytics/benchmarks",

  // Reports routes
  reports: "/:companyId/reports",

  // Company settings (company-scoped)
  settingsCompany: "/:companyId/settings",

  // Team routes (company-scoped)
  team: "/:companyId/team",

  // External routes (remain unchanged - no company context needed)
  externalInterview: "/external/interview/:id",
  externalData: "/external/data/:id",

  // Global settings/account routes (no company context)
  settings: "/settings",
  account: "/account",
  accountSubscription: "/account/subscription",

  // Legal routes
  privacyPolicy: "/privacy-policy",
  termsOfService: "/terms-of-service",

  // Audit
  auditLogs: "/:companyId/audit-logs",
} as const;

// Company-scoped route patterns (used by useCompanyAwareNavigate)
export const COMPANY_SCOPED_PATTERNS = [
  "/dashboard",
  "/programs",
  "/assessments",
  "/analytics",
  "/reports",
  "/questionnaires",
  "/recommendations",
  "/interviews",
  "/audit-logs",
  "/settings", // Only company-scoped /settings, not global /account
] as const;

// Helper functions for generating company-scoped URLs
export const companyRoutes = {
  dashboard: (companyId: string) => `/${companyId}/dashboard`,
  programs: (companyId: string) => `/${companyId}/programs`,
  programsNew: (companyId: string) => `/${companyId}/programs/new`,
  programDetail: (companyId: string, id: number | string) =>
    `/${companyId}/programs/${id}`,
  assessments: (companyId: string) => `/${companyId}/assessments`,
  assessmentsDesktop: (companyId: string) =>
    `/${companyId}/assessments/desktop`,
  assessmentsOnsite: (companyId: string) => `/${companyId}/assessments/onsite`,
  assessmentDetail: (companyId: string, id: number | string, type: "onsite" | "desktop") =>
    `/${companyId}/assessments/${type}/${id}`,
  assessmentOnsiteDetail: (companyId: string, id: number | string) =>
    `/${companyId}/assessments/onsite/${id}`,
  assessmentDesktopDetail: (companyId: string, id: number | string) =>
    `/${companyId}/assessments/desktop/${id}`,
  newAssessment: (companyId: string) => `/${companyId}/assessments/new`,
  newOnsiteAssessment: (companyId: string) =>
    `/${companyId}/assessments/onsite/new`,
  newDesktopAssessment: (companyId: string) =>
    `/${companyId}/assessments/desktop/new`,
  interviews: (companyId: string) =>
    `/${companyId}/interviews`,
  interviewDetail: (companyId: string, id: number | string) =>
    `/${companyId}/interviews/${id}`,
  questionnaires: (companyId: string) => `/${companyId}/questionnaires`,
  questionnaireDetail: (companyId: string, id: number | string) =>
    `/${companyId}/questionnaires/${id}`,
  newQuestionnaire: (companyId: string) => `/${companyId}/questionnaires/new`,
  analytics: (companyId: string) => `/${companyId}/analytics`,
  analyticsBenchmarks: (companyId: string) =>
    `/${companyId}/analytics/benchmarks`,
  reports: (companyId: string) => `/${companyId}/reports`,
  settingsCompany: (companyId: string) => `/${companyId}/settings`,
  recommendations: (companyId: string) => `/${companyId}/recommendations`,
  team: (companyId: string) => `/${companyId}/team`,
  auditLogs: (companyId: string) => `/${companyId}/audit-logs`,
} as const;
