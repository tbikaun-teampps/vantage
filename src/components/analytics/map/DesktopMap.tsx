import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip as LeafletTooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState, useEffect, useRef, useMemo } from "react";
import "./map-dark-mode.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BRAND_COLORS } from "@/lib/brand";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconChevronDown,
  IconChevronUp,
  IconFilter,
  IconMaximize,
  IconMinimize,
} from "@tabler/icons-react";
import { LabelWithInfo } from "@/components/ui/label-with-info";
import { Loader2 } from "lucide-react";
import {
  getOverallDesktopGeographicalMap,
  getOverallGeographicalMapFilters,
} from "@/lib/api/analytics";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { LoadingSpinner } from "@/components/loader";
import { useAnalytics } from "@/contexts/AnalyticsContext";

// Define the location/site data structure
interface LocationData {
  name: string;
  lat: number;
  lng: number;
  region: string;
  businessUnit: string;
  measurements: {
    name: string;
    sum: number;
    count: number;
    average: number;
  }[];
}

// Define legend item structure
interface LegendItem {
  label: string;
  color: string;
}

const getScoreColor = (score: number): string => {
  if (score >= 2.4) return BRAND_COLORS.turquoiseBlue; // Excellent
  if (score >= 2.2) return BRAND_COLORS.malibu; // Good
  if (score >= 2.0) return BRAND_COLORS.royalBlue; // Fair
  return BRAND_COLORS.mediumPurple; // Poor
};

// Create a dynamic color assignment system
const createColorMap = (items: string[]): Record<string, string> => {
  const brandColorValues = Object.values(BRAND_COLORS);
  const colorMap: Record<string, string> = {};

  items.forEach((item, index) => {
    if (index < brandColorValues.length) {
      // Use brand colors first
      colorMap[item] = brandColorValues[index];
    } else {
      // Generate interpolated colors if we need more than available brand colors
      const baseColorIndex = index % brandColorValues.length;
      const baseColor = brandColorValues[baseColorIndex];
      // Create a slightly modified version by adjusting lightness
      const variation =
        Math.floor(
          (index - brandColorValues.length) / brandColorValues.length
        ) + 1;
      colorMap[item] = adjustColorBrightness(baseColor, variation * 0.2);
    }
  });

  return colorMap;
};

