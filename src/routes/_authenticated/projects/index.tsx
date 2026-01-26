import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { projectCollection, usersCollection } from "@/lib/collections";
import { useCollectionPersistence } from "@/lib/use-collection-persistence";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { Plus } from "lucide-react";

export const Route = createFileRoute(`/_authenticated/projects/`)({
  loader: async () => {
    await Promise.all([projectCollection.preload(), usersCollection.preload()]);
  },
  component: ProjectsList,
});

function ProjectsList() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Enable IndexedDB persistence
  useCollectionPersistence(projectCollection);
  useCollectionPersistence(usersCollection);

  const { data: projects } = useLiveQuery(
    (q) => q.from({ projectCollection }),
    []
  );

  const { data: users } = useLiveQuery((q) => q.from({ usersCollection }), []);

  // Handle loading state
  if (!projects || !users) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Sort projects by created_at descending (newest first)
  const sortedProjects = [...projects].sort(
    (a, b) => b.created_at.getTime() - a.created_at.getTime()
  );

  const usersMap = new Map(users?.map((u) => [u.id, u.name ?? u.email]) ?? []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and todos
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedProjects.map((project) => (
          <Link
            key={project.id}
            to="/project/$projectId"
            params={{ projectId: project.id.toString() }}
          >
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                {project.description && (
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <div>
                    Owner: {usersMap.get(project.owner_id) ?? `Unknown`}
                  </div>
                  {project.shared_user_ids.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {project.shared_user_ids.length} member
                        {project.shared_user_ids.length !== 1 ? `s` : ``}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* Add New Project Card */}
        <Card
          className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-dashed"
          onClick={() => setShowCreateDialog(true)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Project
            </CardTitle>
            <CardDescription>
              Create a new project to organize your todos
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
