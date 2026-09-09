import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CalendarDays, Plus, Send } from "lucide-react";
import { DashboardShell, DashboardStat } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/session";
import { listManagedProperties } from "@/lib/properties/service";
import { useOwnerInterestsQuery, useVisitsQuery } from "@/lib/workflow/query";

export const Route = createFileRoute("/dashboard/owner")({
  head: () => ({
    meta: [
      { title: "Owner dashboard — Bricxley" },
      {
        name: "description",
        content: "Manage properties, tenant interests and visits from Bricxley.",
      },
    ],
  }),
  component: OwnerDashboard,
});

function firstName(value: string | undefined) {
  return value?.trim().split(/\s+/)[0] || "there";
}

function OwnerDashboard() {
  const { actor } = useSession();
  const interests = useOwnerInterestsQuery(actor);
  const visits = useVisitsQuery(actor);
  const managedProperties = useQuery({
    queryKey: ["managed-properties", actor?.id],
    queryFn: () => listManagedProperties(actor!),
    enabled: actor?.role === "owner",
  });
  const mine = managedProperties.data ?? [];
  const newInterests = (interests.data ?? []).filter((item) => item.status === "SUBMITTED");
  const upcomingVisits = (visits.data ?? []).filter(
    (item) => item.status === "REQUESTED" || item.status === "CONFIRMED",
  ).length;

  return (
    <DashboardShell
      role="owner"
      title={`Welcome back, ${firstName(actor?.displayName)}! 👋`}
      subtitle="Manage your properties and tenant interests."
      action={
        <Button asChild>
          <Link to="/list-property">
            <Plus className="h-4 w-4" aria-hidden /> Add Property
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <DashboardStat
            label="Active Properties"
            value={mine.filter((property) => property.status === "PUBLISHED").length}
            icon={Building2}
          />
          <DashboardStat label="Interests" value={(interests.data ?? []).length} icon={Send} />
          <DashboardStat label="Upcoming Visits" value={upcomingVisits} icon={CalendarDays} />
        </div>

        <section className="surface-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Recent Interests</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Review tenant requests without exposing private contact details.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/owner/interests">View all</Link>
            </Button>
          </div>

          {interests.isPending ? (
            <div className="mt-5 grid gap-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : newInterests.length ? (
            <ul className="mt-5 divide-y divide-border rounded-xl border border-border">
              {newInterests.slice(0, 4).map((interest) => (
                <li
                  key={interest.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {interest.tenantName.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{interest.tenantName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        Move-in{" "}
                        {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                          new Date(interest.moveInDate),
                        )}
                      </p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/owner/interests">View</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No tenant interests yet. Add a property to start receiving qualified requests.
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
