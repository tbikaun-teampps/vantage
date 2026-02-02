import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { usePageTitle } from "@/hooks/usePageTitle";
import { companyRoutes } from "@/router/routes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HexagonalBackground } from "@/components/hexagonal-bg";
import { IconBuilding, IconMail, IconLogout } from "@tabler/icons-react";
import { Loader } from "@/components/loader";

/**
 * Enterprise welcome page - shown when enterprise users sign in but don't have a company set up yet
 * This is a placeholder page that informs users their company setup is pending
 */
export function EnterpriseWelcomePage() {
  usePageTitle("Welcome");
  const navigate = useNavigate();
  const { user, profile, loading, companies, signOut } = useAuthStore();

  // Redirect to dashboard if company becomes available
  // This handles the case where user refreshes the page after admin sets up their company
  useEffect(() => {
    if (!loading && companies.length > 0) {
      // Enterprise users should only have one company, redirect to its dashboard
      navigate(companyRoutes.dashboard(companies[0].id), { replace: true });
    }
  }, [loading, companies, navigate]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  if (loading || !user || !profile) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <HexagonalBackground />
      <div className="h-screen flex items-center justify-center p-6 relative">
        <Card className="w-full max-w-2xl mx-auto backdrop-blur-sm">
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
              Your enterprise account is being set up
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* User info */}
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                  <IconBuilding className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Enterprise Account</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Information message */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                  Company Setup in Progress
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  Your company is currently being configured
                  by our team. You will receive an email notification once your
                  company is ready and you can access the platform.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">What happens next?</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">1.</span>
                    <span>
                      Our team is setting up your company configuration
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">2.</span>
                    <span>
                      You'll receive an email when your account is ready to use
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">3.</span>
                    <span>
                      Simply sign in again to access your company dashboard
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact support */}
            <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
              <div className="flex items-start gap-3">
                <IconMail className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">Need Help?</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If you have any questions or need assistance, please contact
                    our support team. We're here to help!
                  </p>
                </div>
              </div>
            </div>

            {/* Sign out button */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full"
              >
                <IconLogout className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