// Helper function to adjust color brightness
const adjustColorBrightness = (hex: string, factor: number): string => {
  // Remove # if present
  const color = hex.replace("#", "");

  // Parse RGB values
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Adjust brightness (factor > 0 lightens, factor < 0 darkens)
  const newR = Math.max(0, Math.min(255, Math.round(r + (255 - r) * factor)));
  const newG = Math.max(0, Math.min(255, Math.round(g + (255 - g) * factor)));
  const newB = Math.max(0, Math.min(255, Math.round(b + (255 - b) * factor)));

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

const getGroupColor = (
  location: LocationData,
  groupBy: string,
  colourBy: string,
  allData: LocationData[]
): string => {
  if (colourBy === "Business Unit") {
    const businessUnits = [
      ...new Set(allData.map((d) => d.businessUnit)),
    ].sort();
    const colorMap = createColorMap(businessUnits);
    return colorMap[location.businessUnit] || BRAND_COLORS.luckyPoint;
  }

  if (colourBy === "Region") {
    const regions = [...new Set(allData.map((d) => d.region))].sort();
    const colorMap = createColorMap(regions);
    return colorMap[location.region] || BRAND_COLORS.luckyPoint;
  }

  // Default to score-based coloring (unless no data, then grey)
  if (location.measurements.length === 0) {
    return "#9CA3AF"; // Grey color for no data when using score-based coloring
  }

  return getScoreColor(location.score);
};

const getCircleRadius = (
  location: LocationData,
  measurementType: string,
  dataType: string
): number => {
  let value: number;

  // If no measurements, return a small default size
  if (location.measurements.length === 0) {
    value = 8; // Default radius
  }

  value =
    location.measurements.find((m) => m.name === measurementType)?.average || 8;

  return Math.max(8, Math.min(value * 8, 30)); // Min 8px, max 30px
};

const getDataTypeValue = (
  location: LocationData,
  measurementType: string,
  dataType: string
): string => {
  // If no measurements, show "No Data"
  if (location.measurements.length === 0) {
    return "No Data";
  }

  return (
    location.measurements.find((m) => m.name === measurementType)?.[dataType] ||
    "N/A"
  );

  return "Coming soon!";

  // switch (dataType) {
  //   case "Average Score":
  //     return location.score.toFixed(1);
  //   case "Total Interviews":
  //     return location.interviews.toString();
  //   case "Total Actions":
  //     return location.totalActions.toString();
  //   case "Completion Rate":
  //     return (location.completionRate * 100).toFixed(1) + "%";
  //   default:
  //     return location.score.toFixed(1);
  // }
};

const LeafletMap = ({
  data,
  dataType,
  measurementType,
  groupBy,
  colourBy,
  showLabels,
}: {
  data: LocationData[];
  dataType: string;
  measurementType: string;
  groupBy: string;
  colourBy: string;
  showLabels: boolean;
}) => {
  return (
    <MapContainer
      center={[-27.4698, 133.2093]}
      zoom={5}
      className="h-full w-full"
      style={{ minHeight: "400px" }}
      maxBounds={[
        [-90, -180],
        [90, 180],
      ]}
      maxBoundsViscosity={1.0}
      worldCopyJump={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap"
        noWrap={true}
      />
      {data.map((location, index) => {
        const hasMeasurements = location.measurements.length > 0;
        return (
          <CircleMarker
            key={`${location.name}-${index}`}
            center={[location.lat, location.lng]}
            radius={getCircleRadius(location, measurementType, dataType)}
            pathOptions={{
              // color: getGroupColor(location, groupBy, colourBy, data),
              // fillColor: getGroupColor(location, groupBy, colourBy, data),
              fillOpacity: !hasMeasurements ? 0.3 : 0.8,
              weight: 2,
              dashArray: !hasMeasurements ? "5,5" : undefined,
            }}
          >
            <Popup>
              <div className="text-center text-foreground">
                <div className="font-semibold">{location.name}</div>
                {location.measurements.length === 0 ? (
                  <div className="text-muted-foreground">
                    <div>No assessment data available</div>
                    <div>Measurements: 0</div>
                  </div>
                ) : (
                  <div className="text-left">
                    {location.measurements.map((measurement) => (
                      <div
                        key={measurement.name}
                        className="flex flex-col mb-2"
                      >
                        <span className="font-semibold">
                          {measurement.name}
                        </span>
                        <span>
                          Average: {measurement.average}, Sum: {measurement.sum}
                          , Count: {measurement.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-border">
                  <div>Region: {location.region}</div>
                  <div>Business Unit: {location.businessUnit}</div>
                </div>
              </div>
            </Popup>
            {showLabels && location.measurements.length > 0 && (
              <LeafletTooltip
                permanent
                direction="top"
                offset={[0, -5]}
                className="map-label-tooltip"
              >
                <div className="text-center text-foreground">
                  <div className="text-xs font-medium truncate max-w-24">
                    {location.name}
                  </div>
                  <div
                    className={`text-xs ${!hasMeasurements ? "text-muted-foreground" : ""}`}
                  >
                    {getDataTypeValue(location, measurementType, dataType)}
                  </div>
                </div>
              </LeafletTooltip>
            )}
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
};

// const Legend = ({
//   colourBy,
//   data,
// }: {
//   colourBy: string;
//   data: LocationData[];
// }) => {
//   const getLegendItems = (): LegendItem[] => {
//     if (colourBy === "Business Unit") {
//       const businessUnits = [...new Set(data.map((d) => d.businessUnit))];
//       return businessUnits.map((bu) => ({
//         label: bu,
//         color: getGroupColor(
//           { businessUnit: bu } as LocationData,
//           "",
//           colourBy,
//           data
//         ),
//       }));
//     }

//     if (colourBy === "Region") {
//       const regions = [...new Set(data.map((d) => d.region))].sort();
//       return regions.map((region) => ({
//         label: region,
//         color: getGroupColor({ region } as LocationData, "", colourBy, data),
//       }));
//     }

//     // Default score legend
//     const scoreLegend = [
//       { label: "Excellent (2.4+)", color: getScoreColor(2.4) },
//       { label: "Good (2.2-2.4)", color: getScoreColor(2.3) },
//       { label: "Fair (2.0-2.2)", color: getScoreColor(2.1) },
//       { label: "Poor (<2.0)", color: getScoreColor(1.9) },
//     ];

//     // Add "No Data" entry if there are sites with no interviews
//     const hasNoDataSites = data.some((d) => d.interviews === 0);
//     if (hasNoDataSites) {
//       scoreLegend.push({
//         label: "No Data (dashed border)",
//         color:
//           colourBy === "Business Unit" || colourBy === "Region"
//             ? "#9CA3AF"
//             : "#9CA3AF",
//       });
//     }

//     return scoreLegend;
//   };

//   const legendItems = getLegendItems();

//   return (
//     <div className="bg-background/90 backdrop-blur-sm border rounded-lg p-4 shadow-sm">
//       <h3 className="font-semibold text-sm mb-3 text-foreground">
//         {colourBy === "Business Unit" || colourBy === "Region"
//           ? `${colourBy} Legend`
//           : "Score Legend"}
//       </h3>
//       <div className="space-y-2">
//         {legendItems.map((item, index) => (
//           <div
//             key={`${item.label}-${index}`}
//             className="flex items-center gap-2"
//           >
//             <div
//               className="w-4 h-4 rounded-full border border-border"
//               style={{ backgroundColor: item.color }}
//             ></div>
//             <span className="text-sm text-foreground">{item.label}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// const FilterPanel = ({
//   selectedQuestionnaireId,
//   setSelectedQuestionnaireId,
//   selectedAssessmentId,
//   setSelectedAssessmentId,
//   questionnaires,
//   assessments,
//   filtersLoading,
//   dataType,
//   setDataType,
//   groupBy,
//   setGroupBy,
//   colourBy,
//   setColourBy,
//   showNoDataSites,
//   setShowNoDataSites,
//   showLabels,
//   setShowLabels,
//   mapData,
//   mapContainerRef,
//   isFullscreen,
// }: {
//   selectedQuestionnaireId: string;
//   setSelectedQuestionnaireId: (value: string) => void;
//   selectedAssessmentId: string;
//   setSelectedAssessmentId: (value: string) => void;
//   questionnaires: { id: number; name: string; assessmentIds: number[] }[];
//   assessments: { id: number; name: string; questionnaireId: number | null }[];
//   filtersLoading: boolean;
//   dataType: string;
//   setDataType: (value: string) => void;
//   groupBy: string;
//   setGroupBy: (value: string) => void;
//   colourBy: string;
//   setColourBy: (value: string) => void;
//   showNoDataSites: boolean;
//   setShowNoDataSites: (value: boolean) => void;
//   showLabels: boolean;
//   setShowLabels: (value: boolean) => void;
//   mapData: LocationData[];
//   mapContainerRef: React.RefObject<HTMLDivElement>;
//   isFullscreen: boolean;
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   // Filter assessments based on selected questionnaire
//   const filteredAssessments = useMemo(() => {
//     if (!selectedQuestionnaireId) return assessments;
//     return assessments.filter(
//       (a) => a.questionnaireId === parseInt(selectedQuestionnaireId)
//     );
//   }, [assessments, selectedQuestionnaireId]);

//   // Check if fullscreen is supported
//   const supportsFullscreen =
//     typeof document !== "undefined" &&
//     (document.fullscreenEnabled ||
//       (document as any).webkitFullscreenEnabled ||
//       (document as any).mozFullScreenEnabled);

//   // Handle fullscreen toggle
//   const toggleFullscreen = async () => {
//     try {
//       if (!mapContainerRef.current) return;

//       if (!document.fullscreenElement) {
//         // Enter fullscreen
//         const element = mapContainerRef.current;
//         if (element.requestFullscreen) {
//           await element.requestFullscreen();
//         } else if ((element as any).webkitRequestFullscreen) {
//           await (element as any).webkitRequestFullscreen();
//         } else if ((element as any).mozRequestFullScreen) {
//           await (element as any).mozRequestFullScreen();
//         }
//       } else {
//         // Exit fullscreen
//         if (document.exitFullscreen) {
//           await document.exitFullscreen();
//         } else if ((document as any).webkitExitFullscreen) {
//           await (document as any).webkitExitFullscreen();
//         } else if ((document as any).mozCancelFullScreen) {
//           await (document as any).mozCancelFullScreen();
//         }
//       }
//     } catch (error) {
//       console.error("Error toggling fullscreen:", error);
//     }
//   };

//   return (
//     <div className="bg-background/90 backdrop-blur-sm border rounded-lg shadow-sm">
//       {/* Header */}
//       <div className="p-3 border-b">
//         <div className="flex items-center justify-between mb-2">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setIsExpanded(!isExpanded)}
//             className="flex-1 justify-between h-auto p-0"
//           >
//             <div className="flex items-center gap-2">
//               <IconFilter className="h-4 w-4" />
//               <span className="font-semibold text-sm">Filters</span>
//             </div>
//             {isExpanded ? (
//               <IconChevronUp className="h-4 w-4" />
//             ) : (
//               <IconChevronDown className="h-4 w-4" />
//             )}
//           </Button>

//           {/* Fullscreen Toggle */}
//           {supportsFullscreen && (
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={toggleFullscreen}
//               className="ml-2 p-1 h-auto"
//               title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
//               data-tour="analytics-map-fullscreen"
//             >
//               {isFullscreen ? (
//                 <IconMinimize className="h-4 w-4" />
//               ) : (
//                 <IconMaximize className="h-4 w-4" />
//               )}
//             </Button>
//           )}
//         </div>

//         {/* Data Summary - Always visible */}
//         <div className="flex flex-wrap gap-1">
//           <Badge variant="secondary" className="text-xs">
//             {
//               mapData.filter((site) => showNoDataSites || site.interviews > 0)
//                 .length
//             }{" "}
//             sites
//           </Badge>
//           <Badge variant="outline" className="text-xs">
//             {dataType}
//           </Badge>
//           {!showNoDataSites &&
//             mapData.some((site) => site.interviews === 0) && (
//               <Badge
//                 variant="outline"
//                 className="text-xs text-muted-foreground"
//               >
//                 {mapData.filter((site) => site.interviews === 0).length} hidden
//               </Badge>
//             )}
//         </div>
//       </div>

//       {/* Expandable Filter Content */}
//       {isExpanded && (
//         <div className="p-3 space-y-3 w-64">
//           <div className="space-y-2">
//             <LabelWithInfo
//               label="Questionnaire"
//               tooltip="Select which questionnaire to analyze on the map visualization."
//               isFullscreen={isFullscreen}
//               container={mapContainerRef.current}
//             />
//             <Select
//               value={selectedQuestionnaireId}
//               onValueChange={(value) => {
//                 setSelectedQuestionnaireId(value);
//                 // Reset assessment selection when questionnaire changes
//                 setSelectedAssessmentId("all");
//               }}
//               disabled={filtersLoading}
//             >
//               <SelectTrigger className="w-full h-8 text-xs">
//                 {filtersLoading ? (
//                   <div className="flex items-center gap-2">
//                     <Loader2 className="h-3 w-3 animate-spin" />
//                     <span>Loading...</span>
//                   </div>
//                 ) : (
//                   <SelectValue placeholder="Select questionnaire" />
//                 )}
//               </SelectTrigger>
//               <SelectContent
//                 container={
//                   isFullscreen
//                     ? mapContainerRef.current || undefined
//                     : undefined
//                 }
//                 className={isFullscreen ? "z-[99999] !important" : ""}
//               >
//                 {questionnaires.map((q) => (
//                   <SelectItem key={q.id} value={q.id.toString()}>
//                     {q.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <LabelWithInfo
//               label="Assessment"
//               tooltip="Select a specific assessment to analyze or choose 'All Assessments' for aggregated data."
//               isFullscreen={isFullscreen}
//               container={mapContainerRef.current}
//             />
//             <Select
//               value={selectedAssessmentId}
//               onValueChange={setSelectedAssessmentId}
//               disabled={filtersLoading || !selectedQuestionnaireId}
//             >
//               <SelectTrigger className="w-full h-8 text-xs">
//                 {filtersLoading ? (
//                   <div className="flex items-center gap-2">
//                     <Loader2 className="h-3 w-3 animate-spin" />
//                     <span>Loading...</span>
//                   </div>
//                 ) : (
//                   <SelectValue placeholder="Select assessment" />
//                 )}
//               </SelectTrigger>
//               <SelectContent
//                 container={
//                   isFullscreen
//                     ? mapContainerRef.current || undefined
//                     : undefined
//                 }
//                 className={isFullscreen ? "z-[99999] !important" : ""}
//               >
//                 <SelectItem value="all">All Assessments</SelectItem>
//                 {filteredAssessments.map((assessment) => (
//                   <SelectItem
//                     key={assessment.id}
//                     value={assessment.id.toString()}
//                   >
//                     {assessment.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="space-y-2">
//             <LabelWithInfo
//               label="Data Metric"
//               tooltip="Choose what data metric to visualize: Average Score (performance ratings), Total Interviews (count), Total Actions (action items count), or Completion Rate (percentage completed)."
//               isFullscreen={isFullscreen}
//               container={mapContainerRef.current}
//             />
//             <Select value={dataType} onValueChange={setDataType}>
//               <SelectTrigger className="w-full h-8 text-xs">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent
//                 container={
//                   isFullscreen
//                     ? mapContainerRef.current || undefined
//                     : undefined
//                 }
//                 className={isFullscreen ? "z-[99999] !important" : ""}
//               >
//                 <SelectItem value="Average Score">Average Score</SelectItem>
//                 <SelectItem value="Total Interviews">
//                   Total Interviews
//                 </SelectItem>
//                 <SelectItem value="Total Actions">Total Actions</SelectItem>
//                 <SelectItem value="Completion Rate">Completion Rate</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="space-y-2">
//             <LabelWithInfo
//               label="Colour By"
//               tooltip="Choose what determines the marker colors: Business Unit (organisational)"
//               isFullscreen={isFullscreen}
//               container={mapContainerRef.current}
//             />
//             <Select value={colourBy} onValueChange={setColourBy}>
//               <SelectTrigger className="w-full h-8 text-xs">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent
//                 container={
//                   isFullscreen
//                     ? mapContainerRef.current || undefined
//                     : undefined
//                 }
//                 className={isFullscreen ? "z-[99999] !important" : ""}
//               >
//                 <SelectItem value="Region">Region</SelectItem>
//                 <SelectItem value="Business Unit">Business Unit</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Show No Data Sites Toggle */}
//           <div className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               id="showNoDataSites"
//               checked={showNoDataSites}
//               onChange={(e) => setShowNoDataSites(e.target.checked)}
//               className="rounded border-border"
//             />
//             <label
//               htmlFor="showNoDataSites"
//               className="text-sm text-foreground cursor-pointer"
//             >
//               Show sites with no data
//             </label>
//           </div>

//           {/* Show Labels Toggle */}
//           <div className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               id="showLabels"
//               checked={showLabels}
//               onChange={(e) => setShowLabels(e.target.checked)}
//               className="rounded border-border"
//             />
//             <label
//               htmlFor="showLabels"
//               className="text-sm text-foreground cursor-pointer"
//             >
//               Show site labels
//             </label>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

export function DesktopMap() {
  const { assessmentType } = useAnalytics();
  const companyId = useCompanyFromUrl();
  const [dataType, setDataType] = useState<string>();
  const [measurementType, setMeasurementType] = useState<string>();

  const [groupBy, setGroupBy] = useState<string>("Site");
  const [colourBy, setColourBy] = useState<string>("Region");
  const [showNoDataSites, setShowNoDataSites] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<LocationData[] | null>(null);
  const [filters, setFilters] = useState<{
    questionnaires: { id: number; name: string; assessmentIds: number[] }[];
    assessments: { id: number; name: string; questionnaireId: number | null }[];
  }>({ questionnaires: [], assessments: [] });
  const [selectedAssessmentId, setSelectedAssessmentId] =
    useState<string>("all");
  const [filtersLoading, setFiltersLoading] = useState<boolean>(true);

  // Compute filtered map data based on showNoDataSites
  const filteredMapData = useMemo(() => {
    if (!data) return [];
    return showNoDataSites
      ? data
      : data.filter((site) => site.measurements.length > 0);
  }, [data, showNoDataSites]);

  useEffect(() => {
    const fetchFilters = async () => {
      if (!companyId || !assessmentType) return;
      try {
        setFiltersLoading(true);
        const data = await getOverallGeographicalMapFilters(
          companyId,
          assessmentType
        );
        setFilters(data.options);
        console.log("data", data);
        // Take the first measurement as the measurementType default
        setMeasurementType(data?.options?.measurements?.[0]?.name);
        // Take first aggregation method as default too
        setDataType(data?.options?.aggregationMethods?.[0] || "average");
      } catch (err) {
        console.error("Error fetching filters:", err);
        setError("Failed to load filter options.");
      } finally {
        setFiltersLoading(false);
      }
    };

    fetchFilters();
  }, [companyId, assessmentType]);

  useEffect(() => {
    const fetchMapData = async () => {
      if (!companyId) return;

      try {
        setLoading(true);
        setError(null);
        const assessmentIdParam =
          selectedAssessmentId !== "all"
            ? parseInt(selectedAssessmentId)
            : undefined;
        const response = await getOverallDesktopGeographicalMap(
          companyId,
          assessmentIdParam
        );
        setData(response);
      } catch (err) {
        console.error("Error fetching map data:", err);
        setError("Failed to load map data.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [companyId, selectedAssessmentId, assessmentType]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isInFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isInFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  if (loading || filtersLoading) {
    return (
      <div className="h-full flex items-center justify-center pb-6">
        <LoadingSpinner message="Loading map data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center pb-6">
        <div className="text-center">
          <div className="text-destructive text-lg font-semibold">
            Error Loading Data
          </div>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // if (!data || data.length === 0) {
  //   return (
  //     <div className="h-full flex items-center justify-center pb-6">
  //       <div className="text-center">
  //         <div className="text-destructive text-lg font-semibold">
  //           No Data Available
  //         </div>
  //         <p className="mt-2 text-muted-foreground">
  //           No geographical map data available for the selected filters.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="h-full flex flex-col pb-6">
      {/* Full-screen Map Container */}
      <Card
        ref={mapContainerRef}
        className="flex-1 relative z-0 p-0 overflow-hidden shadow-none border-none rounded-none"
      >
        <div className="h-full w-full">
          <LeafletMap
            data={filteredMapData}
            dataType={dataType!}
            measurementType={measurementType!}
            groupBy={groupBy}
            colourBy={colourBy}
            showLabels={showLabels}
          />
        </div>

        {/* Floating Controls and Info */}
        {/* <div
          className="absolute top-4 right-4 z-[1000] space-y-4"
          data-tour="analytics-map-controls"
        >
          <FilterPanel
            selectedQuestionnaireId={selectedQuestionnaireId}
            setSelectedQuestionnaireId={setSelectedQuestionnaireId}
            selectedAssessmentId={selectedAssessmentId}
            setSelectedAssessmentId={setSelectedAssessmentId}
            questionnaires={filters.questionnaires}
            assessments={filters.assessments}
            filtersLoading={filtersLoading}
            dataType={dataType}
            setDataType={setDataType}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            colourBy={colourBy}
            setColourBy={setColourBy}
            showNoDataSites={showNoDataSites}
            setShowNoDataSites={setShowNoDataSites}
            showLabels={showLabels}
            setShowLabels={setShowLabels}
            mapData={data || []}
            mapContainerRef={mapContainerRef}
            isFullscreen={isFullscreen}
          />
          <Legend colourBy={colourBy} data={filteredMapData} />
        </div> */}
      </Card>
    </div>
  );
}
