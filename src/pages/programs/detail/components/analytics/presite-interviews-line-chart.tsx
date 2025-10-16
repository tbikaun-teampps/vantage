import { useState, useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProgramById } from "@/hooks/useProgram";
// import { createClient } from "@/lib/supabase/client";

interface InterviewScoreChangesProps {
  programId: number;
  type: "presite" | "onsite";
}

interface HeatmapDataPoint {
  section: string;
  phaseTransition: string;
  difference: number;
  percentChange: number;
  fromValue: number;
  toValue: number;
  fromPhase: string;
  toPhase: string;
  responseCountChange: number;
  interviewCountChange: number;
}

interface InterviewResponseData {
  id: number;
  rating_score: number | null;
  interview_id: number;
  program_phase_id: number;
  phase_name: string | null;
  phase_sequence: number;
  questionnaire_question_id: number;
  section_title: string;
  question_title: string;
}

export function InterviewScoreChanges({
  programId,
  type,
}: InterviewScoreChangesProps) {
  const [responseData, setResponseData] = useState<InterviewResponseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch program data including phases
  const {
    data: program,
    isLoading: programLoading,
    error: programError,
  } = useProgramById(programId);

  // Get all phases for this program
  const phases = program?.phases || [];

  // Get questionnaire ID based on type
  const questionnaireId = type === "presite" 
    ? program?.presite_questionnaire_id 
    : program?.onsite_questionnaire_id;

  // Fetch interview responses directly from Supabase
  // useEffect(() => {
  //   if (!program || !questionnaireId || phases.length === 0)
  //     return;

  //   const fetchInterviewResponses = async () => {
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const supabase = createClient();

  //       // Fetch all interviews for this program that use the specified questionnaire
  //       const { data: interviews, error: interviewsError } = await supabase
  //         .from("interviews")
  //         .select(
  //           `
  //           id,
  //           program_phase_id,
  //           program_phases!inner(
  //             id,
  //             name,
  //             sequence_number
  //           ),
  //           interview_responses!inner(
  //             id,
  //             rating_score,
  //             is_applicable,
  //             questionnaire_question_id,
  //             questionnaire_questions!inner(
  //               id,
  //               title,
  //               questionnaire_step_id,
  //               questionnaire_steps!inner(
  //                 questionnaire_section_id,
  //                 questionnaire_sections!inner(
  //                   title
  //                 )
  //               )
  //             )
  //           )
  //         `
  //         )
  //         .eq("program_id", programId)
  //         .eq("questionnaire_id", questionnaireId)
  //         .eq("is_deleted", false)
  //         .not("interview_responses.rating_score", "is", null)
  //         .eq("interview_responses.is_applicable", true)
  //         .eq("interview_responses.is_deleted", false);

  //       if (interviewsError) {
  //         throw interviewsError;
  //       }

  //       // Transform the data into a flat array of responses with phase info
  //       const responses: InterviewResponseData[] = [];

  //       interviews?.forEach((interview) => {
  //         interview.interview_responses.forEach((response) => {
  //           if (response.rating_score !== null) {
  //             const question = (response as any).questionnaire_questions;
  //             const step = question?.questionnaire_steps;
  //             const section = step?.questionnaire_sections;
              
  //             responses.push({
  //               id: response.id,
  //               rating_score: response.rating_score,
  //               interview_id: interview.id,
  //               program_phase_id: interview.program_phase_id || 0,
  //               phase_name: (interview.program_phases as any)?.name || null,
  //               phase_sequence:
  //                 (interview.program_phases as any)?.sequence_number || 0,
  //               questionnaire_question_id: response.questionnaire_question_id || 0,
  //               section_title: section?.title || 'Unknown Section',
  //               question_title: question?.title || 'Unknown Question',
  //             });
  //           }
  //         });
  //       });

  //       setResponseData(responses);
  //     } catch (error) {
  //       console.error(`Failed to fetch ${type} interview responses:`, error);
  //       setError(
  //         error instanceof Error
  //           ? error
  //           : new Error(`Failed to fetch ${type} interview responses`)
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchInterviewResponses();
  // }, [program, programId, phases, questionnaireId, type]);

  // Transform data for heatmap showing changes between phases
  const heatmapData = useMemo(() => {
    if (!program || phases.length < 2 || responseData.length === 0) {
      return { data: [], transitions: [], sections: [] };
    }

    const sortedPhases = phases.sort(
      (a, b) => a.sequence_number - b.sequence_number
    );

    // Group responses by section and phase
    const sectionPhaseGroups = new Map<string, Map<number, InterviewResponseData[]>>();

    responseData.forEach((response) => {
      const sectionTitle = response.section_title;
      const phaseId = response.program_phase_id;

      if (!sectionPhaseGroups.has(sectionTitle)) {
        sectionPhaseGroups.set(sectionTitle, new Map());
      }

      const phaseMap = sectionPhaseGroups.get(sectionTitle)!;
      if (!phaseMap.has(phaseId)) {
        phaseMap.set(phaseId, []);
      }
      phaseMap.get(phaseId)!.push(response);
    });

    // Get all unique sections, sorted alphabetically
    const sections = Array.from(sectionPhaseGroups.keys()).sort();

    const transitions: string[] = [];
    const data: HeatmapDataPoint[] = [];

    // Create transition names (only do this once since they're the same for all sections)
    for (let i = 0; i < sortedPhases.length - 1; i++) {
      const current = sortedPhases[i];
      const next = sortedPhases[i + 1];
      const transition = `${current.name || `Assessment ${current.sequence_number}`}→${next.name || `Assessment ${next.sequence_number}`}`;
      transitions.push(transition);
    }

    // For each section, calculate differences between phases
    sections.forEach((sectionTitle) => {
      const phaseMap = sectionPhaseGroups.get(sectionTitle)!;

      // Calculate stats for each phase in this section
      const sectionPhaseStats = sortedPhases.map((phase) => {
        const sectionPhaseResponses = phaseMap.get(phase.id) || [];

        // Calculate average score for this section in this phase
        const scores = sectionPhaseResponses
          .map((r) => r.rating_score)
          .filter((score): score is number => score !== null);

        const averageScore =
          scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : 0;

        // Count unique interviews for this section in this phase
        const uniqueInterviews = new Set(
          sectionPhaseResponses.map((r) => r.interview_id)
        ).size;

        return {
          phase,
          averageScore: Math.round(averageScore * 100) / 100,
          responseCount: sectionPhaseResponses.length,
          interviewCount: uniqueInterviews,
        };
      });

      // Create phase transitions and calculate differences for this section
      for (let i = 0; i < sectionPhaseStats.length - 1; i++) {
        const current = sectionPhaseStats[i];
        const next = sectionPhaseStats[i + 1];

        const transition = `${current.phase.name || `Phase ${current.phase.sequence_number}`}→${next.phase.name || `Phase ${next.phase.sequence_number}`}`;

        const difference = next.averageScore - current.averageScore;
        const percentChange =
          current.averageScore !== 0
            ? (difference / current.averageScore) * 100
            : 0;

        data.push({
          section: sectionTitle,
          phaseTransition: transition,
          difference,
          percentChange,
          fromValue: current.averageScore,
          toValue: next.averageScore,
          fromPhase:
            current.phase.name || `Phase ${current.phase.sequence_number}`,
          toPhase: next.phase.name || `Phase ${next.phase.sequence_number}`,
          responseCountChange: next.responseCount - current.responseCount,
          interviewCountChange: next.interviewCount - current.interviewCount,
        });
      }
    });

    return { data, transitions, sections };
  }, [program, phases, responseData]);

  // D3 Heatmap rendering
  useEffect(() => {
    if (!svgRef.current || heatmapData.data.length === 0) return;

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
      .attr("x", (d) => (xScale(d.phaseTransition) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => (yScale(d.section) || 0) + yScale.bandwidth() / 2 - 5)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("pointer-events", "none")
      .text((d) => d.difference > 0 ? `+${d.difference.toFixed(1)}` : d.difference.toFixed(1))
      .attr("fill", (d) => Math.abs(d.percentChange) > 10 ? "white" : "black");

    // Add percentage change
    cells
      .append("text")
      .attr("x", (d) => (xScale(d.phaseTransition) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => (yScale(d.section) || 0) + yScale.bandwidth() / 2 + 12)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-weight", "400")
      .style("opacity", "0.8")
      .style("pointer-events", "none")
      .text((d) => `(${d.percentChange > 0 ? '+' : ''}${d.percentChange.toFixed(1)}%)`)
      .attr("fill", (d) => Math.abs(d.percentChange) > 10 ? "white" : "#666");

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
  }, [heatmapData.data, type]);

  if (programLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading program data...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (programError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[200px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load program data: {programError.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!questionnaireId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[200px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No {type === "presite" ? "Presite" : "Onsite"} Questionnaire</AlertTitle>
            <AlertDescription>
              This program doesn't have a {type} questionnaire configured.
              Configure one to see {type} interview trends.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading interview responses...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
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

  if (phases.length < 2) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[200px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Insufficient Assessments</AlertTitle>
            <AlertDescription>
              At least 2 assessments are needed to show interview score changes over
              time. Create more assessments to see trend data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (responseData.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[200px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Interview Data</AlertTitle>
            <AlertDescription>
              No {type} interview responses found for this program's assessments.
              Complete {type} interviews to see trend data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalResponses = responseData.length;
  const totalInterviews = new Set(responseData.map((r) => r.interview_id)).size;

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {type === "presite" ? "Self-Audit" : "Onsite-Audit"} Interview Score Changes
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Visualise {type} interview score changes between program assessments
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

// Legacy wrapper component for backward compatibility
export function PresiteInterviewsLineChart({ programId }: { programId: number }) {
  return <InterviewScoreChanges programId={programId} type="presite" />;
}

// New onsite component
export function OnsiteInterviewsLineChart({ programId }: { programId: number }) {
  return <InterviewScoreChanges programId={programId} type="onsite" />;
}
