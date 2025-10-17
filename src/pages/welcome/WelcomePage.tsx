import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWelcomeStore, welcomeSteps } from "@/stores/welcome-store";
import { useAuthStore } from "@/stores/auth-store";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useProfileActions } from "@/hooks/useProfile";
import {
  ChevronRight,
  ChevronLeft,
  FileText,
  ClipboardList,
  Users,
  BarChart3,
  Play,
  Compass,
  Loader2,
} from "lucide-react";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { BRAND_COLORS } from "@/lib/brand";
import { HexagonalBackground } from "@/components/hexagonal-bg";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";

// Step Components for Left Side
const WelcomeStep = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="flex justify-center flex-col w-full items-center gap-4">
        <img
          src="/assets/logos/vantage-logo.svg"
          height={64}
          width={64}
          alt="Vantage logo"
        />
        <h1 className="text-3xl font-bold text-primary">Welcome to Vantage</h1>
      </div>
      <p className="text-lg text-muted-foreground text-center">
        Your comprehensive asset management assessment and compliance platform.
        Discover, improve, and monitor your organisation&apos;s asset management
        practices.
      </p>
    </div>
  </div>
);

const HowItWorksStep = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">How Vantage Works</h2>
      <p className="text-muted-foreground text-center">
        A complete workflow for asset management assessment
      </p>
    </div>

    <div className="space-y-4">
      <Card>
        <CardContent className="px-4 py-2 flex items-center gap-4">
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
            style={{ backgroundColor: `${BRAND_COLORS.royalBlue}20` }}
          >
            <FileText
              className="h-5 w-5"
              style={{ color: BRAND_COLORS.royalBlue }}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Create Questionnaires</h3>
            <p className="text-sm text-muted-foreground">
              Design comprehensive assessment questionnaires
            </p>
          </div>
          <Badge variant="secondary">1</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-4 py-2 flex items-center gap-4">
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
            style={{ backgroundColor: `${BRAND_COLORS.malibu}20` }}
          >
            <ClipboardList
              className="h-5 w-5"
              style={{ color: BRAND_COLORS.malibu }}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Create Assessments</h3>
            <p className="text-sm text-muted-foreground">
              Set up assessments for specific sites and assets
            </p>
          </div>
          <Badge variant="secondary">2</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-4 py-2 flex items-center gap-4">
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
            style={{ backgroundColor: `${BRAND_COLORS.turquoiseBlue}20` }}
          >
            <Users
              className="h-5 w-5"
              style={{ color: BRAND_COLORS.turquoiseBlue }}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Conduct Interviews</h3>
            <p className="text-sm text-muted-foreground">
              Perform on-site interviews and collect responses
            </p>
          </div>
          <Badge variant="secondary">3</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-4 py-2 flex items-center gap-4">
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
            style={{ backgroundColor: `${BRAND_COLORS.mediumPurple}20` }}
          >
            <BarChart3
              className="h-5 w-5"
              style={{ color: BRAND_COLORS.mediumPurple }}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Analyse Results</h3>
            <p className="text-sm text-muted-foreground">
              Generate insights and compliance reports
            </p>
          </div>
          <Badge variant="secondary">4</Badge>
        </CardContent>
      </Card>
    </div>
  </div>
);

