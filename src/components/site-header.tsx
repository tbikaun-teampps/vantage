import React from "react";
import { useLocation, Link, useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeModeToggle } from "./theme-mode-toggle";
import { Button } from "@/components/ui/button";
import { IconQuestionMark } from "@tabler/icons-react";
import { useTourManager } from "@/lib/tours";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeedbackButton } from "@/components/feedback/feedback-button";
// import { CannyFeedbackButton } from "@/components/feedback/canny-feedback-button";
// Ensure tours are imported and registered
import "@/lib/tours";

function generateTitleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard";
  const lastSegment = segments[segments.length - 1];
  return lastSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Hook to safely check if we're within a SidebarProvider
function useSidebarSafe() {
  try {
    return useSidebar();
  } catch {
    return null;
  }
}

export function SiteHeader() {
  const location = useLocation();
  const pathname = location.pathname;
  const { companyId } = useParams<{ companyId: string }>();
  const { hasTourForPage, startTourForPage } = useTourManager();
  const sidebarContext = useSidebarSafe();

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    // Check if this is a company-scoped route
    const isCompanyRoute = companyId && segments[0] === companyId;

    if (isCompanyRoute) {
      // For company-scoped routes, skip the company ID segment in breadcrumbs
      const companyDashboardHref = `/${companyId}/dashboard`;
      const routeSegments = segments.slice(1); // Skip company ID

      // If we're on the dashboard itself, just show Dashboard
      if (
        routeSegments.length === 0 ||
        (routeSegments.length === 1 && routeSegments[0] === "dashboard")
      ) {
        breadcrumbs.push({
          href: companyDashboardHref,
          label: "Dashboard",
          isCurrent: true,
        });
        return breadcrumbs;
      }

      // For other company routes, start with Dashboard link
      breadcrumbs.push({
        href: companyDashboardHref,
        label: "Dashboard",
        isCurrent: false,
      });

      // Build breadcrumbs from remaining segments (excluding company ID)
      let currentPath = `/${companyId}`;
      for (let i = 0; i < routeSegments.length; i++) {
        currentPath += `/${routeSegments[i]}`;
        const isCurrent = i === routeSegments.length - 1;
        const label = generateTitleFromPath(currentPath);

        breadcrumbs.push({
          href: currentPath,
          label,
          isCurrent,
        });
      }
    } else {
      // For non-company routes (global routes like /settings, /account)
      // Just show the current page
      breadcrumbs.push({
        href: pathname,
        label: generateTitleFromPath(pathname),
        isCurrent: true,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const hasTour = hasTourForPage(pathname);
  const showTourButton = hasTour; // Show only if tour exists for this page

  const handleTourClick = () => {
    startTourForPage(pathname);
  };

  return (
    <header className="sticky top-0 flex h-[--header-height] shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height] p-4 z-10">
      <div className="flex w-full flex-col gap-1 px-4 lg:px-6">
        <div className="flex items-center justify-between gap-2 lg:gap-4">
          <div className="flex items-center gap-1 lg:gap-2">
            {sidebarContext && (
              <>
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mx-2 data-[orientation=vertical]:h-4"
                />
              </>
            )}
            {breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem>
                        {crumb.isCurrent ? (
                          <BreadcrumbPage className="text-xs text-muted-foreground">
                            {crumb.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            asChild
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Link to={crumb.href}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showTourButton && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleTourClick}
                      className="h-8 w-8 p-0 cursor-help"
                      data-tour="help-icon"
                    >
                      <IconQuestionMark className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Take a tour of this page</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <FeedbackButton />
            {/* <CannyFeedbackButton /> */}
            <ThemeModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
