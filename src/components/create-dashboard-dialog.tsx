import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc-client";

interface CreateDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDashboardDialog({
  open,
  onOpenChange,
}: CreateDashboardDialogProps) {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [dashboardName, setDashboardName] = useState("");

  const handleCreateDashboard = async () => {
    if (dashboardName.trim() && session) {
      const result = await trpc.dashboards.create.mutate({
        name: dashboardName.trim(),
        description: ``,
        owner_id: session.user.id,
        shared_user_ids: [],
        editor_ids: [],
      });
      setDashboardName("");
      onOpenChange(false);

      navigate({
        to: `/dashboard/$dashboardId`,
        params: { dashboardId: result.item.id.toString() },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Dashboard</DialogTitle>
          <DialogDescription>
            Add a new dashboard to visualize your data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateDashboard();
                }
              }}
              placeholder="Dashboard name"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateDashboard}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
