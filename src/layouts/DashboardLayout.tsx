import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DemoBanner } from "@/components/demo-banner";
import { ErrorBoundary } from "@/components/error-boundary";
import { ScreenSizeProvider } from "@/components/providers/screen-size-provider";
import { useAuthStore } from "@/stores/auth-store";
import { useProfile } from "@/hooks/useProfile";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { FeedbackDialogProvider } from "@/contexts/FeedbackDialogContext";

export function DashboardLayout() {
  const navigate = useCompanyAwareNavigate();
  const { authenticated, loading: authLoading } = useAuthStore();
  const { data: profile, error: profileError } = useProfile();

  // Check for welcome redirect when profile is loaded
  useEffect(() => {
    // Only redirect if not already on welcome page and user is authenticated
    if (
      authenticated &&
      profile &&
      !profile.onboarded &&
      !window.location.pathname.includes("/welcome")
    ) {
      navigate("/welcome");
    }
  }, [authenticated, profile, navigate]);

  // Show loading while auth is initializing
  // Note: We don't block on profile loading - let UI show progressively
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>;
  }

  // Show error if profile failed to load (but still show UI)
  if (profileError) {
    console.error("Profile loading error:", profileError);
    // Continue to show UI even if profile fails - better UX
  }

  return (
    <ErrorBoundary>
      <ScreenSizeProvider>
        <FeedbackDialogProvider>
          <div className="relative min-h-screen">
            <DemoBanner />
            <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 64)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
            className="[&_[data-slot=sidebar-container]]:top-[var(--demo-banner-height)] [&_[data-slot=sidebar-container]]:h-[calc(100vh-var(--demo-banner-height))]"
          >
            <AppSidebar variant="inset" />
            <SidebarInset className="pt-[var(--demo-banner-height)] flex flex-col h-[calc(100vh-var(--demo-banner-height))]">
              <SiteHeader />
              <main className="flex flex-col flex-1 min-h-0">
                <ErrorBoundary>
                  <Outlet />
                </ErrorBoundary>
              </main>
            </SidebarInset>
          </SidebarProvider>
          </div>
        </FeedbackDialogProvider>
      </ScreenSizeProvider>
    </ErrorBoundary>
  );
}
