import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Dashboard } from "@/db/schema";
import type { User } from "@/db/auth-schema";
import { dashboardsCollection } from "@/lib/collections";

interface EditDashboardSheetProps {
  dashboard: Dashboard;
  users: User[];
  owner: User | undefined;
  usersMap: Map<string, User>;
  isOwner: boolean;
  onDelete: () => void;
}

export function EditDashboardSheet({
  dashboard,
  users,
  owner,
  usersMap,
  isOwner,
  onDelete,
}: Readonly<EditDashboardSheetProps>) {
  const [open, setOpen] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<string | null>(
    null
  );
  const comboboxAnchor = useComboboxAnchor();

  const handleSaveName = () => {
    if (editingName !== null && editingName !== dashboard.name) {
      dashboardsCollection.update(dashboard.id, (draft) => {
        draft.name = editingName;
      });
    }
  };

  const handleSaveDescription = () => {
    if (
      editingDescription !== null &&
      editingDescription !== dashboard.description
    ) {
      dashboardsCollection.update(dashboard.id, (draft) => {
        draft.description = editingDescription;
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditingName(null);
      setEditingDescription(null);
    }
    setOpen(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" title="Edit dashboard">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
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
              value={editingDescription ?? dashboard.description ?? ""}
              onChange={(e) => setEditingDescription(e.target.value)}
              onFocus={() => {
                if (editingDescription === null)
                  setEditingDescription(dashboard.description ?? "");
              }}
              onBlur={handleSaveDescription}
            />
          </div>

          <div className="space-y-2">
            <Label>Owner</Label>
            <div className="text-sm">
              {owner?.name ?? owner?.email ?? "Unknown"}
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
                              draft.editor_ids = [...draft.editor_ids, userId];
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
                      {user?.name ?? user?.email ?? "Unknown"}
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

          {isOwner && (
            <div className="pt-6 border-t">
              <div className="space-y-2">
                <Label className="text-destructive">Danger Zone</Label>
                <p className="text-sm text-muted-foreground">
                  Deleting this dashboard will also remove all its widgets.
                </p>
                <Button
                  variant="destructive"
                  onClick={onDelete}
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
  );
}
