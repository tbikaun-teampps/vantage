// import { useState, useEffect, useMemo, useRef } from "react";
// import * as d3 from "d3";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { AlertCircle, Loader2, TrendingUp } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { useProgramById } from "@/hooks/useProgram";
// import { metricsService } from "@/lib/supabase/metrics-service";
// import type { CalculatedMetricWithDefinition } from "@/lib/supabase/metrics-service";

// interface ProgramMetricsLineChartProps {
//   programId: number;
// }

// interface HeatmapDataPoint {
//   metric: string;
//   phaseTransition: string;
//   difference: number;
//   percentChange: number;
//   fromValue: number;
//   toValue: number;
//   fromPhase: string;
//   toPhase: string;
// }

// export function ProgramMetricsLineChart({
//   programId,
// }: ProgramMetricsLineChartProps) {
//   const [selectedMetric, setSelectedMetric] = useState<string>("all");
//   const [metricsData, setMetricsData] = useState<
//     Record<number, CalculatedMetricWithDefinition[]>
//   >({});
//   const [metricsLoading, setMetricsLoading] = useState(false);
//   const [metricsError, setMetricsError] = useState<Error | null>(null);

//   const svgRef = useRef<SVGSVGElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const cardRef = useRef<HTMLDivElement>(null);

//   // Fetch program data including phases
//   const {
//     data: program,
//     isLoading: programLoading,
//     error: programError,
//   } = useProgramById(programId);

//   // Get all phases for this program
//   const phases = program?.phases || [];

//   // Fetch calculated metrics for all phases directly from Supabase
//   useEffect(() => {
//     if (!program || phases.length === 0) return;

//     const fetchMetricsForAllPhases = async () => {
//       setMetricsLoading(true);
//       setMetricsError(null);

//       try {
//         const metricsMap: Record<number, CalculatedMetricWithDefinition[]> = {};

//         // Fetch metrics for each phase
//         await Promise.all(
//           phases.map(async (phase) => {
//             const metrics = await metricsService.getCalculatedMetrics(
//               phase.id,
//               program.company_id
//             );
//             metricsMap[phase.id] = metrics;
//           })
//         );

//         setMetricsData(metricsMap);
//       } catch (error) {
//         console.error("Failed to fetch metrics data:", error);
//         setMetricsError(
//           error instanceof Error ? error : new Error("Failed to fetch metrics")
//         );
//       } finally {
//         setMetricsLoading(false);
//       }
//     };

//     fetchMetricsForAllPhases();
//   }, [program, phases]);

//   // Transform data for heatmap showing differences between phases
//   const heatmapData = useMemo(() => {
//     if (
//       !program ||
//       phases.length < 2 ||
//       Object.keys(metricsData).length === 0
//     ) {
//       return { data: [], metrics: [], transitions: [] };
//     }

//     const sortedPhases = phases.sort(
//       (a, b) => a.sequence_number - b.sequence_number
//     );

//     // Get all unique metric names across all phases
//     const allMetrics = new Set<string>();
//     Object.values(metricsData).forEach((phaseMetrics) => {
//       phaseMetrics.forEach((metric) => {
//         if (metric.metric_definition?.name) {
//           allMetrics.add(metric.metric_definition.name);
//         }
//       });
//     });

//     const metrics = Array.from(allMetrics).sort();
//     const transitions: string[] = [];
//     const data: HeatmapDataPoint[] = [];

//     // Create phase transitions and calculate differences
//     for (let i = 0; i < sortedPhases.length - 1; i++) {
//       const currentPhase = sortedPhases[i];
//       const nextPhase = sortedPhases[i + 1];
//       const transition = `${currentPhase.name || `Phase ${currentPhase.sequence_number}`}→${nextPhase.name || `Phase ${nextPhase.sequence_number}`}`;
//       transitions.push(transition);

//       const currentMetrics = metricsData[currentPhase.id] || [];
//       const nextMetrics = metricsData[nextPhase.id] || [];

//       metrics.forEach((metricName) => {
//         const currentMetric = currentMetrics.find(
//           (m) => m.metric_definition?.name === metricName
//         );
//         const nextMetric = nextMetrics.find(
//           (m) => m.metric_definition?.name === metricName
//         );

//         const currentValue = currentMetric?.calculated_value || 0;
//         const nextValue = nextMetric?.calculated_value || 0;
//         const difference = nextValue - currentValue;
//         const percentChange =
//           currentValue !== 0 ? (difference / currentValue) * 100 : 0;

//         data.push({
//           metric: metricName,
//           phaseTransition: transition,
//           difference,
//           percentChange,
//           fromValue: currentValue,
//           toValue: nextValue,
//           fromPhase:
//             currentPhase.name || `Phase ${currentPhase.sequence_number}`,
//           toPhase: nextPhase.name || `Phase ${nextPhase.sequence_number}`,
//         });
//       });
//     }

