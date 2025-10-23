import { useQuery } from "@tanstack/react-query";
import { companyKeys, useCompanyActions } from "@/hooks/useCompany";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { companyRoutes } from "@/router/routes";
import {
  IconBuilding,
  IconPlus,
  IconTrash,
  IconPalette,
} from "@tabler/icons-react";
import { useState } from "react";
import { Loader } from "@/components/loader";
import { HexagonalBackground } from "@/components/hexagonal-bg";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { DemoBanner } from "@/components/demo-banner";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { useProfile } from "@/hooks/useProfile";
import { AddCompanyForm } from "@/components/forms/add-company-form";
import { DeleteDialog } from "@/components/settings/company";
import { toast } from "sonner";
import { SelectCompanyUserMenu } from "@/components/select-company-user-menu";
import { getCompanies } from "@/lib/api/companies";
import { ManageCompanyBrandingDialog } from "@/components/forms/manage-company-branding-dialog";
import { cn, getRoleBadge } from "@/lib/utils";
import type { Company } from "@/types/api/companies";

/**
 * Company selection page - shown when user needs to select a company
 */
export function SelectCompanyPage() {
  const navigate = useCompanyAwareNavigate();
  const { canCreateCompany } = useFeatureFlags();
  const { deleteCompany } = useCompanyActions();
  const { data: profile } = useProfile();
  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteConfirmationText, setDeleteConfirmationText] =
    useState<string>("");
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  // Branding dialog state
  const [showBrandingDialog, setShowBrandingDialog] = useState<boolean>(false);
  const [companyForBranding, setCompanyForBranding] = useState<Company | null>(
    null
  );

  const {
    data: companies,
    isLoading,
    error,
  } = useQuery({
    queryKey: companyKeys.lists(),
    queryFn: () => getCompanies(),
    staleTime: 5 * 60 * 1000,
  });

  if (!profile) {
    return null;
  }

  const isDemoMode = profile.subscription_tier === "demo";

  const handleCompanySelect = (companyId: string) => {
    navigate(companyRoutes.dashboard(companyId));
  };

  const handleDeleteClick = (company: Company, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent company selection when clicking delete
    setCompanyToDelete(company);
    setShowDeleteDialog(true);
  };

  const handleEditBrandingClick = (
    company: Company,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Prevent company selection when clicking edit
    setCompanyForBranding(company);
    setShowBrandingDialog(true);
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) {
      console.error("No company selected for deletion");
      return;
    }

    // Validate confirmation text matches company name
    if (deleteConfirmationText.trim() !== companyToDelete.name) {
      toast.error(
        "Company name does not match. Please type the exact company name to confirm deletion."
      );
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCompany(companyToDelete.id);
      toast.success("Company deleted successfully");
      setShowDeleteDialog(false);
      setDeleteConfirmationText("");
      setCompanyToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting the company"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setShowDeleteDialog(open);
    if (!open) {
      setDeleteConfirmationText("");
      setCompanyToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="mx-auto w-[400px]">
          <CardHeader>
            <CardTitle>Error Loading Companies</CardTitle>
            <CardDescription>
              There was an error loading your companies. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <DemoBanner />
      <HexagonalBackground />
      <div className="h-screen flex items-center justify-center p-6 relative">
        {/* User menu in top-right corner */}
        <div
          className={`absolute right-6 z-10 ${isDemoMode ? "top-14" : "top-6"}`}
        >
          <SelectCompanyUserMenu />
        </div>
        <Card
          className="w-2xl mx-auto backdrop-blur-sm"
          data-tour="company-selection"
        >
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4">
              <img
                src="/assets/logos/vantage-logo.svg"
                width={40}
                height={40}
                alt="Vantage logo"
              />
            </div>
            <CardTitle className="text-2xl">Welcome to Vantage!</CardTitle>
            <CardDescription>
              {companies && companies.length > 0
                ? "Select a company to continue"
                : isDemoMode
                  ? ""
                  : "Get started by creating your first company"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {companies && companies.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Your Companies
                </h3>
                <div className="grid gap-3">
                  {companies.map((company) => (
                    <div key={company.id} className="relative group">
                      <Button
                        variant="outline"
                        className="justify-start p-4 h-auto w-full overflow-hidden"
                        onClick={() => handleCompanySelect(company.id)}
                      >
                        <div className="flex items-center space-x-3 flex-1 pr-16 min-w-0">
                          <div
                            className={cn(
                              "flex items-center justify-center w-8 h-8 rounded flex-shrink-0",
                              company.icon_url
                                ? "bg-transparent"
                                : "bg-primary/10"
                            )}
                          >
                            {company.icon_url ? (
                              <img
                                src={company.icon_url}
                                alt={company.name}
                                className="w-6 h-6 object-contain"
                              />
                            ) : (
                              <IconBuilding className="w-4 h-4" />
                            )}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 justify-between">
                              <div className="flex items-center gap-2">
                                <div className="font-medium truncate">
                                  {company.name}
                                </div>
                                {company.is_demo && (
                                  <Badge
                                    variant="default"
                                    className="mr-auto flex-shrink-0"
                                  >
                                    Demo
                                  </Badge>
                                )}
                              </div>
                              {company.role && (
                                <Badge
                                  variant={getRoleBadge(company.role).variant}
                                  className="ml-auto flex-shrink-0"
                                >
                                  Role: {getRoleBadge(company.role).text}
                                </Badge>
                              )}
                            </div>
                            {company.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-md">
                                {company.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </Button>
                      {(company.role === "admin" ||
                        company.role === "owner") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleEditBrandingClick(company, e)}
                          title="Manage Branding"
                        >
                          <IconPalette className="w-4 h-4" />
                        </Button>
                      )}
                      {company.role === "owner" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDeleteClick(company, e)}
                          disabled={isDeleting}
                        >
                          <IconTrash className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isDemoMode && (!companies || companies.length === 0) && (
              <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Demo companies are currently not available. Please try again
                  later or contact support.
                </p>
              </div>
            )}

            {canCreateCompany && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Actions
                </h3>
                <div className="flex flex-col gap-3">
                  <AddCompanyForm>
                    <Button className="justify-start p-4 h-auto w-full">
                      <div className="flex items-center space-x-3">
                        <IconPlus className="w-4 h-4" />
                        <span>Create New Company</span>
                      </div>
                    </Button>
                  </AddCompanyForm>

                  {/* <Button
                  variant="outline"
                  onClick={handleStartTour}
                  className="justify-start p-4 h-auto"
                  data-tour="platform-tour-button"
                  >
                  <div className="flex items-center space-x-3">
                  <IconRocket className="w-4 h-4" />
                  <span>Take Platform Tour</span>
                  </div>
                  </Button> */}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {companies && companies.length > 0 && (
          <>
            <DeleteDialog
              showDeleteDialog={showDeleteDialog}
              handleDialogOpenChange={handleDialogOpenChange}
              deleteConfirmationText={deleteConfirmationText}
              setDeleteConfirmationText={setDeleteConfirmationText}
              handleDeleteCompany={handleDeleteCompany}
              isDeleting={isDeleting}
              companyToDelete={companyToDelete}
            />
            {companyForBranding && (
              <ManageCompanyBrandingDialog
                open={showBrandingDialog}
                onOpenChange={setShowBrandingDialog}
                company={companyForBranding}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
