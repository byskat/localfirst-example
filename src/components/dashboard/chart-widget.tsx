import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
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
  chartType?: "bar" | "line" | "area" | "pie" | "radial" | "radar";
  showGrid?: boolean;
  showLegend?: boolean;
  // For pie charts
  nameKey?: string;
  dataKey?: string;
  colors?: string[];
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
  const showLegend = chartConfig.showLegend ?? true;

  // Default pie chart colors - using direct values instead of CSS variables
  const DEFAULT_CHART_COLORS = [
    "#2563eb", // blue
    "#16a34a", // green
    "#dc2626", // red
    "#ca8a04", // yellow
    "#9333ea", // purple
  ];

  // Use config colors if provided, otherwise use defaults
  const CHART_COLORS = chartConfig.colors ?? DEFAULT_CHART_COLORS;

  // Build recharts config from series (or pie data)
  const rechartsConfig: ChartConfig = {};
  if (chartType === "pie" && chartConfig.nameKey) {
    // For pie charts, build config from data
    data.forEach((item, index) => {
      const name = item[chartConfig.nameKey!];
      if (name) {
        rechartsConfig[name] = {
          label: name,
          color: CHART_COLORS[index % CHART_COLORS.length],
        };
      }
    });
  } else {
    // For other charts, build from series
    for (const s of series) {
      rechartsConfig[s.key] = {
        label: s.label,
        color: s.color ?? `hsl(var(--chart-${series.indexOf(s) + 1}))`,
      };
    }
  }

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0">
        <ChartContainer config={rechartsConfig} className="w-full h-full">
          {chartType === "pie" ? (
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={data}
                dataKey={chartConfig.dataKey ?? "value"}
                nameKey={chartConfig.nameKey ?? "name"}
                cx="50%"
                cy="50%"
                innerRadius="0%"
                outerRadius="70%"
                label={(entry) => `${entry.name}: ${entry.value}%`}
                labelLine
              >
                {data.map((entry, index) => (
                  <Cell
                    key={
                      entry[chartConfig.nameKey ?? "name"] ?? `cell-${index}`
                    }
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              {showLegend && <Legend />}
            </PieChart>
          ) : chartType === "line" ? (
            <LineChart data={data}>
              {showGrid && <CartesianGrid vertical={false} />}
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} width={80} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {showLegend && <Legend />}
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
          ) : chartType === "area" ? (
            <AreaChart data={data}>
              {showGrid && <CartesianGrid vertical={false} />}
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} width={80} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {showLegend && <Legend />}
              {series.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color ?? `var(--color-${s.key})`}
                  fill={s.color ?? `var(--color-${s.key})`}
                  fillOpacity={0.2}
                  strokeWidth={s.strokeWidth ?? 2}
                />
              ))}
            </AreaChart>
          ) : chartType === "radial" ? (
            <RadialBarChart
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="90%"
              barSize={10}
              startAngle={90}
              endAngle={-270}
            >
              {showGrid && <PolarGrid gridType="circle" />}
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
              <RadialBar
                dataKey={chartConfig.dataKey ?? series[0]?.key ?? "value"}
                cornerRadius={10}
                fill={CHART_COLORS[0]}
                background
              >
                {data.map((entry) => (
                  <Cell
                    key={entry[chartConfig.nameKey ?? "name"] ?? entry.id}
                    fill={
                      CHART_COLORS[data.indexOf(entry) % CHART_COLORS.length]
                    }
                  />
                ))}
              </RadialBar>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              {showLegend && <Legend />}
            </RadialBarChart>
          ) : chartType === "radar" ? (
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid />
              <PolarAngleAxis dataKey={chartConfig.nameKey ?? xAxisKey} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {showLegend && <Legend />}
              {series.map((s) => (
                <Radar
                  key={s.key}
                  name={s.label}
                  dataKey={s.key}
                  stroke={s.color ?? `var(--color-${s.key})`}
                  fill={s.color ?? `var(--color-${s.key})`}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          ) : (
            <BarChart data={data}>
              {showGrid && <CartesianGrid vertical={false} />}
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} width={80} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {showLegend && <Legend />}
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
