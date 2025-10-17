import {
  IconBuildingFactory2,
  IconEye,
  IconPalette,
} from "@tabler/icons-react";
import { useCompanies } from "@/hooks/useCompany";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { companyRoutes } from "@/router/routes";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { ManageCompanyBrandingDialog } from "./forms/manage-company-branding-dialog";
import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";

export default function CompanySelector() {
  const navigate = useNavigate();
  const { data: companies = [], isLoading } = useCompanies();
  const companyId = useCompanyFromUrl();
  const [brandingDialogOpen, setBrandingDialogOpen] = useState(false);
  const [selectedCompanyForBranding, setSelectedCompanyForBranding] = useState<
    (typeof companies)[number] | null
  >(null);

  const { hasFeature } = usePermissions();

  // Check if user has permission to select companies
  const canSelectCompany = hasFeature("select_company");

  // Helper function to get badge variant and text for user role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return { variant: "secondary" as const, text: "Owner" };
      case "admin":
        return { variant: "secondary" as const, text: "Admin" };
      case "viewer":
        return { variant: "secondary" as const, text: "Viewer" };
      default:
        return { variant: "secondary" as const, text: role };
    }
  };

  const handleCompanyChange = (newCompanyId: string) => {
    // Navigate to dashboard of selected company - this will trigger React Query refetching
    navigate(companyRoutes.dashboard(newCompanyId));
  };

  const handleViewCompanies = () => {
    navigate("/select-company");
  };

  const handleManageBranding = () => {
    // Find the current company
    const currentCompany = companies.find((c) => c.id === companyId);
    if (
      currentCompany &&
      (currentCompany.role === "admin" || currentCompany.role === "owner")
    ) {
      setSelectedCompanyForBranding(currentCompany);
      setBrandingDialogOpen(true);
    }
  };

  if (isLoading && companies.length === 0) {
    return (
      <div className="px-2">
        <div className="w-full h-8 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  const isOwnerOrAdminOfCompany = companies.find(
    (c) => c.id === companyId && (c.role === "admin" || c.role === "owner")
  );

  return (
    <div className="px-2" data-tour="company-selector">
      <Select value={companyId} onValueChange={handleCompanyChange}>
        <SelectTrigger
          className="w-full h-8"
          data-tour="company-selector-trigger"
        >
          <SelectValue placeholder="Select Company" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>
              {canSelectCompany ? "Companies" : "Company"}
            </SelectLabel>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      {company.icon_url ? (
                        <img
                          src={company.icon_url}
                          alt={company.name}
                          className="w-4 h-4 object-contain"
                        />
                      ) : (
                        <IconBuildingFactory2 className="w-3 h-3 text-gray-500 dark:text-gray-300" />
                      )}
                    </div>
                    <span>{company.name}</span>
                  </div>
                  {company.role && (
                    <Badge
                      variant={getRoleBadge(company.role).variant}
                      className="flex-shrink-0 text-xs"
                    >
                      {getRoleBadge(company.role).text}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          {(isOwnerOrAdminOfCompany || canSelectCompany) && <SelectSeparator />}
          {canSelectCompany && (
            <div
              className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
              onClick={handleViewCompanies}
            >
              <IconEye className="w-4 h-4" />
              <span>View Companies</span>
            </div>
          )}
          {isOwnerOrAdminOfCompany && (
            <div
              className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
              onClick={handleManageBranding}
            >
              <IconPalette className="w-4 h-4" />
              <span>Manage Company Branding</span>
            </div>
          )}
        </SelectContent>
      </Select>
      {selectedCompanyForBranding && (
        <ManageCompanyBrandingDialog
          open={brandingDialogOpen}
          onOpenChange={setBrandingDialogOpen}
          company={selectedCompanyForBranding}
        />
      )}
    </div>
  );
}
