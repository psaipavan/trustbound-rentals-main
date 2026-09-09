import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CalendarDays, Plus, Send } from "lucide-react";
import { DashboardShell, DashboardStat } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/session";
import { listManagedProperties } from "@/lib/properties/service";
import { useOwnerInterestsQuery, useVisitsQuery } from "@/lib/workflow/query";

export const Route = createFileRoute("/dashboard/agent")({
  head: () => ({
    meta: [
      { title: "Agent dashboard — Bricxley" },
      {
        name: "description",
        content: "Manage client interests, transparent listings and visits on Bricxley.",
      },
    ],
  }),
  component: AgentDashboard,
});

function firstName(value: string | undefined) {
  return value?.trim().split(/\s+/)[0] || "there";
}

function AgentDashboard() {
  const { actor } = useSession();
  const interests = useOwnerInterestsQuery(actor);
  const visits = useVisitsQuery(actor);
  const managedProperties = useQuery({
    queryKey: ["managed-properties", actor?.id],
    queryFn: () => listManagedProperties(actor!),
    enabled: actor?.role === "agent",
  });
  const mine = managedProperties.data ?? [];
  const upcomingVisits = (visits.data ?? []).filter(
    (item) => item.status === "REQUESTED" || item.status === "CONFIRMED",
  ).length;

  return (
    <DashboardShell
      role="agent"
      title={`Good morning, ${firstName(actor?.displayName)}! 👋`}
      subtitle="Manage your clients and listings."
      action={
        <Button asChild>
          <Link to="/list-property">
            <Plus className="h-4 w-4" aria-hidden /> Add Listing
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <DashboardStat
            label="Active Listings"
            value={mine.filter((property) => property.status === "PUBLISHED").length}
            icon={Building2}
          />
          <DashboardStat
            label="Client Interests"
            value={(interests.data ?? []).length}
            icon={Send}
          />
          <DashboardStat label="Upcoming Visits" value={upcomingVisits} icon={CalendarDays} />
        </div>

        <section className="surface-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">My Listings</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Agent listings always show brokerage before a tenant connects.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/owner/properties">View all</Link>
            </Button>
          </div>

          {managedProperties.isPending ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 2 }, (_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : mine.length ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {mine.slice(0, 4).map((property) => (
                <li key={property.id} className="rounded-xl border border-border bg-background p-4">
                  <span className="text-xs font-bold uppercase tracking-wide text-primary">
                    Agent listing
                  </span>
                  <p className="mt-2 truncate font-semibold">{property.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {property.locality} · ₹{property.monthlyRent.toLocaleString("en-IN")} / month
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Your agent listings will appear here once you add them.
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
