import { Navigate, Outlet, useLocation } from "react-router-dom";
import { routes } from "./routes";
import { companyRoutes } from "./routes";
import { useAuthStore } from "@/stores/auth-store";
import { usePermissions } from "@/hooks/usePermissions";
import { LoadingSpinner } from "@/components/loader";
import type { UserCompanies } from "@/types/api/auth";

/**
 * Route permission configuration
 * Defines which routes require specific feature permissions and where to redirect if denied
 */
interface RoutePermission {
  path: string;
  requiredFeature: string;
  getRedirectPath: (companies: UserCompanies) => string;
}

const ROUTE_PERMISSIONS: RoutePermission[] = [
  {
    path: routes.selectCompany,
    requiredFeature: "select_company",
    getRedirectPath: (companies) => {
      // If user has companies, redirect to their first company's dashboard
      if (companies.length > 0) {
        return companyRoutes.dashboard(companies[0].id);
      }
      // If no companies (enterprise setup pending), redirect to enterprise welcome
      return routes.enterpriseWelcome;
    },
  },
  // Add more route permissions here as needed:
  // {
  //   path: routes.analytics,
  //   requiredFeature: "advanced_analytics",
  //   getRedirectPath: () => routes.dashboard
  // }
];

export function ProtectedRoute() {
  const { authenticated, loading, user, session, companies } = useAuthStore();
  const { hasFeature, isLoading: permissionsLoading } = usePermissions();
  const location = useLocation();

  // Show loading skeleton while auth is being determined
  if (loading || permissionsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  // Check for valid session and user
  if (!authenticated || !user || !session) {
    return (
      <Navigate to={routes.login} state={{ from: location.pathname }} replace />
    );
  }

  // Check route permissions
  for (const routePermission of ROUTE_PERMISSIONS) {
    if (location.pathname === routePermission.path) {
      // Check if user has the required feature permission
      if (!hasFeature(routePermission.requiredFeature)) {
        const redirectPath = routePermission.getRedirectPath(companies);
        return <Navigate to={redirectPath} replace />;
      }
    }
  }

  return <Outlet />;
}
