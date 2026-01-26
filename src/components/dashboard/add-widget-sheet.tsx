import {
  Plus,
  BarChart3,
  Table2,
  LineChart,
  AreaChart,
  PieChart,
  Gauge,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { widgetsCollection } from "@/lib/collections";
import {
  CHART_TEMPLATES,
  TABLE_TEMPLATES,
  type WidgetTemplate,
} from "./widget-templates";
import { cn } from "@/lib/utils";

interface AddWidgetSheetProps {
  dashboardId: number;
}

export function AddWidgetSheet({ dashboardId }: Readonly<AddWidgetSheetProps>) {
  const [open, setOpen] = useState(false);
  const [widgetTitle, setWidgetTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<WidgetTemplate | null>(null);
  const [widgetData, setWidgetData] = useState<string>("");
  const [widgetConfig, setWidgetConfig] = useState<string>("");

  // Query existing widgets to calculate next position
  const { data: widgets } = useLiveQuery(
    (q) =>
      q
        .from({ widgetsCollection })
        .where(({ widgetsCollection: w }) => eq(w.dashboard_id, dashboardId)),
    [dashboardId]
  );

  const handleTemplateSelect = (template: WidgetTemplate) => {
    setSelectedTemplate(template);
    setWidgetData(JSON.stringify(template.data, null, 2));
    setWidgetConfig(JSON.stringify(template.config, null, 2));
  };

  const getChartIcon = (chartType?: string) => {
    switch (chartType) {
      case "line":
        return LineChart;
      case "bar":
        return BarChart3;
      case "area":
        return AreaChart;
      case "pie":
        return PieChart;
      case "radial":
        return Gauge;
      case "radar":
        return Activity;
      default:
        return BarChart3;
    }
  };

  const handleAddWidget = () => {
    if (!widgetTitle.trim() || !selectedTemplate) return;

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
        type: selectedTemplate.type,
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
      setSelectedTemplate(null);
      setWidgetData("");
      setWidgetConfig("");
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
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Add Widget</SheetTitle>
        </SheetHeader>

        <SheetBody>
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <Label htmlFor="widget-title">Title</Label>
              <Input
                id="widget-title"
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                placeholder="Enter widget title"
              />
            </div>

            <div className="space-y-3">
              <Label>Chart Templates</Label>
              <div className="grid grid-cols-1 gap-3">
                {CHART_TEMPLATES.map((template) => {
                  const Icon = getChartIcon(template.chartType);
                  return (
                    <Card
                      key={template.id}
                      size="sm"
                      className={cn(
                        "cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                        selectedTemplate?.id === template.id &&
                          "ring-2 ring-primary bg-primary/5"
                      )}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">
                            {template.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {template.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Table Templates</Label>
              <div className="grid grid-cols-1 gap-3">
                {TABLE_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    size="sm"
                    className={cn(
                      "cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                      selectedTemplate?.id === template.id &&
                        "ring-2 ring-primary bg-primary/5"
                    )}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Table2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {template.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {selectedTemplate && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="widget-data">Data (JSON)</Label>
                  <textarea
                    id="widget-data"
                    value={widgetData}
                    onChange={(e) => setWidgetData(e.target.value)}
                    placeholder='[{"key": "value"}]'
                    className="w-full h-40 p-3 border rounded-md font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="widget-config">Configuration (JSON)</Label>
                  <textarea
                    id="widget-config"
                    value={widgetConfig}
                    onChange={(e) => setWidgetConfig(e.target.value)}
                    placeholder='{"key": "value"}'
                    className="w-full h-40 p-3 border rounded-md font-mono text-xs"
                  />
                </div>
              </>
            )}
          </div>
        </SheetBody>

        <SheetFooter>
          <Button
            onClick={handleAddWidget}
            disabled={!widgetTitle.trim() || !selectedTemplate}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
