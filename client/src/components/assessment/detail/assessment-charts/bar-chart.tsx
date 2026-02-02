import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BRAND_COLORS } from "@/lib/brand";

/**
 * Splits label on '>' and truncates if too long
 * @param value 
 * @returns 
 */
function yAxisTickFormatter(value: string) {
  const parts = value.split(">");
  return (parts.length > 3 ? "..." : "") + parts.slice(-2).join(" > ");
}

const chartConfig = {
  value: {
    label: "Value",
    color: BRAND_COLORS.azureRadiance,
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig;

export function ChartBar({
  title,
  description,
  data,
}: {
  title?: string;
  description?: string;
  data: { label: string; value: number }[];
}) {
  const showHeader = title || description;

  return (
    <Card className="shadow-none">
      {showHeader && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[100px]">
          <BarChart accessibilityLayer data={data} layout="vertical" margin={{
            top: 16, bottom: 16
          }}>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={120}
              fontSize={10}
              tickFormatter={yAxisTickFormatter}
            />
            <XAxis dataKey="value" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={4}>
              <LabelList
                dataKey="value"
                position="inside"
                offset={8}
                className="fill-(--color-label)"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