//     return { data, metrics, transitions };
//   }, [program, phases, metricsData]);

//   // Get available metrics for the selector
//   const availableMetrics = heatmapData.metrics;

//   // Filter heatmap data based on selected metrics
//   const filteredHeatmapData = useMemo(() => {
//     if (selectedMetric === "all") {
//       return heatmapData.data;
//     }
//     return heatmapData.data.filter((d) => d.metric === selectedMetric);
//   }, [heatmapData.data, selectedMetric]);

//   // D3 Heatmap rendering
//   useEffect(() => {
//     if (!svgRef.current || filteredHeatmapData.length === 0) return;

//     const svg = d3.select(svgRef.current);
//     svg.selectAll("*").remove();

//     const containerRect = containerRef.current?.getBoundingClientRect();
//     const containerWidth = containerRect ? containerRect.width - 48 : 800;
//     const containerHeight = containerRect ? containerRect.height - 48 : 400;

//     const margin = { top: 60, right: 0, bottom: 80, left: 240 };
//     const width = containerWidth - margin.left - margin.right;
//     const height = containerHeight - margin.top - margin.bottom;

//     svg.attr("width", containerWidth).attr("height", containerHeight);

//     // Get unique transitions and metrics for axes
//     const transitions = [
//       ...new Set(filteredHeatmapData.map((d) => d.phaseTransition)),
//     ];
//     const metrics = [...new Set(filteredHeatmapData.map((d) => d.metric))];

//     // Create scales
//     const xScale = d3
//       .scaleBand()
//       .domain(transitions)
//       .range([0, width])
//       .padding(0.1);

//     const yScale = d3
//       .scaleBand()
//       .domain(metrics)
//       .range([0, height])
//       .padding(0.1);

//     // Color scale - diverging based on percentage change
//     const maxPercentChange =
//       d3.max(filteredHeatmapData, (d) => Math.abs(d.percentChange)) || 100;
//     const colorScale = d3
//       .scaleDiverging(d3.interpolateRdYlGn)
//       .domain([-maxPercentChange, 0, maxPercentChange]);

//     const g = svg
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     // Create heatmap cells
//     const cells = g
//       .selectAll(".cell")
//       .data(filteredHeatmapData)
//       .enter()
//       .append("g")
//       .attr("class", "cell");

//     // Add rectangles
//     cells
//       .append("rect")
//       .attr("x", (d) => xScale(d.phaseTransition) || 0)
//       .attr("y", (d) => yScale(d.metric) || 0)
//       .attr("width", xScale.bandwidth())
//       .attr("height", yScale.bandwidth())
//       .attr("fill", (d) => colorScale(d.percentChange))
//       .attr("stroke", "#fff")
//       .attr("stroke-width", 2)
//       .attr("rx", 4)
//       .style("cursor", "pointer");

//     // Add difference values
//     cells
//       .append("text")
//       .attr(
//         "x",
//         (d) => (xScale(d.phaseTransition) || 0) + xScale.bandwidth() / 2
//       )
//       .attr("y", (d) => (yScale(d.metric) || 0) + yScale.bandwidth() / 2 - 5)
//       .attr("text-anchor", "middle")
//       .attr("dominant-baseline", "central")
//       .style("font-size", "14px")
//       .style("font-weight", "600")
//       .style("pointer-events", "none")
//       .text((d) =>
//         d.difference > 0
//           ? `+${d.difference.toFixed(1)}`
//           : d.difference.toFixed(1)
//       )
//       .attr("fill", (d) =>
//         Math.abs(d.percentChange) > 10 ? "white" : "black"
//       );

//     // Add percentage change
//     cells
//       .append("text")
//       .attr(
//         "x",
//         (d) => (xScale(d.phaseTransition) || 0) + xScale.bandwidth() / 2
//       )
//       .attr("y", (d) => (yScale(d.metric) || 0) + yScale.bandwidth() / 2 + 12)
//       .attr("text-anchor", "middle")
//       .style("font-size", "11px")
//       .style("font-weight", "400")
//       .style("opacity", "0.8")
//       .style("pointer-events", "none")
//       .text(
//         (d) =>
//           `(${d.percentChange > 0 ? "+" : ""}${d.percentChange.toFixed(1)}%)`
//       )
//       .attr("fill", (d) => (Math.abs(d.percentChange) > 10 ? "white" : "#666"));

//     // Add axes
//     g.append("g")
//       .attr("transform", `translate(0,${height})`)
//       .call(d3.axisBottom(xScale))
//       .selectAll("text")
//       .style("font-size", "12px")
//       .style("text-anchor", "middle");

//     g.append("g")
//       .call(d3.axisLeft(yScale))
//       .selectAll("text")
//       .style("font-size", "12px");

