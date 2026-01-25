import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample table data - used as fallback
const sampleTableData = [
  { id: 1, name: "Item 1", value: 100, status: "Active" },
  { id: 2, name: "Item 2", value: 200, status: "Pending" },
  { id: 3, name: "Item 3", value: 150, status: "Active" },
  { id: 4, name: "Item 4", value: 75, status: "Inactive" },
];

interface TableWidgetConfig {
  columns?: string[];
  columnLabels?: Record<string, string>;
}

interface TableWidgetProps {
  title: string;
  config: Record<string, unknown>;
  dataSource: Record<string, unknown>;
}

export function TableWidget({
  title: _title,
  config,
  dataSource,
}: Readonly<TableWidgetProps>) {
  // Parse config and data
  const tableConfig = config as TableWidgetConfig;
  const data =
    Array.isArray(dataSource) && dataSource.length > 0
      ? dataSource
      : sampleTableData;

  // Determine columns - either from config or from first data row
  let columns: string[] = tableConfig.columns ?? [];
  if (columns.length === 0 && data.length > 0) {
    columns = Object.keys(data[0]);
  }

  // Column labels - use custom labels or capitalize column names
  const columnLabels = tableConfig.columnLabels ?? {};
  const getColumnLabel = (col: string) =>
    columnLabels[col] ?? col.charAt(0).toUpperCase() + col.slice(1);

  return (
    <div className="overflow-auto h-full border rounded-md">
      <Table containerless>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col} stickyHeader>
                {getColumnLabel(col)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={String((row as Record<string, unknown>).id ?? idx)}>
              {columns.map((col) => (
                <TableCell key={col}>
                  {String((row as Record<string, unknown>)[col] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
