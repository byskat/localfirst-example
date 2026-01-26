import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderKanban, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute(`/_authenticated/`)({
  component: Index,
  ssr: false,
  beforeLoad: async () => {
    const res = await authClient.getSession();
    if (!res.data?.session) {
      throw redirect({
        to: `/login`,
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can
          // potentially lag behind the actual current location)
          redirect: location.href,
        },
      });
    }
  },
});

function Index() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome</h1>
        <p className="text-muted-foreground">Choose where you'd like to go</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 max-w-2xl">
        <Link to="/projects">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                Projects
              </CardTitle>
              <CardDescription>Manage your projects and todos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and organize all your projects in one place
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboards">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Dashboards
              </CardTitle>
              <CardDescription>View your custom dashboards</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access dashboards with charts and visualizations
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
