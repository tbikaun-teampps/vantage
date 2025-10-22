import { ChartBar } from "./bar-chart";
import { useAssessmentMeasurementsBarChart } from "@/hooks/use-assessment-measurements";

export function AssessmentCharts({ assessmentId }: { assessmentId: number }) {
  const { data, isLoading, error } =
    useAssessmentMeasurementsBarChart(assessmentId);

  if (!assessmentId) {
    return null;
  }

  if (isLoading) {
    return <div>Loading chart data...</div>;
  }

  if (error) {
    return <div>Error loading chart data: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return <div>No chart data available</div>;
  }

  const lgGridCols = Math.min(data.length, 4);
  const mdGridCols = Math.min(data.length, 2);
  const gridClass = `grid gap-6 md:grid-cols-${mdGridCols} lg:grid-cols-${lgGridCols}`;

  return (
    <div className={gridClass}>
      {data
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((chartData) => (
          <ChartBar
            key={chartData.name}
            title={chartData.name}
            data={chartData.data}
          />
        ))}
    </div>
  );
}
