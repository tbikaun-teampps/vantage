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

interface AnalyticsFilters {
  assessments: { id: number; name: string; questionnaireId?: number }[];
  questionnaires?: { id: number; name: string; assessmentIds: number[] }[];
  measurements?: {
    id: number;
    name: string;
    description: string;
    unit: string;
  }[];
  axes: { value: string; category: string; order: number }[];
  metrics?: string[];
  aggregationMethods?: string[];
}

type ViewType = "metrics" | "geography";

interface AnalyticsContextValue {
  assessmentType: "onsite" | "desktop";
  setAssessmentType: (type: "onsite" | "desktop") => void;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  filters: AnalyticsFilters | null;
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

  const [filters, setFilters] = useState<AnalyticsFilters | null>(null);
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

        if (!response) {
          setFilters(null);
          return;
        }

        // Transform the response to match our interface
        const transformedFilters: AnalyticsFilters = {
          assessments: (response as any).assessments || [],
          axes: (response as any).axes || [],
        };

        // Add type-specific fields
        if (assessmentType === "onsite") {
          transformedFilters.questionnaires =
            (response as any).questionnaires || [];
          transformedFilters.metrics = (response as any).metrics || [];
        } else if (assessmentType === "desktop") {
          transformedFilters.measurements =
            (response as any).measurements || [];
          transformedFilters.aggregationMethods =
            (response as any).aggregationMethods || [];
        }

        console.log("transformed filters: ", transformedFilters);

        setFilters(transformedFilters);
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
