import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { widgetsCollection } from "@/lib/collections";
import {
  DEFAULT_CHART_CONFIG,
  DEFAULT_CHART_DATA,
  DEFAULT_TABLE_CONFIG,
  DEFAULT_TABLE_DATA,
} from "./widget-defaults";

interface AddWidgetSheetProps {
  dashboardId: number;
}

export function AddWidgetSheet({ dashboardId }: Readonly<AddWidgetSheetProps>) {
  const [open, setOpen] = useState(false);
  const [widgetTitle, setWidgetTitle] = useState("");
  const [widgetType, setWidgetType] = useState<"chart" | "table">("chart");
  const [widgetData, setWidgetData] = useState<string>(
    JSON.stringify(DEFAULT_CHART_DATA, null, 2)
  );
  const [widgetConfig, setWidgetConfig] = useState<string>(
    JSON.stringify(DEFAULT_CHART_CONFIG, null, 2)
  );

  // Query existing widgets to calculate next position
  const { data: widgets } = useLiveQuery(
    (q) =>
      q
        .from({ widgetsCollection })
        .where(({ widgetsCollection: w }) => eq(w.dashboard_id, dashboardId)),
    [dashboardId]
  );

  // Update default data when widget type changes
  useEffect(() => {
    if (widgetType === "chart") {
      setWidgetData(JSON.stringify(DEFAULT_CHART_DATA, null, 2));
      setWidgetConfig(JSON.stringify(DEFAULT_CHART_CONFIG, null, 2));
    } else {
      setWidgetData(JSON.stringify(DEFAULT_TABLE_DATA, null, 2));
      setWidgetConfig(JSON.stringify(DEFAULT_TABLE_CONFIG, null, 2));
    }
  }, [widgetType]);

  const handleAddWidget = () => {
    if (!widgetTitle.trim()) return;

    try {
      const parsedData = JSON.parse(widgetData);
      const parsedConfig = JSON.parse(widgetConfig);

      // Calculate next available position for each breakpoint
      const maxYMobile = Math.max(
        0,
        ...(widgets?.map((w) => w.layout.mobile.y + w.layout.mobile.h) ?? [0])
      );
      const maxYTablet = Math.max(
        0,
        ...(widgets?.map((w) => w.layout.tablet.y + w.layout.tablet.h) ?? [0])
      );
      const maxYDesktop = Math.max(
        0,
        ...(widgets?.map((w) => w.layout.desktop.y + w.layout.desktop.h) ?? [0])
      );

      widgetsCollection.insert({
        id: Math.floor(Math.random() * 100000),
        dashboard_id: dashboardId,
        title: widgetTitle,
        type: widgetType,
        data_source: parsedData,
        config: parsedConfig,
        layout: {
          mobile: { x: 0, y: maxYMobile, w: 12, h: 4, minW: 6, minH: 2 },
          tablet: { x: 0, y: maxYTablet, w: 8, h: 4, minW: 4, minH: 2 },
          desktop: { x: 0, y: maxYDesktop, w: 6, h: 4, minW: 2, minH: 2 },
        },
        created_at: new Date(),
      });

      // Reset form
      setWidgetTitle("");
      setWidgetType("chart");
      setWidgetData(JSON.stringify(DEFAULT_CHART_DATA, null, 2));
      setWidgetConfig(JSON.stringify(DEFAULT_CHART_CONFIG, null, 2));
      setOpen(false);
    } catch (error) {
      console.error("Failed to parse JSON:", error);
      alert("Invalid JSON format. Please check your data and configuration.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        }
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Widget</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 p-4">
          <div className="space-y-2">
            <Label htmlFor="widget-title">Title</Label>
            <Input
              id="widget-title"
              value={widgetTitle}
              onChange={(e) => setWidgetTitle(e.target.value)}
              placeholder="Enter widget title"
            />
          </div>

          <div className="space-y-2">
            <Label>Widget Type</Label>
            <RadioGroup
              value={widgetType}
              onValueChange={(value: "chart" | "table") => setWidgetType(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="chart" id="widget-type-chart" />
                <Label
                  htmlFor="widget-type-chart"
                  className="cursor-pointer font-normal"
                >
                  Chart
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="table" id="widget-type-table" />
                <Label
                  htmlFor="widget-type-table"
                  className="cursor-pointer font-normal"
                >
                  Table
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="widget-data">Data (JSON)</Label>
            <textarea
              id="widget-data"
              value={widgetData}
              onChange={(e) => setWidgetData(e.target.value)}
              placeholder={
                widgetType === "chart"
                  ? '[{"month": "Jan", "sales": 100}]'
                  : '[{"id": 1, "name": "Item 1", "value": 100}]'
              }
              className="w-full h-32 p-2 border rounded-md font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="widget-config">Configuration (JSON)</Label>
            <textarea
              id="widget-config"
              value={widgetConfig}
              onChange={(e) => setWidgetConfig(e.target.value)}
              placeholder={
                widgetType === "chart"
                  ? '{"chartType": "line", "series": [{"key": "sales", "label": "Sales"}]}'
                  : '{"columns": ["id", "name", "value"]}'
              }
              className="w-full h-32 p-2 border rounded-md font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleAddWidget}
            disabled={!widgetTitle.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
