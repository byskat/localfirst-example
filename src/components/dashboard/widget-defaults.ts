export const DEFAULT_CHART_DATA = [
  { month: "Jan", sales: 100, profit: 50 },
  { month: "Feb", sales: 150, profit: 75 },
  { month: "Mar", sales: 120, profit: 60 },
];

export const DEFAULT_CHART_CONFIG = {
  chartType: "line" as const,
  xAxisKey: "month",
  showGrid: true,
  series: [
    { key: "sales", label: "Sales", color: "#8884d8", strokeWidth: 2 },
    { key: "profit", label: "Profit", color: "#82ca9d", strokeWidth: 2 },
  ],
};

export const DEFAULT_TABLE_DATA = [
  { id: 1, name: "Item 1", value: 100, status: "Active" },
  { id: 2, name: "Item 2", value: 200, status: "Pending" },
  { id: 3, name: "Item 3", value: 150, status: "Active" },
];

export const DEFAULT_TABLE_CONFIG = {
  columns: ["id", "name", "value", "status"],
  columnLabels: {
    id: "ID",
    name: "Product Name",
    value: "Value",
    status: "Status",
  },
};
