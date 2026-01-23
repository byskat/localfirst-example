import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import GridLayout from "react-grid-layout";
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
  const comboboxAnchor = useComboboxAnchor();

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

  const handleLayoutChange = (layout: GridLayout.Layout[]) => {
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

  const gridLayout: GridLayout.Layout[] =
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
              <Button variant="outline" size="sm">
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <GridLayout
          className="layout"
          layout={gridLayout}
          cols={12}
          rowHeight={60}
          width={1200}
          onLayoutChange={handleLayoutChange}
          isDraggable={canEdit}
          isResizable={canEdit}
        >
          {widgets?.map((widget) => (
            <div
              key={widget.id.toString()}
              className="bg-card border rounded-lg"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{widget.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Widget type: {widget.type}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </GridLayout>
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
    </div>
  );
}
