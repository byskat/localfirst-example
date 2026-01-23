import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample table data - will be replaced with real data from data_source
const tableData = [
  { id: 1, name: "Item 1", value: 100, status: "Active" },
  { id: 2, name: "Item 2", value: 200, status: "Pending" },
  { id: 3, name: "Item 3", value: 150, status: "Active" },
  { id: 4, name: "Item 4", value: 75, status: "Inactive" },
];

interface TableWidgetProps {
  title: string;
  config: Record<string, unknown>;
  dataSource: Record<string, unknown>;
}

export function TableWidget({
  title: _title,
  config: _config,
  dataSource: _dataSource,
}: Readonly<TableWidgetProps>) {
  // Future: Use _config and _dataSource to fetch/filter real data
  // For now, using sample data
  const data = tableData;

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="flex-1 overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.value}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
