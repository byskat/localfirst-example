import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { Todo } from "@/db/schema";
import { authClient } from "@/lib/auth-client";
import {
  projectCollection,
  todoCollection,
  usersCollection,
} from "@/lib/collections";

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
  const { data: session } = authClient.useSession();
  const [newTodoText, setNewTodoText] = useState(``);

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

  const { data: usersInProjects } = useLiveQuery(
    (q) =>
      q
        .from({ projects: projectCollection })
        .where(({ projects }) =>
          eq(projects.id, Number.parseInt(projectId, 10))
        )
        .fn.select(({ projects }) => ({
          users: projects.shared_user_ids.concat(projects.owner_id),
          owner: projects.owner_id,
        })),
    [projectId]
  );
  const usersInProject = usersInProjects?.[0];

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
          <div className="flex items-center gap-2 group">
            <CardTitle
              className="cursor-pointer hover:text-primary transition-colors flex-1"
              onClick={() => {
                const newName = prompt(`Edit project name:`, project.name);
                if (newName && newName !== project.name) {
                  projectCollection.update(project.id, (draft) => {
                    draft.name = newName;
                  });
                }
              }}
            >
              {project.name}
            </CardTitle>
            <Edit2 className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
          </div>
          <CardDescription
            className="cursor-pointer hover:text-foreground transition-colors min-h-5"
            onClick={() => {
              const newDescription = prompt(
                `Edit project description:`,
                project.description || ``
              );
              if (newDescription !== null) {
                projectCollection.update(project.id, (draft) => {
                  draft.description = newDescription;
                });
              }
            }}
          >
            {project.description || `Click to add description...`}
          </CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle>Project Members</CardTitle>
          <CardDescription>
            Manage who has access to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(session?.user.id === project.owner_id
              ? users
              : users?.filter((user) => usersInProject?.users.includes(user.id))
            )?.map((user) => {
              const isInProject = usersInProject?.users.includes(user.id);
              const isOwner = user.id === usersInProject?.owner;
              const canEditMembership = session?.user.id === project.owner_id;
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  {canEditMembership && (
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={isInProject}
                      onCheckedChange={() => {
                        if (isInProject && !isOwner) {
                          projectCollection.update(project.id, (draft) => {
                            draft.shared_user_ids =
                              draft.shared_user_ids.filter(
                                (id) => id !== user.id
                              );
                          });
                        } else if (!isInProject) {
                          projectCollection.update(project.id, (draft) => {
                            draft.shared_user_ids.push(user.id);
                          });
                        }
                      }}
                      disabled={isOwner}
                    />
                  )}

                  <Label
                    className="flex flex-1 font-normal"
                    htmlFor={`user-${user.id}`}
                  >
                    <span className="flex-1">{user.name}</span>{" "}
                    {isOwner && <Badge>Owner</Badge>}
                  </Label>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
