import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { getOverallHeatmapFilters } from "@/lib/api/analytics";
import type { GetOverallHeatmapFiltersResponseData } from "@/types/api/analytics";

type ViewType = "metrics" | "geography";

interface AnalyticsContextValue {
  assessmentType: "onsite" | "desktop";
  setAssessmentType: (type: "onsite" | "desktop") => void;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  filters: GetOverallHeatmapFiltersResponseData["options"] | null;
  isLoadingFilters: boolean;
  filterError: string | null;
  companyId: string;
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(
  undefined
);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const companyId = useCompanyFromUrl();
  const navigate = useCompanyAwareNavigate();
  const [searchParams] = useSearchParams();

  // Initialize state from URL params
  const typeParam = searchParams.get("type");
  const viewParam = searchParams.get("view");

  const [assessmentType, setAssessmentTypeState] = useState<
    "onsite" | "desktop"
  >(typeParam === "desktop" ? "desktop" : "onsite");

  const [activeView, setActiveViewState] = useState<ViewType>(
    viewParam === "geography" ? "geography" : "metrics"
  );

  const [filters, setFilters] = useState<GetOverallHeatmapFiltersResponseData["options"] | null>(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  // Sync with URL params on change
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const urlType = typeParam === "desktop" ? "desktop" : "onsite";
    if (urlType !== assessmentType) {
      setAssessmentTypeState(urlType);
    }

    const viewParam = searchParams.get("view");
    const urlView = viewParam === "geography" ? "geography" : "metrics";
    if (urlView !== activeView) {
      setActiveViewState(urlView);
    }
  }, [searchParams]);

  // Update URL when state changes
  const setAssessmentType = (newType: "onsite" | "desktop") => {
    setAssessmentTypeState(newType);
    const params = new URLSearchParams(searchParams.toString());
    if (newType === "onsite") {
      params.delete("type");
    } else {
      params.set("type", newType);
    }
    const queryString = params.toString();
    navigate(`/analytics${queryString ? `?${queryString}` : ""}`);
  };

  const setActiveView = (newView: ViewType) => {
    setActiveViewState(newView);
    const params = new URLSearchParams(searchParams.toString());
    if (newView === "metrics") {
      params.delete("view");
    } else {
      params.set("view", newView);
    }
    const queryString = params.toString();
    navigate(`/analytics${queryString ? `?${queryString}` : ""}`);
  };

  // Fetch filters when assessment type changes
  useEffect(() => {
    const fetchFilters = async () => {
      if (!companyId || !assessmentType) return;

      setIsLoadingFilters(true);
      setFilterError(null);

      try {
        const response = await getOverallHeatmapFilters(
          companyId,
          assessmentType
        );

        // Set the API response directly - no transformation needed
        setFilters(response.options || null);
      } catch (err) {
        console.error("Failed to fetch analytics filters:", err);
        setFilterError(
          err instanceof Error ? err.message : "Failed to fetch filters"
        );
        setFilters(null);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilters();
  }, [companyId, assessmentType]);

  return (
    <AnalyticsContext.Provider
      value={{
        assessmentType,
        setAssessmentType,
        activeView,
        setActiveView,
        filters,
        isLoadingFilters,
        filterError,
        companyId,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}

export function useOnsiteAnalytics() {
  const context = useAnalytics();
  if (context.assessmentType !== "onsite") {
    console.warn("useOnsiteAnalytics used with non-onsite assessment type");
  }
  return {
    ...context,
    filters: context.filters as Extract<
      typeof context.filters,
      { questionnaires?: unknown }
    >,
  };
}

export function useDesktopAnalytics() {
  const context = useAnalytics();
  if (context.assessmentType !== "desktop") {
    console.warn("useDesktopAnalytics used with non-desktop assessment type");
  }
  return {
    ...context,
    filters: context.filters as Extract<
      typeof context.filters,
      { measurements?: unknown }
    >,
  };
}
