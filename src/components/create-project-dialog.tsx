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

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [projectName, setProjectName] = useState("");

  const handleCreateProject = async () => {
    if (projectName.trim() && session) {
      const result = await trpc.projects.create.mutate({
        name: projectName.trim(),
        description: ``,
        owner_id: session.user.id,
        shared_user_ids: [],
      });
      setProjectName("");
      onOpenChange(false);

      navigate({
        to: `/project/$projectId`,
        params: { projectId: result.item.id.toString() },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to organize your todos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateProject();
                }
              }}
              placeholder="Project name"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateProject}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
