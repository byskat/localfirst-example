import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Widget } from "@/db/schema";
import { widgetsCollection } from "@/lib/collections";
import { DEFAULT_TABLE_CONFIG, DEFAULT_TABLE_DATA } from "./widget-defaults";

interface EditTableWidgetSheetProps {
  widget: Widget;
}

export function EditTableWidgetSheet({
  widget,
}: Readonly<EditTableWidgetSheetProps>) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(widget.title);

  const getInitialData = () => {
    if (
      !widget.data_source ||
      (typeof widget.data_source === "object" &&
        Object.keys(widget.data_source).length === 0)
    ) {
      return JSON.stringify(DEFAULT_TABLE_DATA, null, 2);
    }
    return JSON.stringify(widget.data_source, null, 2);
  };

  const getInitialConfig = () => {
    if (
      !widget.config ||
      (typeof widget.config === "object" &&
        Object.keys(widget.config).length === 0)
    ) {
      return JSON.stringify(DEFAULT_TABLE_CONFIG, null, 2);
    }
    return JSON.stringify(widget.config, null, 2);
  };

  const [data, setData] = useState(getInitialData());
  const [config, setConfig] = useState(getInitialConfig());
  const [dataError, setDataError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const handleTitleBlur = () => {
    if (title.trim() && title !== widget.title) {
      widgetsCollection.update(widget.id, (draft) => {
        draft.title = title;
      });
    }
  };

  const handleDataBlur = () => {
    if (!data.trim()) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      setDataError("Invalid JSON format");
      return;
    }

    try {
      widgetsCollection.update(widget.id, (draft) => {
        draft.data_source = parsed;
      });
      setDataError(null);
    } catch (error) {
      console.error("Error updating table data:", error);
      setDataError("Failed to save data");
    }
  };

  const handleConfigBlur = () => {
    if (!config.trim()) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(config);
    } catch {
      setConfigError("Invalid JSON format");
      return;
    }

    try {
      widgetsCollection.update(widget.id, (draft) => {
        draft.config = parsed;
      });
      setConfigError(null);
    } catch (error) {
      console.error("Error updating table config:", error);
      setConfigError("Failed to save configuration");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTitle(widget.title);

      if (
        !widget.data_source ||
        (typeof widget.data_source === "object" &&
          Object.keys(widget.data_source).length === 0)
      ) {
        setData(JSON.stringify(DEFAULT_TABLE_DATA, null, 2));
      } else {
        setData(JSON.stringify(widget.data_source, null, 2));
      }

      if (
        !widget.config ||
        (typeof widget.config === "object" &&
          Object.keys(widget.config).length === 0)
      ) {
        setConfig(JSON.stringify(DEFAULT_TABLE_CONFIG, null, 2));
      } else {
        setConfig(JSON.stringify(widget.config, null, 2));
      }

      setDataError(null);
      setConfigError(null);
    }
    setOpen(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            title="Edit table"
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        }
      ></SheetTrigger>
      <SheetContent hideOverlay className="overflow-y-auto px-6">
        <SheetHeader>
          <SheetTitle>Edit Table Widget</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="table-title">Title</Label>
            <Input
              id="table-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Enter table title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="table-data">Data (JSON)</Label>
            <textarea
              id="table-data"
              value={data}
              onChange={(e) => {
                setData(e.target.value);
                if (dataError) setDataError(null);
              }}
              onBlur={handleDataBlur}
              placeholder='[{"id": 1, "name": "Item 1", "value": 100}]'
              className={`w-full h-48 p-2 border rounded-md font-mono text-sm resize-y ${
                dataError ? "border-red-500" : ""
              }`}
            />
            {dataError && <p className="text-sm text-red-500">{dataError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="table-config">Configuration (JSON)</Label>
            <textarea
              id="table-config"
              value={config}
              onChange={(e) => {
                setConfig(e.target.value);
                if (configError) setConfigError(null);
              }}
              onBlur={handleConfigBlur}
              placeholder='{"columns": ["id", "name", "value"]}'
              className={`w-full h-48 p-2 border rounded-md font-mono text-sm resize-y ${
                configError ? "border-red-500" : ""
              }`}
            />
            {configError && (
              <p className="text-sm text-red-500">{configError}</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
