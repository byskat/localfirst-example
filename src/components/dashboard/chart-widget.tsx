import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Sample chart data - will be replaced with real data from data_source
const chartData = [
  { month: "January", value: 186 },
  { month: "February", value: 305 },
  { month: "March", value: 237 },
  { month: "April", value: 73 },
  { month: "May", value: 209 },
  { month: "June", value: 214 },
];

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface ChartWidgetProps {
  title: string;
  config: Record<string, unknown>;
  dataSource: Record<string, unknown>;
}

export function ChartWidget({
  title: _title,
  config: _config,
  dataSource: _dataSource,
}: Readonly<ChartWidgetProps>) {
  // Future: Use _config and _dataSource to fetch/filter real data
  // For now, using sample data
  const data = chartData;

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
