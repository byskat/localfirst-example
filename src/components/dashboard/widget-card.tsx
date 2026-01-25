import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { Widget } from "@/db/schema";
import { ChartWidget } from "./chart-widget";
import { EditChartWidgetSheet } from "./edit-chart-widget-sheet";
import { EditTableWidgetSheet } from "./edit-table-widget-sheet";
import { TableWidget } from "./table-widget";

interface WidgetCardProps {
  widget: Widget;
  canEdit: boolean;
  onDelete: () => void;
}

export function WidgetCard({
  widget,
  canEdit,
  onDelete,
}: Readonly<WidgetCardProps>) {
  return (
    <Card className="h-full flex flex-col pt-3 pb-4">
      <CardContent className="flex-1 flex flex-col p-0 gap-4 h-full">
        <div className="flex items-start justify-between gap-2 px-4 pb-3 border-b">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <CardTitle className="text-lg py-0.5">{widget.title}</CardTitle>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <ButtonGroup>
              {widget.type === "chart" && (
                <EditChartWidgetSheet widget={widget} />
              )}
              {widget.type === "table" && (
                <EditTableWidgetSheet widget={widget} />
              )}
                <Button
                  variant="outline-destructive"
                  size="icon"
                  onClick={onDelete}
                  title="Delete widget"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </ButtonGroup>
              <ButtonGroup>
                <Button
                  variant="outline"
                  size="icon"
                  className="drag-handle cursor-grab active:cursor-grabbing"
                  title="Drag to move"
                  type="button"
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
              </ButtonGroup>
            </div>
          )}
        </div>
        <div className="flex-1 px-4 relative min-h-0">
          {widget.type === "chart" && (
            <ChartWidget
              title={widget.title}
              config={widget.config}
              dataSource={widget.data_source}
            />
          )}
          {widget.type === "table" && (
            <TableWidget
              title={widget.title}
              config={widget.config}
              dataSource={widget.data_source}
            />
          )}
          {widget.type !== "chart" && widget.type !== "table" && (
            <div className="text-sm text-muted-foreground">
              Unknown widget type: {widget.type}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
