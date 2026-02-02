import { Navigate, Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { routes } from "@/router/routes";
import { Loader } from "./loader";
import { getCompanyById } from "@/lib/api/companies";

/**
 * Company route guard that:
 * 1. Extracts companyId from URL params
 * 2. Validates user has access to the company
 * 3. Provides company context to child components
 */
export function CompanyRoute() {
  const { companyId } = useParams<{ companyId: string }>();

  if (!companyId) {
    return <Navigate to={routes.selectCompany} replace />;
  }

  // Query to validate company access and get company data
  const {
    data: company,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => getCompanyById(companyId),
    retry: false, // Don't retry on access errors
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !company) {
    return <Navigate to={routes.selectCompany} replace />;
  }

  // Company validated - render the protected content
  return <Outlet context={{ company }} />;
}

/**
 * Hook to get the current company from the URL context
 */
export function useCurrentCompany() {
  const { companyId } = useParams<{ companyId: string }>();

  const { data: company } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => {
      if (!companyId) return null;
      return getCompanyById(companyId);
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    company,
    companyId: companyId,
    isLoading: !company && !!companyId,
  };
}
