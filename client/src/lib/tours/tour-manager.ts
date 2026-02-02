// Tour management system for onboarding users
import { driver, type DriveStep, type Config } from "driver.js";
import "driver.js/dist/driver.css";

export type TourId =
  | "platform-overview"
  | "company-setup"
  | "company-form"
  | "dashboard-overview"
  | "questionnaire-creation"
  | "questionnaire-management"
  | "questionnaire-editor"
  | "question-editor"
  | "assessment-management"
  | "assessment-creation"
  | "assessment-detail"
  | "interview-management"
  | "interview-detail"
  | "interview-detail-mobile"
  | "analytics-overview"
  | "company-settings"
  | "account-settings";

interface TourConfig {
  id: TourId;
  steps: DriveStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

interface TourProgress {
  [key: string]: {
    completed: boolean;
    skipped: boolean;
  };
}

class TourManager {
  private driver: ReturnType<typeof driver>;
  private tours: Map<TourId, TourConfig> = new Map();
  private storageKey = "vantage-tour-progress";

  constructor() {
    this.driver = driver({
      showProgress: true,
      allowClose: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: "Next →",
      prevBtnText: "← Previous",
      doneBtnText: "Done ✓",
      closeBtnText: "✕",
    } as Config);
  }

  /**
   * Register a tour configuration
   */
  registerTour(config: TourConfig) {
    this.tours.set(config.id, config);
  }

  /**
   * Start a specific tour
   */
  startTour(tourId: TourId, force = false) {
    const tour = this.tours.get(tourId);
    console.log("Starting tour:", tourId, "Force:", force);
    if (!tour) {
      console.warn("Sorry, could not find tour.");
      console.log('this.tours', this.tours);
      return;
    }

    // Check if already completed (unless forced)
    if (!force && this.getTourProgress()[tourId]?.completed) {
      return;
    }

    this.driver.setConfig({
      steps: tour.steps,
      onDestroyed: (_element, _step, options) => {
        const currentStepIndex = options.state?.activeIndex ?? 0;
        const isLastStep = currentStepIndex === tour.steps.length - 1;

        if (isLastStep) {
          tour.onComplete?.();
          this.markTourCompleted(tourId);
        } else {
          tour.onSkip?.();
          this.markTourSkipped(tourId);
        }
      },
    });

    this.driver.drive();
  }

  /**
   * Check if a tour should be shown automatically
   */
  shouldShowTour(tourId: TourId): boolean {
    const progress = this.getTourProgress()[tourId];
    return !progress || (!progress.completed && !progress.skipped);
  }

  /**
   * Mark a tour as completed
   */
  markTourCompleted(tourId: TourId) {
    const progress = this.getTourProgress();
    progress[tourId] = { completed: true, skipped: false };
    this.saveTourProgress(progress);
  }

  markTourSkipped(tourId: TourId) {
    const progress = this.getTourProgress();
    progress[tourId] = { completed: false, skipped: true };
    this.saveTourProgress(progress);
  }

  /**
   * Reset a specific tour (allow it to be shown again)
   */
  resetTour(tourId: TourId) {
    const progress = this.getTourProgress();
    delete progress[tourId];
    this.saveTourProgress(progress);
  }

  /**
   * Reset all tours
   */
  resetAllTours() {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Get tour progress from localStorage
   */
  private getTourProgress(): TourProgress {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn("Failed to parse tour progress:", error);
      return {};
    }
  }

  /**
   * Save tour progress to localStorage
   */
  private saveTourProgress(progress: TourProgress) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(progress));
    } catch (error) {
      console.warn("Failed to save tour progress:", error);
    }
  }

  /**
   * Get the appropriate tour for a given page path
   */
  getTourForPage(pathname: string): TourId | null {
    // Handle global routes (no company context needed)
    switch (pathname) {
      case "/account":
        return "account-settings";
      case "/settings/company/new":
        return "company-form";
    }

    // Handle external routes
    if (pathname.match(/^\/external\/interview\/[a-fA-F0-9-]+$/)) {
      return "interview-detail";
    }

    // Handle company-scoped routes with /:companyId/* pattern
    // Extract the path after the company ID
    const companyRouteMatch = pathname.match(/^\/[a-fA-F0-9-]+(.*)$/);
    if (companyRouteMatch) {
      const routePath = companyRouteMatch[1]; // The path after /:companyId

      // Exact matches for company-scoped routes
      switch (routePath) {
        case "/dashboard":
          return "dashboard-overview";
        case "/questionnaires":
          return "questionnaire-management";
        case "/questionnaires/new":
          return "questionnaire-creation";
        case "/assessments/onsite/new":
          return "assessment-creation";
      }

      // Pattern matching for dynamic company-scoped routes (order matters - most specific first)
      if (
        routePath.match(/^\/assessments\/onsite\/interviews\/[a-fA-F0-9-]+$/)
      ) {
        return "interview-detail";
      } else if (routePath.match(/^\/assessments\/onsite\/[a-fA-F0-9-]+$/)) {
        return "assessment-detail";
      } else if (
        routePath.startsWith("/questionnaires/") &&
        routePath !== "/questionnaires/new"
      ) {
        return "questionnaire-editor";
      } else if (routePath.startsWith("/assessments/onsite/interviews")) {
        return "interview-management";
      } else if (routePath.includes("/question-editor")) {
        return "question-editor";
      } else if (routePath.startsWith("/settings")) {
        return "company-settings";
      } else if (routePath.startsWith("/assessments")) {
        return "assessment-management";
      } else if (routePath.startsWith("/analytics")) {
        return "analytics-overview";
      }
    }

    // Default fallback
    return "platform-overview";
  }

  /**
   * Check if a tour exists for the given page
   */
  hasTourForPage(pathname: string): boolean {
    const tourId = this.getTourForPage(pathname);
    return tourId !== null && this.tours.has(tourId);
  }

  /**
   * Start the appropriate tour for the current page
   */
  startTourForPage(pathname: string): void {
    const tourId = this.getTourForPage(pathname);
    if (tourId && this.tours.has(tourId)) {
      this.startTour(tourId, true);
    }
  }
}

// Singleton instance
export const tourManager = new TourManager();

// Helper hook for React components
export const useTourManager = () => {
  return {
    startTour: (tourId: TourId, force = false) =>
      tourManager.startTour(tourId, force),
    shouldShowTour: (tourId: TourId) => tourManager.shouldShowTour(tourId),
    resetTour: (tourId: TourId) => tourManager.resetTour(tourId),
    resetAllTours: () => tourManager.resetAllTours(),
    hasTourForPage: (pathname: string) => tourManager.hasTourForPage(pathname),
    startTourForPage: (pathname: string) =>
      tourManager.startTourForPage(pathname),
  };
};
