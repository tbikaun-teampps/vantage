import { useCompanyTree } from "@/hooks/useCompany";
import { CompanyStructureContent } from "@/components/settings/company";
import { LoadingSpinner } from "@/components/loader";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

export const CompanySettingsPage = () => {
  const companyId = useCompanyFromUrl();
  const { data: tree, isLoading: isLoadingTree } = useCompanyTree(companyId);

  if (!tree && isLoadingTree && companyId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading company structure..." variant="card" />
      </div>
    );
  }
  return <CompanyStructureContent />;
};
