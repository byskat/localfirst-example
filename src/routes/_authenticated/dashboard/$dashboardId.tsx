import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus, ArrowDownRight, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import GridLayout from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChartWidget } from "@/components/dashboard/chart-widget";
import { TableWidget } from "@/components/dashboard/table-widget";
import { WidgetCard } from "@/components/dashboard/widget-card";
import { authClient } from "@/lib/auth-client";
import {
  dashboardsCollection,
  usersCollection,
  widgetsCollection,
} from "@/lib/collections";

export const Route = createFileRoute(`/_authenticated/dashboard/$dashboardId`)({
  loader: async () => {
    await Promise.all([
      dashboardsCollection.preload(),
      widgetsCollection.preload(),
      usersCollection.preload(),
    ]);
  },
  component: DashboardDetail,
});

function DashboardDetail() {
  const { dashboardId } = Route.useParams();
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  const { data: dashboards } = useLiveQuery(
    (q) =>
      q
        .from({ dashboardsCollection })
        .where(({ dashboardsCollection: d }) =>
          eq(d.id, Number.parseInt(dashboardId, 10))
        ),
    [dashboardId]
  );
  const dashboard = dashboards?.[0];

  const { data: widgets } = useLiveQuery(
    (q) =>
      q
        .from({ widgetsCollection })
        .where(({ widgetsCollection: w }) =>
          eq(w.dashboard_id, Number.parseInt(dashboardId, 10))
        ),
    [dashboardId]
  );

  const { data: users } = useLiveQuery((q) => q.from({ usersCollection }), []);

  const [showEditSheet, setShowEditSheet] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<string | null>(
    null
  );
  const [showWidgetSheet, setShowWidgetSheet] = useState(false);
  const [widgetTitle, setWidgetTitle] = useState("");
  const [widgetType, setWidgetType] = useState<"chart" | "table">("chart");
  const [containerWidth, setContainerWidth] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);
  const comboboxAnchor = useComboboxAnchor();

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (!dashboard) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Dashboard not found</h2>
          <Button
            onClick={() => navigate({ to: `/dashboards` })}
            className="mt-4"
          >
            Back to Dashboards
          </Button>
        </div>
      </div>
    );
  }

  const canEdit =
    dashboard.owner_id === session?.user.id ||
    dashboard.editor_ids.includes(session?.user.id ?? ``);

  const usersMap = new Map(users?.map((u) => [u.id, u]) ?? []);
  const owner = usersMap.get(dashboard.owner_id);

  const handleLayoutChange = (layout: Layout) => {
    if (!canEdit) return;

    for (const item of layout) {
      const widget = widgets?.find((w) => w.id.toString() === item.i);
      if (widget) {
        const newLayout = {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        };

        // Only update if layout actually changed
        if (
          widget.layout.x !== newLayout.x ||
          widget.layout.y !== newLayout.y ||
          widget.layout.w !== newLayout.w ||
          widget.layout.h !== newLayout.h
        ) {
          widgetsCollection.update(widget.id, (draft) => {
            draft.layout = newLayout;
          });
        }
      }
    }
  };

  const handleDelete = () => {
    if (
      globalThis.confirm(
        `Are you sure you want to delete "${dashboard.name}"? This will also delete all widgets in this dashboard.`
      )
    ) {
      dashboardsCollection.delete(dashboard.id);
      navigate({ to: `/dashboards` });
    }
  };

  const handleSaveName = () => {
    if (editingName !== null && editingName !== dashboard.name) {
      dashboardsCollection.update(dashboard.id, (draft) => {
        draft.name = editingName;
      });
    }
    setEditingName(null);
  };

  const handleSaveDescription = () => {
    if (
      editingDescription !== null &&
      editingDescription !== (dashboard.description ?? ``)
    ) {
      dashboardsCollection.update(dashboard.id, (draft) => {
        draft.description = editingDescription || null;
      });
    }
    setEditingDescription(null);
  };

  const handleAddWidget = () => {
    if (!widgetTitle.trim()) return;

    // Calculate next available position
    const maxY = Math.max(
      0,
      ...(widgets?.map((w) => w.layout.y + w.layout.h) ?? [0])
    );

    // Use small negative temp ID that will be replaced by server
    // Random between -1000000 and -1 to avoid conflicts
    const tempId = -Math.floor(Math.random() * 1000000) - 1;

    widgetsCollection.insert({
      id: tempId,
      dashboard_id: Number.parseInt(dashboardId, 10),
      type: widgetType,
      title: widgetTitle,
      config: {},
      layout: {
        x: 0,
        y: maxY,
        w: 6,
        h: 4,
        minW: 2,
        minH: 2,
      },
      data_source: {},
      created_at: new Date(),
    });

    // Reset form
    setWidgetTitle("");
    setWidgetType("chart");
    setShowWidgetSheet(false);
  };

  const gridLayout: Layout =
    widgets?.map((w) => ({
      i: w.id.toString(),
      x: w.layout.x,
      y: w.layout.y,
      w: w.layout.w,
      h: w.layout.h,
      minW: w.layout.minW,
      maxW: w.layout.maxW,
      minH: w.layout.minH,
      maxH: w.layout.maxH,
      static: !canEdit || w.layout.static,
    })) ?? [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {dashboard.name}
          </h1>
          {dashboard.description && (
            <p className="text-muted-foreground">{dashboard.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditSheet(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWidgetSheet(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </>
          )}
        </div>
      </div>

      {widgets && widgets.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No widgets yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first widget to start visualizing data.
            </p>
            {canEdit && (
              <Button onClick={() => setShowWidgetSheet(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div ref={containerRef} className="w-full">
          <GridLayout
            className="layout"
            layout={gridLayout}
            gridConfig={{ cols: 12, rowHeight: 60 }}
            width={containerWidth}
            onLayoutChange={handleLayoutChange}
            dragConfig={{
              enabled: canEdit,
              handle: ".drag-handle",
            }}
            resizeConfig={{
              enabled: canEdit,
              handles: ["se"],
              handleComponent: (_axis, ref) => (
                <Button
                  ref={ref as React.Ref<HTMLButtonElement>}
                  variant="ghost"
                  className="absolute bottom-px right-px w-5 h-5 p-0 rounded-full cursor-se-resize flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                >
                  <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              ),
            }}
          >
            {widgets?.map((widget) => (
              <div
                key={widget.id.toString()}
                //className="bg-card border rounded-lg"
              >
                <WidgetCard
                  title={widget.title}
                  canEdit={canEdit}
                  onDelete={() => {
                    if (
                      globalThis.confirm(`Delete widget "${widget.title}"?`)
                    ) {
                      widgetsCollection.delete(widget.id);
                    }
                  }}
                >
                  {widget.type === "chart" ? (
                    <ChartWidget
                      title={widget.title}
                      config={widget.config}
                      dataSource={widget.data_source}
                    />
                  ) : widget.type === "table" ? (
                    <TableWidget
                      title={widget.title}
                      config={widget.config}
                      dataSource={widget.data_source}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Unknown widget type: {widget.type}
                    </div>
                  )}
                </WidgetCard>
              </div>
            ))}
          </GridLayout>
        </div>
      )}

      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent hideOverlay className="overflow-y-auto px-6">
          <SheetHeader>
            <SheetTitle>Edit Dashboard</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editingName ?? dashboard.name}
                onChange={(e) => setEditingName(e.target.value)}
                onFocus={() => {
                  if (editingName === null) setEditingName(dashboard.name);
                }}
                onBlur={handleSaveName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editingDescription ?? dashboard.description ?? ``}
                onChange={(e) => setEditingDescription(e.target.value)}
                onFocus={() => {
                  if (editingDescription === null)
                    setEditingDescription(dashboard.description ?? ``);
                }}
                onBlur={handleSaveDescription}
              />
            </div>

            <div className="space-y-2">
              <Label>Owner</Label>
              <div className="text-sm">
                {owner?.name ?? owner?.email ?? `Unknown`}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="members">Members</Label>
              <Combobox
                value={dashboard.shared_user_ids}
                // biome-ignore lint/suspicious/noExplicitAny: Base UI types need fixing
                onValueChange={(value: any) => {
                  if (Array.isArray(value)) {
                    dashboardsCollection.update(dashboard.id, (draft) => {
                      draft.shared_user_ids = value;
                    });
                  }
                }}
                multiple
              >
                <ComboboxChips ref={comboboxAnchor}>
                  {/* Selected member chips */}
                  {dashboard.shared_user_ids.map((userId) => {
                    const user = users?.find((u) => u.id === userId);
                    if (!user) return null;
                    return (
                      <ComboboxChip key={userId}>
                        {user.name ?? user.email}
                      </ComboboxChip>
                    );
                  })}
                  <ComboboxChipsInput placeholder="Add members..." />
                </ComboboxChips>
                <ComboboxContent anchor={comboboxAnchor}>
                  <ComboboxList>
                    {users?.filter(
                      (u) =>
                        u.id !== dashboard.owner_id &&
                        !dashboard.shared_user_ids.includes(u.id)
                    ).length === 0 ? (
                      <ComboboxEmpty>No users found</ComboboxEmpty>
                    ) : (
                      users
                        ?.filter(
                          (u) =>
                            u.id !== dashboard.owner_id &&
                            !dashboard.shared_user_ids.includes(u.id)
                        )
                        .map((user) => (
                          <ComboboxItem key={user.id} value={user.id}>
                            {user.name ?? user.email}
                          </ComboboxItem>
                        ))
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div className="space-y-2">
              <Label>Editors (can modify widgets)</Label>
              <div className="space-y-2">
                {dashboard.shared_user_ids.map((userId) => {
                  const user = usersMap.get(userId);
                  const isEditor = dashboard.editor_ids.includes(userId);
                  return (
                    <div key={userId} className="flex items-center gap-2">
                      <Checkbox
                        id={`editor-${userId}`}
                        checked={isEditor}
                        onCheckedChange={(checked) => {
                          dashboardsCollection.update(dashboard.id, (draft) => {
                            if (checked) {
                              if (!draft.editor_ids.includes(userId)) {
                                draft.editor_ids = [
                                  ...draft.editor_ids,
                                  userId,
                                ];
                              }
                            } else {
                              draft.editor_ids = draft.editor_ids.filter(
                                (id) => id !== userId
                              );
                            }
                          });
                        }}
                      />
                      <Label
                        htmlFor={`editor-${userId}`}
                        className="text-sm cursor-pointer"
                      >
                        {user?.name ?? user?.email ?? `Unknown`}
                      </Label>
                    </div>
                  );
                })}
                {dashboard.shared_user_ids.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Add members first to grant editor permissions
                  </p>
                )}
              </div>
            </div>

            {dashboard.owner_id === session?.user.id && (
              <div className="pt-6 border-t">
                <div className="space-y-2">
                  <Label className="text-destructive">Danger Zone</Label>
                  <p className="text-sm text-muted-foreground">
                    Deleting this dashboard will also remove all its widgets.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showWidgetSheet} onOpenChange={setShowWidgetSheet}>
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
                onValueChange={(value: "chart" | "table") =>
                  setWidgetType(value)
                }
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
    </div>
  );
}
