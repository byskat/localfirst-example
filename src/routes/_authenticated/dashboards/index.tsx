import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardsCollection, usersCollection } from "@/lib/collections";

export const Route = createFileRoute(`/_authenticated/dashboards/`)({
  loader: async () => {
    await Promise.all([
      dashboardsCollection.preload(),
      usersCollection.preload(),
    ]);
  },
  component: DashboardsList,
});

function DashboardsList() {
  const { data: dashboards } = useLiveQuery(
    (q) => q.from({ dashboardsCollection }),
    []
  );

  const { data: users } = useLiveQuery((q) => q.from({ usersCollection }), []);

  // Sort dashboards by created_at descending (newest first)
  const sortedDashboards = dashboards
    ? [...dashboards].sort(
        (a, b) => b.created_at.getTime() - a.created_at.getTime()
      )
    : [];

  const usersMap = new Map(users?.map((u) => [u.id, u.name ?? u.email]) ?? []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboards</h1>
          <p className="text-muted-foreground">
            Create and manage your custom dashboards
          </p>
        </div>
      </div>

      {sortedDashboards.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No dashboards yet</CardTitle>
            <CardDescription>
              Create your first dashboard to start visualizing your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Dashboards allow you to create custom views with charts and tables
              to visualize your project data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedDashboards.map((dashboard) => (
            <Link
              key={dashboard.id}
              to="/dashboard/$dashboardId"
              params={{ dashboardId: dashboard.id.toString() }}
            >
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="line-clamp-1">
                    {dashboard.name}
                  </CardTitle>
                  {dashboard.description && (
                    <CardDescription className="line-clamp-2">
                      {dashboard.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <div>
                      Owner: {usersMap.get(dashboard.owner_id) ?? `Unknown`}
                    </div>
                    {dashboard.shared_user_ids.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {dashboard.shared_user_ids.length} member
                          {dashboard.shared_user_ids.length !== 1 ? `s` : ``}
                        </Badge>
                      </div>
                    )}
                    {dashboard.editor_ids.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {dashboard.editor_ids.length} editor
                          {dashboard.editor_ids.length !== 1 ? `s` : ``}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
