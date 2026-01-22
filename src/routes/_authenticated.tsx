import { useLiveQuery } from "@tanstack/react-db";
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  Atom,
  ChevronRight,
  ListTodo,
  LogOut,
  Monitor,
  Moon,
  Plus,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/use-theme";
import { authClient, authStateCollection } from "@/lib/auth-client";
import { projectCollection } from "@/lib/collections";

export const Route = createFileRoute(`/_authenticated`)({
  ssr: false, // Disable SSR - run beforeLoad only on client
  component: AuthenticatedLayout,
  beforeLoad: async () => {
    if (
      authStateCollection.get(`auth`) &&
      authStateCollection.get(`auth`)?.session.expiresAt > new Date()
    ) {
      return authStateCollection.get(`auth`)!;
    } else {
      const result = await authClient.getSession();
      if (result.data) {
        authStateCollection.insert({ id: `auth`, ...result.data });
      }
      return result.data;
    }
  },
  errorComponent: ({ error }) => {
    const ErrorComponent = () => {
      const { data: session } = authClient.useSession();

      // Only redirect to login if user is not authenticated
      if (!session && typeof window !== `undefined`) {
        window.location.href = `/login`;
        return null;
      }

      // For other errors, render an error message
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">
              {error?.message || `An unexpected error occurred`}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      );
    };

    return <ErrorComponent />;
  },
});

function AuthenticatedLayout() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const activeProjectId = params.projectId;
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState(``);

  const { data: projects, isLoading } = useLiveQuery((q) =>
    q.from({ projectCollection })
  );

  // Create an initial default project if the user doesn't yet have any.
  useEffect(() => {
    if (session && projects && !isLoading) {
      const hasProject = projects.length > 0;
      if (!hasProject) {
        projectCollection.insert({
          id: Math.floor(Math.random() * 100000),
          name: `Default`,
          description: `Default project`,
          owner_id: session.user.id,
          shared_user_ids: [],
          created_at: new Date(),
        });
      }
    }
  }, [session, projects, isLoading]);

  const handleLogout = async () => {
    await authClient.signOut();
    navigate({ to: `/login` });
  };

  const handleCreateProject = () => {
    if (newProjectName.trim() && session) {
      projectCollection.insert({
        id: Math.floor(Math.random() * 100000),
        name: newProjectName.trim(),
        description: ``,
        owner_id: session.user.id,
        shared_user_ids: [],
        created_at: new Date(),
      });
      setNewProjectName(``);
      setShowNewProjectForm(false);
    }
  };

  if (isPending) {
    return null;
  }

  if (!session) {
    return null;
  }

  return (
    <SidebarProvider>
      <AuthenticatedSidebar
        session={session}
        projects={projects}
        activeProjectId={activeProjectId}
        handleLogout={handleLogout}
        showNewProjectForm={showNewProjectForm}
        setShowNewProjectForm={setShowNewProjectForm}
        newProjectName={newProjectName}
        setNewProjectName={setNewProjectName}
        handleCreateProject={handleCreateProject}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                {activeProjectId && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {projects.find(
                          (p) => p.id.toString() === activeProjectId
                        )?.name || "Project"}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-4">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AuthenticatedSidebar({
  session,
  projects,
  activeProjectId,
  handleLogout,
  showNewProjectForm,
  setShowNewProjectForm,
  newProjectName,
  setNewProjectName,
  handleCreateProject,
}: {
  session: {
    user: {
      email: string;
      id: string;
    };
  };
  projects: Array<{
    id: number;
    name: string;
  }>;
  activeProjectId: string | undefined;
  handleLogout: () => void;
  showNewProjectForm: boolean;
  setShowNewProjectForm: (show: boolean) => void;
  newProjectName: string;
  setNewProjectName: (name: string) => void;
  handleCreateProject: () => void;
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Atom className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Localfirst</span>
                  <span className="truncate text-xs">Projects</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      render={<SidebarMenuButton tooltip="Projects" />}
                    >
                      <ListTodo />
                      <span>Projects</span>
                      <ChevronRight className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                    <SidebarMenuAction
                      onClick={() => setShowNewProjectForm(true)}
                    >
                      <Plus />
                      <span className="sr-only">Add Project</span>
                    </SidebarMenuAction>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {projects.map((project) => (
                          <SidebarMenuSubItem key={project.id}>
                            <SidebarMenuSubButton
                              render={
                                <Link
                                  to="/project/$projectId"
                                  params={{ projectId: project.id.toString() }}
                                />
                              }
                              isActive={
                                activeProjectId === project.id.toString()
                              }
                            >
                              <span className="truncate">{project.name}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              {isCollapsed ? (
                <SidebarMenuButton onClick={handleLogout} tooltip="Sign out">
                  <LogOut className="h-4 w-4" />
                </SidebarMenuButton>
              ) : (
                <div className="px-2 py-2 space-y-2">
                  <div className="text-sm text-muted-foreground truncate">
                    {session.user.email}
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Sign out
                  </Button>
                </div>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <Dialog open={showNewProjectForm} onOpenChange={setShowNewProjectForm}>
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
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
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
            <Button
              variant="outline"
              onClick={() => setShowNewProjectForm(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      title={`Theme: ${theme}`}
    >
      <Icon className="h-5 w-5" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
