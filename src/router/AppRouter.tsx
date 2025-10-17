import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { CompanyRoute } from "@/components/CompanyRoute";

// Layout components
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ExternalLayout } from "@/layouts/ExternalLayout";
import { InterviewLayout } from "@/layouts/InterviewLayout";

import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { SelectCompanyPage } from "@/pages/SelectCompanyPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { AnalyticsPage } from "@/pages/analytics/AnalyticsPage";
import { CompanySettingsPage } from "@/pages/settings/company/CompanySettingsPage";
import { NewCompanyPage } from "@/pages/settings/company/new/NewCompanyPage";
import { AssessmentsPage } from "@/pages/assessments/AssessmentsPage";
import { InterviewsPage } from "@/pages/assessments/onsite/interviews/InterviewsPage";
import { NewOnsiteAssessmentPage } from "@/pages/assessments/onsite/new/NewOnsiteAssessmentPage";
import { QuestionnairesPage } from "@/pages/questionnaires/QuestionnairesPage";
import { NewQuestionnairePage } from "@/pages/questionnaires/new/NewQuestionnairePage";
import { OnsiteAssessmentDetailPage } from "@/pages/assessments/onsite/detail";
import { QuestionnaireDetailPage } from "@/pages/questionnaires/detail";
import { InterviewDetailPage } from "@/pages/assessments/onsite/interviews/detail";
import { WelcomePage } from "@/pages/welcome/WelcomePage";
import { NewDesktopAssessmentPage } from "@/pages/assessments/desktop/new/NewDesktopAssessmentPage";
import { NewAssessmentPage } from "@/pages/assessments/new/NewAssessmentPage";
import { DesktopAssessmentDetailPage } from "@/pages/assessments/desktop/detail/DesktopAssessmentDetailPage";
import { ProgramsPage } from "@/pages/programs/ProgramsPage";
import { NewProgramPage } from "@/pages/programs/new/NewProgramPage";
import { ProgramDetailPage } from "@/pages/programs/detail/ProgramDetailPage";
import { ExternalDataPage } from "@/pages/external/ExternalDataPage";
import { ExternalInterviewPage } from "@/pages/external/ExternalInterviewPage";
import { ActionsPage } from "@/pages/actions/ActionsPage";
import { PageNotFound } from "@/pages/PageNotFound";
import { RecommendationsPage } from "@/pages/recommendations/RecommendationsPage";
import { TeamPage } from "@/pages/TeamPage";
import { EnterpriseWelcomePage } from "@/pages/enterprise/EnterpriseWelcomePage";

import { AuthProvider } from "@/components/auth-provider";
import { PublicInterviewAuthProvider } from "@/components/public-interview-auth-provider";

export function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path={routes.home} element={<HomePage />} />

        {/* External routes with layout */}
        <Route element={<ExternalLayout />}>
          <Route path={routes.externalData} element={<ExternalDataPage />} />
        </Route>

        {/* Public interview route with dedicated auth provider */}
        {/* Interview doesn't use external layout as its fullscreen*/}
        <Route element={<PublicInterviewAuthProvider />}>
          <Route
            path={routes.externalInterview}
            element={<ExternalInterviewPage />}
          />
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path={routes.login} element={<LoginPage />} />
          <Route
            path={routes.forgotPassword}
            element={<ForgotPasswordPage />}
          />
        </Route>

        {/* Protected routes */}
        <Route element={<AuthProvider />}>
          <Route element={<ProtectedRoute />}>
            {/* Company selection */}
            <Route
              path={routes.selectCompany}
              element={<SelectCompanyPage />}
            />

            {/* Enterprise welcome page */}
            <Route
              path={routes.enterpriseWelcome}
              element={<EnterpriseWelcomePage />}
            />

            {/* Protected route without dashboard layout */}
            <Route path={routes.welcome} element={<WelcomePage />} />

            {/* Global settings routes (no company context) - MUST be before /:companyId */}
            <Route element={<DashboardLayout />}>
              <Route
                path={routes.settingsCompanyNew}
                element={<NewCompanyPage />}
              />
            </Route>

            {/* Company-scoped routes - MUST be last (catch-all) */}
            <Route path="/:companyId" element={<CompanyRoute />}>
              {/* Interview pages with dedicated layout */}
              <Route element={<InterviewLayout />}>
                <Route
                  path="assessments/onsite/interviews/:id"
                  element={<InterviewDetailPage isPublic={false} />}
                />
              </Route>

              {/* Company-scoped dashboard routes */}
              <Route element={<DashboardLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />

                {/* Programs */}
                <Route path="programs" element={<ProgramsPage />} />
                <Route path="programs/new" element={<NewProgramPage />} />
                <Route path="programs/:id" element={<ProgramDetailPage />} />

                {/* Questionnaires */}
                <Route path="questionnaires" element={<QuestionnairesPage />} />
                <Route
                  path="questionnaires/new"
                  element={<NewQuestionnairePage />}
                />
                <Route
                  path="questionnaires/:id"
                  element={<QuestionnaireDetailPage />}
                />

                {/* Assessments */}
                <Route path="assessments" element={<AssessmentsPage />} />
                <Route
                  path="assessments/desktop"
                  element={<AssessmentsPage />}
                />
                <Route
                  path="assessments/onsite"
                  element={<AssessmentsPage />}
                />
                <Route path="assessments/new" element={<NewAssessmentPage />} />
                <Route
                  path="assessments/onsite/new"
                  element={<NewOnsiteAssessmentPage />}
                />
                <Route
                  path="assessments/desktop/new"
                  element={<NewDesktopAssessmentPage />}
                />
                <Route
                  path="assessments/onsite/:id"
                  element={<OnsiteAssessmentDetailPage />}
                />
                <Route
                  path="assessments/desktop/:id"
                  element={<DesktopAssessmentDetailPage />}
                />

                {/* Interviews */}
                <Route
                  path="assessments/onsite/interviews"
                  element={<InterviewsPage />}
                />

                {/* Analytics */}
                <Route path="analytics" element={<AnalyticsPage />} />

                {/* Recommendations */}
                <Route
                  path="recommendations"
                  element={<RecommendationsPage />}
                />

                {/* Actions */}
                <Route path="actions" element={<ActionsPage />} />

                {/* Reports */}
                <Route
                  path="reports"
                  element={<div>Reports Page (TODO)</div>}
                />

                {/* Company Settings */}
                <Route path="settings" element={<CompanySettingsPage />} />

                {/* Team Management */}
                <Route path="team" element={<TeamPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}
