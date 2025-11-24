import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { CompanyRoute } from "@/components/CompanyRoute";

// Layout components
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
// import { ExternalLayout } from "@/layouts/ExternalLayout";
import { InterviewLayout } from "@/layouts/InterviewLayout";

import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/auth/LoginPage";
// import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { SelectCompanyPage } from "@/pages/SelectCompanyPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { CompanySettingsPage } from "@/pages/CompanySettingsPage";
import { AssessmentListPage } from "@/pages/assessment/AssessmentListPage";
import { InterviewsListPage } from "@/pages/interview/InterviewListPage";
import { AssessmentOnsiteNewPage } from "@/pages/assessment/AssessmentOnsiteNewPage";
import { QuestionnaireListPage } from "@/pages/questionnaires/QuestionnaireListPage";
import { QuestionnaireNewPage } from "@/pages/questionnaires/QuestionnaireNewPage";
import { AssessmentOnsiteDetailPage } from "@/pages/assessment/AssessmentOnsiteDetailPage";
import { QuestionnaireDetailPage } from "@/pages/questionnaires/QuestionnaireDetailPage";
import { InterviewDetailPage } from "@/pages/interview/InterviewDetailPage";
import { WelcomePage } from "@/pages/WelcomePage";
import { AssessmentDesktopNewPage } from "@/pages/assessment/AssessmentDesktopNewPage";
import { AssessmentNewPage } from "@/pages/assessment/AssessmentNewPage";
import { AssessmentDesktopDetailPage } from "@/pages/assessment/AssessmentDesktopDetailPage";
import { ProgramListPage } from "@/pages/programs/ProgramListPage";
import { ProgramNewPage } from "@/pages/programs/ProgramNewPage";
import { ProgramDetailPage } from "@/pages/programs/ProgramDetailPage";
// import { ExternalDataPage } from "@/pages/external/ExternalDataPage";
import { ExternalInterviewPage } from "@/pages/external/ExternalInterviewPage";
import { ActionsPage } from "@/pages/ActionsPage";
import { PageNotFound } from "@/pages/PageNotFound";
import { RecommendationsPage } from "@/pages/RecommendationsPage";
import { CompanyTeamPage } from "@/pages/CompanyTeamPage";
import { EnterpriseWelcomePage } from "@/pages/enterprise/EnterpriseWelcomePage";

import { AuthProvider } from "@/contexts/AuthContext";
import { PublicInterviewAuthProvider } from "@/components/public-interview-auth-provider";
import { AuditLogsPage } from "@/pages/AuditLogsPage";

export function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path={routes.home} element={<HomePage />} />

        {/* External routes with layout */}
        {/* <Route element={<ExternalLayout />}>
          <Route path={routes.externalData} element={<ExternalDataPage />} />
        </Route> */}

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
          {/* <Route
            path={routes.forgotPassword}
            element={<ForgotPasswordPage />}
          /> */}
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

            {/* Company-scoped routes - MUST be last (catch-all) */}
            <Route path="/:companyId" element={<CompanyRoute />}>
              {/* Interview pages with dedicated layout */}
              <Route element={<InterviewLayout />}>
                <Route
                  path="interviews/:id"
                  element={
                    <InterviewDetailPage isIndividualInterview={false} />
                  }
                />
              </Route>

              {/* Company-scoped dashboard routes */}
              <Route element={<DashboardLayout />}>
                {/* Main dashboard page */}
                <Route path="dashboard" element={<DashboardPage />} />

                {/* Audit Logs */}
                <Route path="audit-logs" element={<AuditLogsPage />} />
                {/* Programs */}
                <Route path="programs" element={<ProgramListPage />} />
                <Route path="programs/new" element={<ProgramNewPage />} />
                <Route path="programs/:id" element={<ProgramDetailPage />} />

                {/* Questionnaires */}
                <Route
                  path="questionnaires"
                  element={<QuestionnaireListPage />}
                />
                <Route
                  path="questionnaires/new"
                  element={<QuestionnaireNewPage />}
                />
                <Route
                  path="questionnaires/:id"
                  element={<QuestionnaireDetailPage />}
                />

                {/* Assessments */}
                <Route path="assessments" element={<AssessmentListPage />} />
                <Route
                  path="assessments/desktop"
                  element={<AssessmentListPage />}
                />
                <Route
                  path="assessments/onsite"
                  element={<AssessmentListPage />}
                />
                <Route path="assessments/new" element={<AssessmentNewPage />} />
                <Route
                  path="assessments/onsite/new"
                  element={<AssessmentOnsiteNewPage />}
                />
                <Route
                  path="assessments/desktop/new"
                  element={<AssessmentDesktopNewPage />}
                />
                <Route
                  path="assessments/onsite/:id"
                  element={<AssessmentOnsiteDetailPage />}
                />
                <Route
                  path="assessments/desktop/:id"
                  element={<AssessmentDesktopDetailPage />}
                />

                {/* Interviews */}
                <Route path="interviews" element={<InterviewsListPage />} />

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

                {/* Company Team Management */}
                <Route path="team" element={<CompanyTeamPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}
