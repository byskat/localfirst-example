import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Todo } from "@/db/schema";
import { authClient } from "@/lib/auth-client";
import {
  projectCollection,
  todoCollection,
  usersCollection,
} from "@/lib/collections";
import { useCollectionPersistence } from "@/lib/use-collection-persistence";

export const Route = createFileRoute(`/_authenticated/project/$projectId`)({
  component: ProjectPage,
  ssr: false,
  loader: async () => {
    await Promise.all([
      projectCollection.preload(),
      todoCollection.preload(),
      usersCollection.preload(),
    ]);
    return null;
  },
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [newTodoText, setNewTodoText] = useState(``);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<string | null>(
    null
  );
  const comboboxAnchor = useComboboxAnchor();

  // Enable IndexedDB persistence
  useCollectionPersistence(projectCollection);
  useCollectionPersistence(todoCollection);
  useCollectionPersistence(usersCollection);

  const { data: todos } = useLiveQuery(
    (q) =>
      q
        .from({ todoCollection })
        .where(({ todoCollection }) =>
          eq(todoCollection.project_id, Number.parseInt(projectId, 10))
        )
        .orderBy(({ todoCollection }) => todoCollection.created_at),
    [projectId]
  );

  const { data: users } = useLiveQuery((q) =>
    q.from({ users: usersCollection })
  );

  const { data: projects } = useLiveQuery(
    (q) =>
      q
        .from({ projectCollection })
        .where(({ projectCollection }) =>
          eq(projectCollection.id, Number.parseInt(projectId, 10))
        ),
    [projectId]
  );
  const project = projects[0];

  const [deleteProjectDialog, confirmDeleteProject] = useConfirmDialog({
    title: "Delete Project",
    description: `Are you sure you want to delete "${project?.name}"? This action cannot be undone.`,
    confirmLabel: "Delete",
    onConfirm: () => {
      if (project) {
        projectCollection.delete(project.id);
        setShowEditSheet(false);
        navigate({ to: "/" });
      }
    },
  });

  const addTodo = () => {
    if (newTodoText.trim() && session) {
      todoCollection.insert({
        user_id: session.user.id,
        id: Math.floor(Math.random() * 100000),
        text: newTodoText.trim(),
        completed: false,
        project_id: Number.parseInt(projectId, 10),
        user_ids: [],
        created_at: new Date(),
      });
      setNewTodoText(``);
    }
  };

  const toggleTodo = (todo: Todo) => {
    todoCollection.update(todo.id, (draft) => {
      draft.completed = !draft.completed;
    });
  };

  const deleteTodo = (id: number) => {
    todoCollection.delete(id);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Card>
          <CardContent>
            <p className="text-muted-foreground">Project not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <CardTitle>{project.name}</CardTitle>
              <CardDescription className="min-h-5">
                {project.description || `No description`}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditSheet(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={(e) => e.key === `Enter` && addTodo()}
              placeholder="Add a new todo..."
              className="flex-1"
            />
            <Button onClick={addTodo}>Add</Button>
          </div>

          <div className="space-y-2">
            {todos?.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo)}
                />

                <Label
                  className={`flex-1 font-normal ${
                    todo.completed ? `line-through! text-muted-foreground!` : ``
                  }`}
                  htmlFor={`todo-${todo.id}`}
                >
                  {todo.text}
                </Label>
                <Button
                  onClick={() => deleteTodo(todo.id)}
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive -my-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {(!todos || todos.length === 0) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No todos yet. Add one above!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent hideOverlay>
          <SheetHeader>
            <SheetTitle>Edit Project</SheetTitle>
            <SheetDescription>
              Changes are saved automatically.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-6 p-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                type="text"
                value={editingName ?? project.name}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => {
                  if (editingName !== null && editingName !== project.name) {
                    projectCollection.update(project.id, (draft) => {
                      draft.name = editingName;
                    });
                  }
                  setEditingName(null);
                }}
                placeholder="Project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Input
                id="project-description"
                type="text"
                value={editingDescription ?? project.description ?? ``}
                onChange={(e) => setEditingDescription(e.target.value)}
                onBlur={() => {
                  if (
                    editingDescription !== null &&
                    editingDescription !== (project.description || ``)
                  ) {
                    projectCollection.update(project.id, (draft) => {
                      draft.description = editingDescription;
                    });
                  }
                  setEditingDescription(null);
                }}
                placeholder="Project description"
              />
            </div>
            <div className="space-y-2">
              <Label>Project Members</Label>
              {session?.user.id === project.owner_id ? (
                <div className="space-y-2">
                  {/* Owner display */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Owner:
                    </span>
                    <span className="bg-muted text-foreground flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap">
                      {users?.find((u) => u.id === project.owner_id)?.name}
                    </span>
                  </div>
                  {/* Member selection combobox */}
                  <Combobox
                    value={project.shared_user_ids}
                    // biome-ignore lint/suspicious/noExplicitAny: Base UI types need fixing
                    onValueChange={(value: any) => {
                      if (Array.isArray(value)) {
                        projectCollection.update(project.id, (draft) => {
                          draft.shared_user_ids = value;
                        });
                      }
                    }}
                    multiple
                  >
                    <ComboboxChips ref={comboboxAnchor}>
                      {/* Selected member chips */}
                      {project.shared_user_ids.map((userId) => {
                        const user = users?.find((u) => u.id === userId);
                        if (!user) return null;
                        return (
                          <ComboboxChip key={userId}>{user.name}</ComboboxChip>
                        );
                      })}
                      <ComboboxChipsInput placeholder="Add members..." />
                    </ComboboxChips>
                    <ComboboxContent anchor={comboboxAnchor}>
                      <ComboboxList>
                        {users?.filter(
                          (u) =>
                            u.id !== project.owner_id &&
                            !project.shared_user_ids.includes(u.id)
                        ).length === 0 ? (
                          <ComboboxEmpty>No users found</ComboboxEmpty>
                        ) : (
                          users
                            ?.filter(
                              (u) =>
                                u.id !== project.owner_id &&
                                !project.shared_user_ids.includes(u.id)
                            )
                            .map((user) => (
                              <ComboboxItem key={user.id} value={user.id}>
                                {user.name}
                              </ComboboxItem>
                            ))
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 min-h-9 p-2 border rounded-md">
                  {/* Owner badge */}
                  <span className="bg-muted text-foreground flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap">
                    {users?.find((u) => u.id === project.owner_id)?.name}
                    <span className="text-xs">(Owner)</span>
                  </span>
                  {/* Shared users */}
                  {project.shared_user_ids.map((userId) => {
                    const user = users?.find((u) => u.id === userId);
                    if (!user) return null;
                    return (
                      <span
                        key={userId}
                        className="bg-muted text-foreground flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap"
                      >
                        {user.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Delete section */}
            {session?.user.id === project.owner_id && (
              <div className="pt-6 border-t">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-destructive">
                    Danger Zone
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Once you delete a project, there is no going back.
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={confirmDeleteProject}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      {deleteProjectDialog}
    </div>
  );
}
