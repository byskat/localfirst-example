export interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  type: "chart" | "table";
  chartType?: "line" | "bar" | "area" | "pie";
  data: unknown;
  config: unknown;
}

export const CHART_TEMPLATES: WidgetTemplate[] = [
  {
    id: "line-chart-daily",
    name: "Line Chart - Daily",
    description: "Daily consumption and flow metrics",
    type: "chart",
    chartType: "line",
    data: [
      { day: "Mon", consumption: 2450, flow: 1820 },
      { day: "Tue", consumption: 2680, flow: 1950 },
      { day: "Wed", consumption: 2520, flow: 1880 },
      { day: "Thu", consumption: 2890, flow: 2100 },
      { day: "Fri", consumption: 2750, flow: 2020 },
      { day: "Sat", consumption: 2200, flow: 1650 },
      { day: "Sun", consumption: 2100, flow: 1580 },
    ],
    config: {
      chartType: "line" as const,
      xAxisKey: "day",
      showGrid: true,
      series: [
        {
          key: "consumption",
          label: "Consumption (kWh)",
          color: "#8884d8",
          strokeWidth: 2,
        },
        {
          key: "flow",
          label: "Flow Rate (L/h)",
          color: "#82ca9d",
          strokeWidth: 2,
        },
      ],
    },
  },
  {
    id: "line-chart-hourly",
    name: "Line Chart - Hourly",
    description: "24-hour operational metrics",
    type: "chart",
    chartType: "line",
    data: [
      { hour: "00:00", pressure: 45, temperature: 22, flow: 320 },
      { hour: "01:00", pressure: 43, temperature: 21, flow: 310 },
      { hour: "02:00", pressure: 42, temperature: 21, flow: 305 },
      { hour: "03:00", pressure: 41, temperature: 20, flow: 300 },
      { hour: "04:00", pressure: 40, temperature: 20, flow: 295 },
      { hour: "05:00", pressure: 42, temperature: 21, flow: 315 },
      { hour: "06:00", pressure: 48, temperature: 23, flow: 380 },
      { hour: "07:00", pressure: 55, temperature: 25, flow: 450 },
      { hour: "08:00", pressure: 62, temperature: 27, flow: 520 },
      { hour: "09:00", pressure: 68, temperature: 29, flow: 580 },
      { hour: "10:00", pressure: 72, temperature: 31, flow: 620 },
      { hour: "11:00", pressure: 75, temperature: 32, flow: 650 },
      { hour: "12:00", pressure: 78, temperature: 33, flow: 680 },
      { hour: "13:00", pressure: 76, temperature: 33, flow: 670 },
      { hour: "14:00", pressure: 74, temperature: 32, flow: 640 },
      { hour: "15:00", pressure: 70, temperature: 31, flow: 610 },
      { hour: "16:00", pressure: 65, temperature: 30, flow: 560 },
      { hour: "17:00", pressure: 58, temperature: 28, flow: 500 },
      { hour: "18:00", pressure: 52, temperature: 26, flow: 440 },
      { hour: "19:00", pressure: 50, temperature: 25, flow: 420 },
      { hour: "20:00", pressure: 48, temperature: 24, flow: 400 },
      { hour: "21:00", pressure: 47, temperature: 23, flow: 380 },
      { hour: "22:00", pressure: 46, temperature: 23, flow: 360 },
      { hour: "23:00", pressure: 45, temperature: 22, flow: 340 },
    ],
    config: {
      chartType: "line" as const,
      xAxisKey: "hour",
      showGrid: true,
      series: [
        {
          key: "pressure",
          label: "Pressure (PSI)",
          color: "#8884d8",
          strokeWidth: 2,
        },
        {
          key: "temperature",
          label: "Temperature (°C)",
          color: "#82ca9d",
          strokeWidth: 2,
        },
        {
          key: "flow",
          label: "Flow (L/min)",
          color: "#ffc658",
          strokeWidth: 2,
        },
      ],
    },
  },
  {
    id: "bar-chart-monthly",
    name: "Bar Chart - Monthly",
    description: "Monthly production vs capacity",
    type: "chart",
    chartType: "bar",
    data: [
      { month: "Jan", production: 8500, capacity: 10000 },
      { month: "Feb", production: 9200, capacity: 10000 },
      { month: "Mar", production: 8800, capacity: 10000 },
      { month: "Apr", production: 9600, capacity: 10000 },
      { month: "May", production: 9300, capacity: 10000 },
      { month: "Jun", production: 9800, capacity: 10000 },
    ],
    config: {
      chartType: "bar" as const,
      xAxisKey: "month",
      showGrid: true,
      series: [
        {
          key: "production",
          label: "Production (units)",
          color: "#10b981",
          strokeWidth: 2,
        },
        {
          key: "capacity",
          label: "Capacity (units)",
          color: "#6b7280",
          strokeWidth: 2,
        },
      ],
    },
  },
  {
    id: "area-chart-weekly",
    name: "Area Chart - Weekly",
    description: "Weekly throughput and efficiency",
    type: "chart",
    chartType: "area",
    data: [
      { week: "Week 1", throughput: 5200, efficiency: 87 },
      { week: "Week 2", throughput: 5800, efficiency: 92 },
      { week: "Week 3", throughput: 5400, efficiency: 89 },
      { week: "Week 4", throughput: 6100, efficiency: 94 },
    ],
    config: {
      chartType: "area" as const,
      xAxisKey: "week",
      showGrid: true,
      series: [
        {
          key: "throughput",
          label: "Throughput (units/h)",
          color: "#6366f1",
          strokeWidth: 2,
        },
        {
          key: "efficiency",
          label: "Efficiency (%)",
          color: "#ec4899",
          strokeWidth: 2,
        },
      ],
    },
  },
  {
    id: "pie-chart-distribution",
    name: "Pie Chart - Distribution",
    description: "Resource allocation by department",
    type: "chart",
    chartType: "pie",
    data: [
      { name: "Production", value: 45 },
      { name: "Quality Control", value: 20 },
      { name: "Maintenance", value: 15 },
      { name: "Logistics", value: 12 },
      { name: "Admin", value: 8 },
    ],
    config: {
      chartType: "pie" as const,
      nameKey: "name",
      dataKey: "value",
      showLegend: false,
      colors: ["#2563eb", "#16a34a", "#dc2626", "#ca8a04", "#9333ea"],
    },
  },
];

