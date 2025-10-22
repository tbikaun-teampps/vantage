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
        <ChartContainer config={chartConfig} className='max-h-[150px]'>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              right: 48,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="value" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={4}
            >
              <LabelList
                dataKey="label"
                position="insideLeft"
                offset={8}
                className="fill-(--color-label)"
                fontSize={12}
              />
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
