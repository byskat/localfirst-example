import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Sample chart data - used as fallback
const sampleChartData = [
  { month: "January", value: 186 },
  { month: "February", value: 305 },
  { month: "March", value: 237 },
  { month: "April", value: 73 },
  { month: "May", value: 209 },
  { month: "June", value: 214 },
];

interface ChartSeries {
  key: string;
  label: string;
  color?: string;
  type?: "bar" | "line";
  strokeDasharray?: string;
  strokeWidth?: number;
}

interface ChartWidgetConfig {
  series?: ChartSeries[];
  xAxisKey?: string;
  chartType?: "bar" | "line" | "area";
  showGrid?: boolean;
}

interface ChartWidgetProps {
  title: string;
  config: Record<string, unknown>;
  dataSource: Record<string, unknown>;
}

export function ChartWidget({
  title: _title,
  config,
  dataSource,
}: Readonly<ChartWidgetProps>) {
  // Parse config and data
  const chartConfig = config as ChartWidgetConfig;
  const data =
    Array.isArray(dataSource) && dataSource.length > 0
      ? dataSource
      : sampleChartData;

  const series = chartConfig.series ?? [
    { key: "value", label: "Value", color: "hsl(var(--chart-1))" },
  ];

  const xAxisKey = chartConfig.xAxisKey ?? "month";
  const chartType = chartConfig.chartType ?? "bar";
  const showGrid = chartConfig.showGrid ?? true;

  // Build recharts config from series
  const rechartsConfig: ChartConfig = {};
  for (const s of series) {
    rechartsConfig[s.key] = {
      label: s.label,
      color: s.color ?? `hsl(var(--chart-${series.indexOf(s) + 1}))`,
    };
  }

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0">
        <ChartContainer config={rechartsConfig} className="w-full h-full">
          {chartType === "line" ? (
            <LineChart data={data}>
              {showGrid && <CartesianGrid vertical={false} />}
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  typeof value === "string" ? value.slice(0, 3) : value
                }
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              {series.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color ?? `var(--color-${s.key})`}
                  strokeWidth={s.strokeWidth ?? 2}
                  strokeDasharray={s.strokeDasharray}
                  dot={false}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={data}>
              {showGrid && <CartesianGrid vertical={false} />}
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  typeof value === "string" ? value.slice(0, 3) : value
                }
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              {series.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={s.color ?? `var(--color-${s.key})`}
                  radius={4}
                />
              ))}
            </BarChart>
          )}
        </ChartContainer>
      </div>
    </div>
  );
}