export const TABLE_TEMPLATES: WidgetTemplate[] = [
  {
    id: "table-equipment",
    name: "Equipment Status",
    description: "Monitor equipment status and utilization",
    type: "table",
    data: [
      {
        id: "EQ-001",
        name: "Pump A-1",
        status: "Running",
        utilization: 87,
        lastMaintenance: "2025-01-15",
      },
      {
        id: "EQ-002",
        name: "Compressor B-2",
        status: "Running",
        utilization: 92,
        lastMaintenance: "2025-01-10",
      },
      {
        id: "EQ-003",
        name: "Conveyor C-3",
        status: "Maintenance",
        utilization: 0,
        lastMaintenance: "2025-01-25",
      },
      {
        id: "EQ-004",
        name: "Mixer D-4",
        status: "Running",
        utilization: 78,
        lastMaintenance: "2025-01-20",
      },
    ],
    config: {
      columns: ["id", "name", "status", "utilization", "lastMaintenance"],
      columnLabels: {
        id: "Equipment ID",
        name: "Name",
        status: "Status",
        utilization: "Utilization (%)",
        lastMaintenance: "Last Maintenance",
      },
    },
  },
  {
    id: "table-sensors",
    name: "Sensor Readings",
    description: "Real-time sensor data monitoring",
    type: "table",
    data: [
      {
        id: "S-101",
        location: "Tank 1",
        type: "Temperature",
        value: 72.5,
        unit: "°C",
        status: "Normal",
      },
      {
        id: "S-102",
        location: "Line 2",
        type: "Pressure",
        value: 45.2,
        unit: "PSI",
        status: "Normal",
      },
      {
        id: "S-103",
        location: "Valve 3",
        type: "Flow",
        value: 320,
        unit: "L/min",
        status: "Normal",
      },
      {
        id: "S-104",
        location: "Tank 4",
        type: "Level",
        value: 85,
        unit: "%",
        status: "High",
      },
    ],
    config: {
      columns: ["id", "location", "type", "value", "unit", "status"],
      columnLabels: {
        id: "Sensor ID",
        location: "Location",
        type: "Type",
        value: "Value",
        unit: "Unit",
        status: "Status",
      },
    },
  },
  {
    id: "table-alerts",
    name: "System Alerts",
    description: "Active alerts and notifications",
    type: "table",
    data: [
      {
        id: "ALT-001",
        timestamp: "2025-01-26 08:15",
        severity: "Warning",
        message: "High temperature in Tank 1",
        acknowledged: false,
      },
      {
        id: "ALT-002",
        timestamp: "2025-01-26 09:30",
        severity: "Info",
        message: "Scheduled maintenance due",
        acknowledged: true,
      },
      {
        id: "ALT-003",
        timestamp: "2025-01-26 10:45",
        severity: "Critical",
        message: "Pressure threshold exceeded",
        acknowledged: false,
      },
      {
        id: "ALT-004",
        timestamp: "2025-01-26 11:20",
        severity: "Warning",
        message: "Low flow rate detected",
        acknowledged: true,
      },
    ],
    config: {
      columns: ["id", "timestamp", "severity", "message", "acknowledged"],
      columnLabels: {
        id: "Alert ID",
        timestamp: "Time",
        severity: "Severity",
        message: "Message",
        acknowledged: "Acknowledged",
      },
    },
  },
];
