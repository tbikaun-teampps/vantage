import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, Filter, Maximize, Minimize } from "lucide-react";
import { Link } from "react-router-dom";
import { IconExternalLink } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LabelWithInfo } from "@/components/ui/label-with-info";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import MultiSelect from "@/pages/questionnaires/components/questions/multi-select";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import { getOverallOnsiteHeatmap } from "@/lib/api/analytics";
import { useAnalytics } from "../../../contexts/AnalyticsContext";
import { renderHeatmap } from "./render";

type HeatmapMetric =
  | "average_score"
  | "total_interviews"
  | "completion_rate"
  | "total_actions";

interface HeatmapDataPoint {
  x: string;
  y: string;
  value: number;
  sampleSize: number;
  metadata: any;
}

interface HeatmapApiResponse {
  xLabels: string[];
  yLabels: string[];
  metrics: {
    [K in HeatmapMetric]: {
      data: HeatmapDataPoint[];
      values: number[];
    };
  };
  config: {
    xAxis: string;
    yAxis: string;
    questionnaireId: number;
    assessmentId: number | null;
  };
}

export default function OnsiteHeatmap() {
  const { filters, isLoadingFilters, filterError, companyId } = useAnalytics();
  const routes = useCompanyRoutes();

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    number | null
  >(null);
  const [selectedMetric, setSelectedMetric] =
    useState<HeatmapMetric>("average_score");
  const [xAxis, setXAxis] = useState<string>("business_unit");
  const [yAxis, setYAxis] = useState<string>("role");
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<
    number | null
  >(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // New organizational filtering state
  const [selectedBusinessUnits, setSelectedBusinessUnits] = useState<string[]>(
    []
  );
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [svgDimensions, setSvgDimensions] = useState({
    width: 800,
    height: 500,
  });

  const [data, setData] = useState<HeatmapApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default questionnaire when filters load (if assessment is 'onsite' type)
  useEffect(() => {
    if (
      filters?.questionnaires &&
      filters?.questionnaires?.length > 0 &&
      !selectedQuestionnaire
    ) {
      setSelectedQuestionnaire(filters?.questionnaires[0].id);
    }
  }, [filters, selectedQuestionnaire]);

  // Fetch heatmap data when filters change
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedQuestionnaire) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await getOverallOnsiteHeatmap(
          companyId,
          selectedQuestionnaire,
          selectedAssessmentId ?? undefined,
          xAxis as any,
          yAxis as any
        );

        if (!response) return;
        console.log("Heatmap response:", response);
        setData(response);

        // Sync UI state with config from response (in case defaults were applied)
        if (response.config) {
          if (response.config.xAxis !== xAxis) {
            setXAxis(response.config.xAxis);
          }
          if (response.config.yAxis !== yAxis) {
            setYAxis(response.config.yAxis);
          }
        }
      } catch (err) {
        console.error("Failed to fetch heatmap:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch heatmap data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [companyId, selectedQuestionnaire, selectedAssessmentId, xAxis, yAxis]);

  // Update SVG dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Account for padding (p-6 = 24px on each side)
        const width = rect.width - 48;
        const height = rect.height - 48;
        setSvgDimensions({
          width: Math.max(400, width),
          height: Math.max(300, height),
        });
      }
    };

    // Delay update to allow sidebar transition to complete
    const timeoutId = setTimeout(updateDimensions, 100);

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [isSidebarOpen]); // Add isSidebarOpen as dependency

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    try {
      if (!cardRef.current) return;

      if (!document.fullscreenElement) {
        await cardRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

      // Auto-close sidebar in fullscreen for more space
      if (isNowFullscreen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // D3 Heatmap rendering
  useEffect(() => {
    if (!svgRef.current || !data || svgRef === null) return;

    // Get current metric data
    const selectedData = data.metrics[selectedMetric];

    // Initial render
    renderHeatmap(
      svgRef,
      containerRef,
      selectedData.data,
      selectedData.values,
      data.xLabels,
      data.yLabels,
      (value) => {
        if (value === null || value === undefined) {
          return "N/A";
        }
        if (selectedMetric === "completion_rate") {
          return `${value.toFixed(0)}%`;
        } else if (
          selectedMetric === "total_interviews" ||
          selectedMetric === "total_actions"
        ) {
          return value.toString();
        } else {
          return value.toFixed(1);
        }
      }
    );

    // Cleanup
    return () => {
      d3.selectAll(".heatmap-tooltip").remove();
    };
  }, [data, selectedMetric, svgDimensions]);

  const hasData = data && data.metrics[selectedMetric].data.length > 0;

  // Show loading state while filters are being fetched
  if (isLoadingFilters || !filters) {
    return (
      <div className="flex flex-col items-center gap-2 h-full mx-auto">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading filters...</p>
      </div>
    );
  }

  // Show error from context if filters failed to load
  if (filterError) {
    return (
      <Card className="shadow-none border-none">
        <CardContent className="flex items-center justify-center h-[400px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load filters: {filterError}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-none border-none">
        <CardContent className="flex items-center justify-center h-[400px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load assessment metrics: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Create the filter sidebar component
  const FilterSidebar = () => (
    <div
      className={`bg-background border-r flex-shrink-0 transition-all duration-300 ${
        isSidebarOpen ? "w-80" : "w-0"
      } overflow-hidden h-full`}
    >
      {isSidebarOpen && (
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {/* Basic Filters */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Basic Filters</h3>

            <div className="space-y-2">
              <LabelWithInfo
                label="Questionnaire"
                tooltip="Choose a specific questionnaire to filter assessments, or select 'All' to include all questionnaires in the analysis."
                isFullscreen={isFullscreen}
                container={cardRef.current}
              />
              <Select
                value={selectedQuestionnaire?.toString()}
                onValueChange={(value) =>
                  setSelectedQuestionnaire(parseInt(value))
                }
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select questionnaire" />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  {filters?.questionnaires?.map((q) => (
                    <SelectItem key={q.id} value={q.id.toString()}>
                      {q.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <LabelWithInfo
                label="Assessment Scope"
                tooltip="Select a single assessment for detailed analysis, or leave empty to include all assessments."
                isFullscreen={isFullscreen}
                container={cardRef.current}
              />
              <Select
                value={selectedAssessmentId?.toString() || "all"}
                onValueChange={(value) =>
                  setSelectedAssessmentId(
                    value === "all" ? null : parseInt(value)
                  )
                }
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="All assessments" />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  <SelectItem value="all">All Assessments</SelectItem>
                  {filters.assessments
                    .filter(
                      (a) =>
                        !selectedQuestionnaire ||
                        a.questionnaireId === selectedQuestionnaire
                    )
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        <div className="truncate" title={a.name}>
                          {a.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <LabelWithInfo
                label="Data Metric"
                tooltip="Choose what data to visualize: Average Score (mean ratings), Total Interviews (count), Total Actions (action items count), or Completion Rate (percentage of completed responses)."
                isFullscreen={isFullscreen}
                container={cardRef.current}
              />
              <Select
                value={selectedMetric}
                onValueChange={(value) =>
                  setSelectedMetric(value as HeatmapMetric)
                }
                disabled={!selectedQuestionnaire}
              >
                <SelectTrigger className="w-full h-8 text-xs capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  {filters?.metrics?.map((m) => (
                    <SelectItem key={m} value={m} className="capitalize">
                      {m.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Analysis Configuration */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-sm">Analysis Configuration</h3>

            {/* <div className="space-y-2">
              <LabelWithInfo
                label="Detail Level"
                tooltip="Set the granularity of analysis: Individual Questions (most detailed), Steps (groups of questions), or Sections (high-level categories)."
                isFullscreen={isFullscreen}
                container={cardRef.current}
              />
              <Select
                value={questionnaireLevel}
                onValueChange={setQuestionnaireLevel}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent container={isFullscreen ? cardRef.current || undefined : undefined}>
                  <SelectItem value="Question">
                    Individual Questions
                  </SelectItem>
                  <SelectItem value="Step">Steps</SelectItem>
                  <SelectItem value="Section">
                    Sections
                  </SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <div className="space-y-2">
              <LabelWithInfo
                label="X-Axis"
                tooltip="Choose what to display horizontally: organizational hierarchy (Business Unit, Site, etc.), Roles, or questionnaire elements (Sections, Steps, Questions)."
                isFullscreen={isFullscreen}
                container={cardRef.current}
              />
              <Select
                value={xAxis}
                onValueChange={setXAxis}
                disabled={!selectedQuestionnaire}
              >
                <SelectTrigger className="w-full h-8 text-xs capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Company Hierarchy
                  </div>
                  {filters.axes
                    .filter((item) => item.category === "company")
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="capitalize"
                      >
                        {item.value.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                    Questionnaire
                  </div>
                  {filters.axes
                    .filter((item) => item.category === "questionnaire")
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="capitalize"
                      >
                        {item.value.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <LabelWithInfo
                label="Y-Axis"
                tooltip="Choose what to display vertically: organizational hierarchy (Business Unit, Site, etc.), Roles, or questionnaire elements (Sections, Steps, Questions)."
                isFullscreen={isFullscreen}
                container={cardRef.current}
              />
              <Select
                value={yAxis}
                onValueChange={setYAxis}
                disabled={!selectedQuestionnaire}
              >
                <SelectTrigger className="w-full h-8 text-xs capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Company Hierarchy
                  </div>
                  {filters.axes
                    .filter((item) => item.category === "company")
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="capitalize"
                      >
                        {item.value.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                    Questionnaire
                  </div>
                  {filters.axes
                    .filter((item) => item.category === "questionnaire")
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="capitalize"
                      >
                        {item.value.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Organizational Filters */}
          {/* <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-sm">Organizational Filters</h3>

            {organizationalData.businessUnits.length > 0 && (
              <div className="space-y-2">
                <LabelWithInfo
                  label="Business Units"
                  tooltip="Filter results to include only selected business units. Leave empty to include all business units in the analysis."
                  isFullscreen={isFullscreen}
                  container={cardRef.current}
                />
                <MultiSelect
                  options={organizationalData.businessUnits}
                  value={selectedBusinessUnits}
                  onChange={setSelectedBusinessUnits}
                  placeholder="All business units"
                />
              </div>
            )}

            {organizationalData.sites.length > 0 && (
              <div className="space-y-2">
                <LabelWithInfo
                  label="Sites"
                  tooltip="Filter results to include only selected sites/locations. Leave empty to include all sites in the analysis."
                  isFullscreen={isFullscreen}
                  container={cardRef.current}
                />
                <MultiSelect
                  options={organizationalData.sites}
                  value={selectedSites}
                  onChange={setSelectedSites}
                  placeholder="All sites"
                />
              </div>
            )}

            {organizationalData.roles.length > 0 && (
              <div className="space-y-2">
                <LabelWithInfo
                  label="Roles"
                  tooltip="Filter results to include only selected job roles/positions. Leave empty to include all roles in the analysis."
                  isFullscreen={isFullscreen}
                  container={cardRef.current}
                />
                <MultiSelect
                  options={organizationalData.roles}
                  value={selectedRoles}
                  onChange={setSelectedRoles}
                  placeholder="All roles"
                />
              </div>
            )}
          </div> */}

          {/* Data Summary Bar */}
          <div className="flex-1 border-t pt-4">
            <div className="flex gap-1 flex-wrap">
              {selectedQuestionnaire && filters && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {
                    filters?.questionnaires?.find(
                      (q) => q.id === selectedQuestionnaire
                    )?.name
                  }
                </Badge>
              )}
              {selectedAssessmentId && filters && (
                <Button
                  asChild
                  variant="outline"
                  className="text-xs flex-shrink-0"
                >
                  <Link
                    to={routes.assessmentOnsiteDetail(
                      selectedAssessmentId.toString()
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {
                      filters.assessments.find(
                        (a) => a.id === selectedAssessmentId
                      )?.name
                    }
                    <IconExternalLink className="h-2 w-2" />
                  </Link>
                </Button>
              )}

              {/* Organizational Filter Badges */}
              {selectedBusinessUnits.length > 0 && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {selectedBusinessUnits.length} BU
                  {selectedBusinessUnits.length > 1 ? "s" : ""}
                </Badge>
              )}
              {selectedSites.length > 0 && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {selectedSites.length} Site
                  {selectedSites.length > 1 ? "s" : ""}
                </Badge>
              )}
              {selectedRoles.length > 0 && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {selectedRoles.length} Role
                  {selectedRoles.length > 1 ? "s" : ""}
                </Badge>
              )}

              <Badge
                variant="outline"
                className="text-xs flex-shrink-0 capitalize"
              >
                {selectedMetric.replaceAll("_", " ")}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs flex-shrink-0 capitalize"
              >
                {xAxis.replaceAll("_", " ")} × {yAxis.replaceAll("_", " ")}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card
      ref={cardRef}
      className={`h-full relative p-0 overflow-hidden shadow-none border-none rounded-none ${
        isFullscreen ? "bg-background" : ""
      }`}
    >
      <div className="h-full w-full min-h-[500px] flex">
        <div data-tour="analytics-heatmap-filters">
          <FilterSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Header Controls */}
          <div className="flex justify-between items-center border-b bg-background/50 p-4 gap-4">
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="p-2"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Toggle filters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="p-2"
                      data-tour="analytics-heatmap-fullscreen"
                    >
                      {isFullscreen ? (
                        <Minimize className="h-4 w-4" />
                      ) : (
                        <Maximize className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">
                      {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Heatmap Content */}
          <div className="flex-1 flex justify-center items-center">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Loading metrics...
                  </p>
                </div>
              </div>
            ) : hasData ? (
              <div ref={containerRef} className="w-full h-full p-6">
                <svg
                  ref={svgRef}
                  className="w-full h-full"
                  style={{ display: "block" }}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <Alert className="max-w-md border-0 bg-background/80 backdrop-blur-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Data Available</AlertTitle>
                  <AlertDescription>
                    {!selectedQuestionnaire
                      ? "Please select a questionnaire from the dropdown to view heatmap data."
                      : "No data found for the selected filters. Please ensure interviews have been completed with responses."}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
