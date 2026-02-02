import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getProgramInterviewHeatmap } from "@/lib/api/analytics";
import { Badge } from "@/components/ui/badge";
import type { GetProgramInterviewHeatmapResponseData } from "@/types/api/analytics";

interface InterviewScoreChangesProps {
  programId: number;
  type: "presite" | "onsite";
}

function InterviewScoreChanges({
  programId,
  type,
}: InterviewScoreChangesProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [heatmapData, setHeatmapData] =
    useState<GetProgramInterviewHeatmapResponseData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProgramInterviewHeatmap(
          programId.toString(),
          { questionnaireType: type }
        );
        setHeatmapData(response);
      } catch (error) {
        console.error("Error fetching interview heatmap data:", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [programId, type]);

  // D3 Heatmap rendering
  useEffect(() => {
    if (
      !svgRef.current ||
      !heatmapData ||
      !heatmapData.data ||
      heatmapData.data.length === 0
    )
      return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const containerRect = containerRef.current?.getBoundingClientRect();
    const containerWidth = containerRect ? containerRect.width - 48 : 800;
    const containerHeight = containerRect ? containerRect.height - 48 : 400;

    const margin = { top: 60, right: 0, bottom: 80, left: 200 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    svg.attr("width", containerWidth).attr("height", containerHeight);

    // Get unique transitions and sections for axes
    const transitions = heatmapData.transitions;
    const sections = heatmapData.sections;

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(transitions)
      .range([0, width])
      .padding(0.1);

    const yScale = d3
      .scaleBand()
      .domain(sections)
      .range([0, height])
      .padding(0.1);

    // Color scale - diverging based on percentage change
    const maxPercentChange =
      d3.max(heatmapData.data, (d) => Math.abs(d.percentChange)) || 100;
    const colorScale = d3
      .scaleDiverging(d3.interpolateRdYlGn)
      .domain([-maxPercentChange, 0, maxPercentChange]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create heatmap cells
    const cells = g
      .selectAll(".cell")
      .data(heatmapData.data)
      .enter()
      .append("g")
      .attr("class", "cell");

    // Add rectangles
    cells
      .append("rect")
      .attr("x", (d) => xScale(d.phaseTransition) || 0)
      .attr("y", (d) => yScale(d.section) || 0)
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
      .attr("y", (d) => (yScale(d.section) || 0) + yScale.bandwidth() / 2 - 5)
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
      .attr("y", (d) => (yScale(d.section) || 0) + yScale.bandwidth() / 2 + 12)
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
        <strong>${d.section}: ${d.phaseTransition}</strong><br/>
        From: ${d.fromValue.toFixed(2)}<br/>
        To: ${d.toValue.toFixed(2)}<br/>
        Change: ${d.difference > 0 ? "+" : ""}${d.difference.toFixed(2)}<br/>
        Percent: ${d.percentChange > 0 ? "+" : ""}${d.percentChange.toFixed(1)}%<br/>
        Response Change: ${d.responseCountChange > 0 ? "+" : ""}${d.responseCountChange}<br/>
        Interview Change: ${d.interviewCountChange > 0 ? "+" : ""}${d.interviewCountChange}
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
  }, [heatmapData, type]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading interview heatmap...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-none border-none">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {type === "presite" ? "Self-Audit" : "Onsite-Audit"} Interview
              Score Changes
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Visualise {type} interview score changes between program
              assessments
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load {type} interview responses: {error.message}
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
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {type === "presite" ? "Self-Audit" : "Onsite-Audit"} Interview
              Score Changes
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Visualise {type} interview score changes between program
              assessments
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="flex flex-col items-center gap-2 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                No interview data available
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                There are no {type} interview score changes to display for this
                program
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalResponses = heatmapData.metadata.totalResponses;
  const totalInterviews = heatmapData.metadata.totalInterviews;

  return (
    <Card ref={cardRef} className="shadow-none border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {type === "presite" ? "Self-Audit" : "Onsite-Audit"} Interview
              Score Changes
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Visualise {type} interview score changes between program
              assessments
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {totalInterviews} Interview{totalInterviews !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {totalResponses} Response{totalResponses !== 1 ? "s" : ""}
            </Badge>
          </div>
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

export function PresiteInterviewsLineChart({
  programId,
}: {
  programId: number;
}) {
  return <InterviewScoreChanges programId={programId} type="presite" />;
}

export function OnsiteInterviewsLineChart({
  programId,
}: {
  programId: number;
}) {
  return <InterviewScoreChanges programId={programId} type="onsite" />;
}