//     // Add tooltips
//     cells
//       .on("mouseover", function (event, d) {
//         const tooltip = d3
//           .select("body")
//           .append("div")
//           .attr("class", "heatmap-tooltip")
//           .style("position", "absolute")
//           .style("background", "rgba(0,0,0,0.9)")
//           .style("color", "white")
//           .style("padding", "10px")
//           .style("border-radius", "4px")
//           .style("font-size", "12px")
//           .style("pointer-events", "none")
//           .style("z-index", "1000");

//         tooltip
//           .html(
//             `
//         <strong>${d.metric}: ${d.phaseTransition}</strong><br/>
//         From: ${d.fromValue.toFixed(1)}<br/>
//         To: ${d.toValue.toFixed(1)}<br/>
//         Change: ${d.difference > 0 ? "+" : ""}${d.difference.toFixed(1)}<br/>
//         Percent: ${d.percentChange > 0 ? "+" : ""}${d.percentChange.toFixed(1)}%
//       `
//           )
//           .style("left", event.pageX + 10 + "px")
//           .style("top", event.pageY - 10 + "px");

//         d3.select(this)
//           .select("rect")
//           .attr("stroke", "#333")
//           .attr("stroke-width", 3);
//       })
//       .on("mouseout", function () {
//         d3.selectAll(".heatmap-tooltip").remove();
//         d3.select(this)
//           .select("rect")
//           .attr("stroke", "#fff")
//           .attr("stroke-width", 2);
//       });

//     return () => {
//       d3.selectAll(".heatmap-tooltip").remove();
//     };
//   }, [filteredHeatmapData]);

//   if (programLoading) {
//     return (
//       <Card>
//         <CardContent className="flex items-center justify-center h-[200px]">
//           <div className="flex flex-col items-center gap-2">
//             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//             <p className="text-sm text-muted-foreground">
//               Loading program data...
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (programError) {
//     return (
//       <Card>
//         <CardContent className="flex items-center justify-center h-[200px]">
//           <Alert variant="destructive" className="max-w-md">
//             <AlertCircle className="h-4 w-4" />
//             <AlertTitle>Error</AlertTitle>
//             <AlertDescription>
//               Failed to load program data: {programError.message}
//             </AlertDescription>
//           </Alert>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (metricsLoading) {
//     return (
//       <Card>
//         <CardContent className="flex items-center justify-center h-[200px]">
//           <div className="flex flex-col items-center gap-2">
//             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//             <p className="text-sm text-muted-foreground">
//               Loading metrics data...
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (metricsError) {
//     return (
//       <Card>
//         <CardContent className="flex items-center justify-center h-[200px]">
//           <Alert variant="destructive" className="max-w-md">
//             <AlertCircle className="h-4 w-4" />
//             <AlertTitle>Error</AlertTitle>
//             <AlertDescription>
//               Failed to load metrics data: {metricsError.message}
//             </AlertDescription>
//           </Alert>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (phases.length < 2) {
//     return (
//       <Card>
//         <CardContent className="flex items-center justify-center h-[200px]">
//           <Alert className="max-w-md">
//             <AlertCircle className="h-4 w-4" />
//             <AlertTitle>Insufficient Assessments</AlertTitle>
//             <AlertDescription>
//               At least 2 assessments are needed to show metric changes over
//               time. Create more assessments to see trend data.
//             </AlertDescription>
//           </Alert>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (availableMetrics.length === 0) {
//     return (
//       <Card>
//         <CardContent className="flex items-center justify-center h-[200px]">
//           <Alert className="max-w-md">
//             <AlertCircle className="h-4 w-4" />
//             <AlertTitle>No Metrics Data</AlertTitle>
//             <AlertDescription>
//               No calculated metrics found for this program's assessments.
//               Complete interviews and calculations to see trend data.
//             </AlertDescription>
//           </Alert>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card ref={cardRef}>
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle className="flex items-center gap-2">
//               <TrendingUp className="h-5 w-5" />
//               Program Desktop Analysis Measurements Heatmap
//             </CardTitle>
//             <p className="text-sm text-muted-foreground mt-1">
//               Visualise metric changes between program assessments
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//             <Badge variant="outline" className="text-xs">
//               {availableMetrics.length} Metric
//               {availableMetrics.length !== 1 ? "s" : ""}
//             </Badge>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <label className="text-sm font-medium">Metric:</label>
//           <Select value={selectedMetric} onValueChange={setSelectedMetric}>
//             <SelectTrigger className="w-[200px] h-8">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Metrics</SelectItem>
//               {availableMetrics.map((metric) => (
//                 <SelectItem key={metric} value={metric}>
//                   {metric}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </CardHeader>

//       <CardContent className="pt-0 h-full">
//         <div ref={containerRef} className="w-full h-[500px]">
//           <svg
//             ref={svgRef}
//             className="w-full h-full"
//             style={{ display: "block" }}
//           />
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
