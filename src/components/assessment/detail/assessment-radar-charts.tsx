import { useCallback, useEffect, useState } from "react";
import { ChartRadar } from "./assessment-charts/radar-chart";
import { getAssessmentRadarChart } from "@/lib/api/analytics";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconChartRadar } from "@tabler/icons-react";

export function AssessmentRadarCharts({
  assessmentId,
}: {
  assessmentId: number;
}) {
  const [selectedQuestionnaireLevel, setSelectedQuestionnaireLevel] = useState<
    "sections" | "steps" | "questions"
  >("sections");
  const [data, setData] = useState<any>(null);
  // Fetch radar data
  useEffect(() => {
    async function fetchRadarData() {
      try {
        const response = await getAssessmentRadarChart(assessmentId);
        setData(response);
      } catch (error) {
        console.error("Error fetching radar chart data:", error);
      }
    }

    fetchRadarData();
  }, [assessmentId]);

  const renderCharts = useCallback(() => {
    if (!data) {
      return <div>Loading...</div>;
    }

    // Assuming data contains multiple charts
    return data[selectedQuestionnaireLevel].map((chart: any, index: number) => (
      <ChartRadar key={index} title={chart.title} data={chart.data} />
    ));
  }, [data, selectedQuestionnaireLevel]);

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconChartRadar className="h-5 w-5" />
          Assessment Score Overview
        </CardTitle>
        <CardDescription>
          Overview of assessment scores from questionnaire responses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedQuestionnaireLevel}
          onValueChange={(value) =>
            setSelectedQuestionnaireLevel(
              value as "sections" | "steps" | "questions"
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a questionnaire level" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Questionnaire Levels</SelectLabel>
              <SelectItem value="sections">Sections</SelectItem>
              <SelectItem value="steps">Steps</SelectItem>
              <SelectItem value="questions">Questions</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-4 mt-4">{renderCharts()}</div>
      </CardContent>
    </Card>
  );
}
