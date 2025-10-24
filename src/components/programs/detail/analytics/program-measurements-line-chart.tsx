import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getProgramMeasurementHeatmap } from "@/lib/api/analytics";

interface ProgramMeasurementsLineChartProps {
  programId: number;
}

interface HeatmapDataPoint {
  measurement: string;
  phaseTransition: string;
  difference: number;
  percentChange: number;
  fromValue: number;
  toValue: number;
  fromPhase: string;
  toPhase: string;
}

export function ProgramMeasurementsLineChart({
  programId,
}: ProgramMeasurementsLineChartProps) {
  const [selectedMeasurement, setSelectedMeasurement] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [heatmapData, setHeatmapData] = useState<{
    data: HeatmapDataPoint[];
    measurements: string[];
    transitions: string[];
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProgramMeasurementHeatmap(
          programId.toString()
        );
        setHeatmapData(response);
      } catch (error) {
        console.error("Error fetching measurement heatmap data:", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [programId]);

  // Get available measurements for the selector
  const availableMeasurements = heatmapData?.measurements || [];

  // Filter heatmap data based on selected measurement
  const filteredHeatmapData =
    selectedMeasurement === "all"
      ? heatmapData?.data || []
      : (heatmapData?.data || []).filter(
          (d) => d.measurement === selectedMeasurement
        );

  // D3 Heatmap rendering
  useEffect(() => {
    if (!svgRef.current || filteredHeatmapData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const containerRect = containerRef.current?.getBoundingClientRect();
    const containerWidth = containerRect ? containerRect.width - 48 : 800;
    const containerHeight = containerRect ? containerRect.height - 48 : 400;

    const margin = { top: 60, right: 0, bottom: 80, left: 240 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    svg.attr("width", containerWidth).attr("height", containerHeight);

    // Get unique transitions and measurements for axes
    const transitions = [
      ...new Set(filteredHeatmapData.map((d) => d.phaseTransition)),
    ];
    const measurements = [
      ...new Set(filteredHeatmapData.map((d) => d.measurement)),
    ];

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(transitions)
      .range([0, width])
      .padding(0.1);

    const yScale = d3
      .scaleBand()
      .domain(measurements)
      .range([0, height])
      .padding(0.1);

    // Color scale - diverging based on percentage change
    const maxPercentChange =
      d3.max(filteredHeatmapData, (d) => Math.abs(d.percentChange)) || 100;
    const colorScale = d3
      .scaleDiverging(d3.interpolateRdYlGn)
      .domain([-maxPercentChange, 0, maxPercentChange]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create heatmap cells
    const cells = g
      .selectAll(".cell")
      .data(filteredHeatmapData)
      .enter()
      .append("g")
      .attr("class", "cell");

    // Add rectangles
    cells
      .append("rect")
      .attr("x", (d) => xScale(d.phaseTransition) || 0)
      .attr("y", (d) => yScale(d.measurement) || 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(d.percentChange))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("rx", 4)
      .style("cursor", "pointer");

    // Add difference values
    cells
      .append("text")
      .attr(
        "x",
        (d) => (xScale(d.phaseTransition) || 0) + xScale.bandwidth() / 2
      )
      .attr(
        "y",
        (d) => (yScale(d.measurement) || 0) + yScale.bandwidth() / 2 - 5
      )
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("pointer-events", "none")
      .text((d) =>
        d.difference > 0
          ? `+${d.difference.toFixed(1)}`
          : d.difference.toFixed(1)
      )
      .attr("fill", (d) =>
        Math.abs(d.percentChange) > 10 ? "white" : "black"
      );

    // Add percentage change
    cells
      .append("text")
      .attr(
        "x",
        (d) => (xScale(d.phaseTransition) || 0) + xScale.bandwidth() / 2
      )
      .attr(
        "y",
        (d) => (yScale(d.measurement) || 0) + yScale.bandwidth() / 2 + 12
      )
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-weight", "400")
      .style("opacity", "0.8")
      .style("pointer-events", "none")
      .text(
        (d) =>
          `(${d.percentChange > 0 ? "+" : ""}${d.percentChange.toFixed(1)}%)`
      )
      .attr("fill", (d) => (Math.abs(d.percentChange) > 10 ? "white" : "#666"));

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "12px")
      .style("text-anchor", "middle");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "12px");

    // Add tooltips
    cells
      .on("mouseover", function (event, d) {
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "heatmap-tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0,0,0,0.9)")
          .style("color", "white")
          .style("padding", "10px")
          .style("border-radius", "4px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", "1000");

        tooltip
          .html(
            `
        <strong>${d.measurement}: ${d.phaseTransition}</strong><br/>
        From: ${d.fromValue.toFixed(1)}<br/>
        To: ${d.toValue.toFixed(1)}<br/>
        Change: ${d.difference > 0 ? "+" : ""}${d.difference.toFixed(1)}<br/>
        Percent: ${d.percentChange > 0 ? "+" : ""}${d.percentChange.toFixed(1)}%
      `
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");

        d3.select(this)
          .select("rect")
          .attr("stroke", "#333")
          .attr("stroke-width", 3);
      })
      .on("mouseout", function () {
        d3.selectAll(".heatmap-tooltip").remove();
        d3.select(this)
          .select("rect")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);
      });

    return () => {
      d3.selectAll(".heatmap-tooltip").remove();
    };
  }, [filteredHeatmapData]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading measurement heatmap...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-none border-none">
        <CardContent className="flex items-center justify-center h-[200px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load measurement data: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Check for empty data
  if (!heatmapData || !heatmapData.data || heatmapData.data.length === 0) {
    return (
      <Card className="shadow-none border-none">
        <CardContent className="flex items-center justify-center h-[200px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Measurements Data</AlertTitle>
            <AlertDescription>
              No calculated measurements found for this program. At least 2
              assessments are needed to show measurement changes over time.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={cardRef} className="shadow-none border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Program Desktop Analysis Measurements Heatmap
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Visualise metric changes between program assessments
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {availableMeasurements.length} Measurement
              {availableMeasurements.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Measurement:</label>
          <Select
            value={selectedMeasurement}
            onValueChange={setSelectedMeasurement}
          >
            <SelectTrigger className="w-[200px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Measurements</SelectItem>
              {availableMeasurements.map((measurement) => (
                <SelectItem key={measurement} value={measurement}>
                  {measurement}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pt-0 h-full">
        <div ref={containerRef} className="w-full h-[500px]">
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ display: "block" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