const OnboardingChoiceStep = () => {
  const { onboardingChoice, setOnboardingChoice } = useWelcomeStore();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">
          How would you like to get started?
        </h2>
        <p className="text-muted-foreground  text-center">
          Choose your preferred way to explore Vantage
        </p>
      </div>

      <div className="space-y-4">
        <Card
          className={`cursor-pointer transition-all duration-200 ${
            onboardingChoice === "tour"
              ? "ring-2 bg-primary/5"
              : "hover:shadow-md"
          }`}
          style={{
            borderColor:
              onboardingChoice === "tour"
                ? BRAND_COLORS.pinkFlamingo
                : undefined,
          }}
          onClick={() => setOnboardingChoice("tour")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-full shrink-0"
              style={{
                background: `linear-gradient(to right, ${BRAND_COLORS.pinkFlamingo}, ${BRAND_COLORS.luckyPoint})`,
              }}
            >
              <Play className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Take the Product Tour</h3>
              <p className="text-sm text-muted-foreground">
                Get a guided walkthrough of key features and workflows
              </p>
              <div className="text-xs text-muted-foreground mt-1">
                ~5 minutes • Recommended for new users
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all duration-200 ${
            onboardingChoice === "explore"
              ? "ring-2 bg-primary/5"
              : "hover:shadow-md"
          }`}
          style={{
            borderColor:
              onboardingChoice === "explore"
                ? BRAND_COLORS.azureRadiance
                : undefined,
          }}
          onClick={() => setOnboardingChoice("explore")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-full shrink-0"
              style={{
                background: `linear-gradient(to right, ${BRAND_COLORS.azureRadiance}, ${BRAND_COLORS.cyan})`,
              }}
            >
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Explore on Your Own</h3>
              <p className="text-sm text-muted-foreground">
                Jump right in and discover features at your own pace
              </p>
              <div className="text-xs text-muted-foreground mt-1">
                Access help anytime • Best for experienced users
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Right Side Image Component
const VantageLogo = () => {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <HexagonalBackground/>

      {/* Brand color gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, ${BRAND_COLORS.pinkFlamingo}08, ${BRAND_COLORS.malibu}05, ${BRAND_COLORS.luckyPoint}10)`,
        }}
      />

      {/* Logo container */}
      <div className="relative z-10 flex items-center justify-center h-full p-8">
        <img
          src="/assets/logos/vantage-logo-full-white.png"
          alt="Vantage Logo"
          width={400}
          height={200}
          className="hidden dark:block"
        />
        <img
          src="/assets/logos/vantage-logo-full.svg"
          alt="Vantage Logo"
          width={400}
          height={200}
          className="block dark:hidden"
        />
      </div>
    </div>
  );
};

export function WelcomePage() {
  usePageTitle("Welcome");
  const navigate = useCompanyAwareNavigate();
  const {
    currentStep,
    onboardingChoice,
    nextStep,
    prevStep,
    completeWelcome,
    setOnboardingChoice,
  } = useWelcomeStore();
  const { user, profile, loading, initialize } = useAuthStore();
  const { markOnboarded, isMarkingOnboarded } = useProfileActions();

  // Initialize auth store on mount
  React.useEffect(() => {
    initialize();
  }, [initialize]);

  // Set default onboarding choice to "tour" when reaching the onboarding choice step
  React.useEffect(() => {
    if (currentStep === 2 && !onboardingChoice) {
      setOnboardingChoice("tour");
    }
  }, [currentStep, onboardingChoice, setOnboardingChoice]);

  // Show loading while auth initializes
  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col gap-4 items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  const currentStepData = welcomeSteps[currentStep];
  const isLastStep = currentStep === welcomeSteps.length - 1;
  const canProceed = currentStep < 2 || (currentStep === 2 && onboardingChoice);

  const handleComplete = async () => {
    try {
      // Mark user as onboarded - this automatically updates auth store and cache
      await markOnboarded();

      completeWelcome();

      // Small delay to ensure profile update is processed
      setTimeout(() => {
        // Redirect based on choice
        if (onboardingChoice === "tour") {
          navigate("/dashboard?tour=true");
        } else {
          navigate("/dashboard");
        }
      }, 100);
    } catch (error) {
      console.error("Failed to complete welcome:", error);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStepData.id) {
      case "welcome":
        return <WelcomeStep />;
      case "how-it-works":
        return <HowItWorksStep />;
      case "onboarding-choice":
        return <OnboardingChoiceStep />;
      default:
        return null;
    }
  };

  const renderCurrentImage = () => {
    return <VantageLogo />;
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Side - Content & Controls */}
      <div className="flex flex-col border-r">
        {/* Header with theme toggle */}
        <div className="flex justify-end w-full p-4">
          <ThemeModeToggle />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <div className="flex flex-col items-center space-y-12">
            <div className="w-full max-w-md">{renderCurrentStep()}</div>
            <div className="flex items-center space-x-2">
              {welcomeSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-2 w-6 rounded-full transition-colors ${
                    index <= currentStep
                      ? "bg-primary"
                      : "bg-gray-300 dark:bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <div className="flex items-center">
              {isLastStep ? (
                <Button
                  onClick={handleComplete}
                  disabled={!onboardingChoice || isMarkingOnboarded}
                  className="flex items-center space-x-2"
                >
                  {isMarkingOnboarded ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Opening Vantage...</span>
                    </>
                  ) : (
                    <>
                      <span>Let's go!</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed}
                  className="flex items-center space-x-2"
                >
                  <span>Continue</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Images */}
      <div className="relative hidden lg:block">{renderCurrentImage()}</div>
    </div>
  );
}
