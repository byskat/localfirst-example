import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDownRight } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { Responsive as ResponsiveGridLayout } from "react-grid-layout";
import type { Layout, LayoutItem } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddWidgetSheet } from "@/components/dashboard/add-widget-sheet";
import { BreakpointToggle } from "@/components/dashboard/breakpoint-toggle";
import { EditDashboardSheet } from "@/components/dashboard/edit-dashboard-sheet";
import { WidgetCard } from "@/components/dashboard/widget-card";
import { authClient } from "@/lib/auth-client";
import {
  dashboardsCollection,
  usersCollection,
  widgetsCollection,
} from "@/lib/collections";
import { useCollectionPersistence } from "@/lib/use-collection-persistence";

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

  // Enable IndexedDB persistence
  useCollectionPersistence(dashboardsCollection);
  useCollectionPersistence(widgetsCollection);
  useCollectionPersistence(usersCollection);

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

  const [containerWidth, setContainerWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth - 300 : 1200
  );
  const [previewBreakpoint, setPreviewBreakpoint] = useState<
    "default" | "mobile" | "tablet" | "desktop"
  >("default");
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    // Initial measurement
    updateWidth();

    if (!containerRef.current) return;

    // Use ResizeObserver to detect size changes (including sidebar toggle)
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
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

  const handleLayoutChange = (
    _currentLayout: Layout,
    allLayouts: Partial<Record<string, Layout>>
  ) => {
    if (!canEdit) return;

    // Update all breakpoints for all widgets
    for (const widget of widgets ?? []) {
      const widgetId = widget.id.toString();
      const newLayout = {
        mobile: allLayouts.mobile?.find(
          (item: LayoutItem) => item.i === widgetId
        ),
        tablet: allLayouts.tablet?.find(
          (item: LayoutItem) => item.i === widgetId
        ),
        desktop: allLayouts.desktop?.find(
          (item: LayoutItem) => item.i === widgetId
        ),
      };

      // Check if any layout changed
      const hasChanges =
        (newLayout.mobile &&
          (widget.layout.mobile.x !== newLayout.mobile.x ||
            widget.layout.mobile.y !== newLayout.mobile.y ||
            widget.layout.mobile.w !== newLayout.mobile.w ||
            widget.layout.mobile.h !== newLayout.mobile.h)) ||
        (newLayout.tablet &&
          (widget.layout.tablet.x !== newLayout.tablet.x ||
            widget.layout.tablet.y !== newLayout.tablet.y ||
            widget.layout.tablet.w !== newLayout.tablet.w ||
            widget.layout.tablet.h !== newLayout.tablet.h)) ||
        (newLayout.desktop &&
          (widget.layout.desktop.x !== newLayout.desktop.x ||
            widget.layout.desktop.y !== newLayout.desktop.y ||
            widget.layout.desktop.w !== newLayout.desktop.w ||
            widget.layout.desktop.h !== newLayout.desktop.h));

      if (hasChanges) {
        widgetsCollection.update(widget.id, (draft) => {
          if (newLayout.mobile) {
            draft.layout.mobile = {
              x: newLayout.mobile.x,
              y: newLayout.mobile.y,
              w: newLayout.mobile.w,
              h: newLayout.mobile.h,
              minW: draft.layout.mobile.minW,
              minH: draft.layout.mobile.minH,
            };
          }
          if (newLayout.tablet) {
            draft.layout.tablet = {
              x: newLayout.tablet.x,
              y: newLayout.tablet.y,
              w: newLayout.tablet.w,
              h: newLayout.tablet.h,
              minW: draft.layout.tablet.minW,
              minH: draft.layout.tablet.minH,
            };
          }
          if (newLayout.desktop) {
            draft.layout.desktop = {
              x: newLayout.desktop.x,
              y: newLayout.desktop.y,
              w: newLayout.desktop.w,
              h: newLayout.desktop.h,
              minW: draft.layout.desktop.minW,
              minH: draft.layout.desktop.minH,
            };
          }
        });
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

  const gridLayouts: Partial<Record<string, Layout>> = {
    mobile:
      widgets?.map((w) => ({
        i: w.id.toString(),
        x: w.layout.mobile.x,
        y: w.layout.mobile.y,
        w: w.layout.mobile.w,
        h: w.layout.mobile.h,
        minW: w.layout.mobile.minW,
        maxW: w.layout.mobile.maxW,
        minH: w.layout.mobile.minH,
        maxH: w.layout.mobile.maxH,
        static: !canEdit || w.layout.mobile.static,
      })) ?? [],
    tablet:
      widgets?.map((w) => ({
        i: w.id.toString(),
        x: w.layout.tablet.x,
        y: w.layout.tablet.y,
        w: w.layout.tablet.w,
        h: w.layout.tablet.h,
        minW: w.layout.tablet.minW,
        maxW: w.layout.tablet.maxW,
        minH: w.layout.tablet.minH,
        maxH: w.layout.tablet.maxH,
        static: !canEdit || w.layout.tablet.static,
      })) ?? [],
    desktop:
      widgets?.map((w) => ({
        i: w.id.toString(),
        x: w.layout.desktop.x,
        y: w.layout.desktop.y,
        w: w.layout.desktop.w,
        h: w.layout.desktop.h,
        minW: w.layout.desktop.minW,
        maxW: w.layout.desktop.maxW,
        minH: w.layout.desktop.minH,
        maxH: w.layout.desktop.maxH,
        static: !canEdit || w.layout.desktop.static,
      })) ?? [],
  };

  // Breakpoint widths for preview
  const breakpointWidths: Record<string, number> = {
    default: containerWidth,
    mobile: 480,
    tablet: 1024,
    desktop: 1536,
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap flex-col md:flex-row">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight">
            {dashboard.name}
          </h1>
          {dashboard.description && (
            <p className="text-muted-foreground">{dashboard.description}</p>
          )}
        </div>
        <div className="flex gap-2 w-full justify-end flex-wrap md:w-auto">
          {canEdit && (
            <>
              <BreakpointToggle
                value={previewBreakpoint}
                onChange={setPreviewBreakpoint}
              />
              <EditDashboardSheet
                dashboard={dashboard}
                users={users ?? []}
                owner={owner}
                usersMap={usersMap}
                isOwner={dashboard.owner_id === session?.user.id}
                onDelete={handleDelete}
              />
              <AddWidgetSheet dashboardId={Number.parseInt(dashboardId, 10)} />
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
              <AddWidgetSheet dashboardId={Number.parseInt(dashboardId, 10)} />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="-mx-6 px-6">
          <div
            ref={containerRef}
            className={
              previewBreakpoint !== "default"
                ? "mx-auto border-2 border-dashed border-primary/30 rounded-lg p-4 bg-muted/20 overflow-x-auto"
                : ""
            }
            style={
              previewBreakpoint !== "default"
                ? { maxWidth: breakpointWidths[previewBreakpoint] }
                : undefined
            }
          >
            <div
              style={
                previewBreakpoint !== "default"
                  ? { width: breakpointWidths[previewBreakpoint] - 32 - 4 }
                  : undefined
              }
            >
              <ResponsiveGridLayout
                className="layout"
                layouts={gridLayouts}
                breakpoints={{ desktop: 1280, tablet: 768, mobile: 0 }}
                cols={{ desktop: 12, tablet: 8, mobile: 12 }}
                rowHeight={60}
                width={
                  previewBreakpoint !== "default"
                    ? breakpointWidths[previewBreakpoint] - 32 - 4
                    : containerWidth
                }
                onLayoutChange={handleLayoutChange}
                margin={[12, 12]}
                containerPadding={[0, 0]}
                dragConfig={{
                  enabled: canEdit,
                  handle: ".drag-handle",
                }}
                resizeConfig={{
                  enabled: canEdit,
                  handles: ["se"],
                  handleComponent: canEdit
                    ? (_axis, ref) => (
                        <Button
                          ref={ref as React.Ref<HTMLButtonElement>}
                          variant="ghost"
                          className="absolute bottom-px right-px w-5 h-5 p-0 rounded-full cursor-se-resize flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                        >
                          <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )
                    : undefined,
                }}
              >
                {widgets?.map((widget) => (
                  <div key={widget.id.toString()}>
                    <WidgetCard
                      widget={widget}
                      canEdit={canEdit}
                      onDelete={() => {
                        if (
                          globalThis.confirm(`Delete widget "${widget.title}"?`)
                        ) {
                          widgetsCollection.delete(widget.id);
                        }
                      }}
                    />
                  </div>
                ))}
              </ResponsiveGridLayout>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
