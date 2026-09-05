import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProperty } from "@/data/properties";
import { dashboardForRole, useSession } from "@/lib/auth/session";
import { useVisitsQuery } from "@/lib/workflow/query";
import type { Visit } from "@/lib/workflow/types";

export const Route = createFileRoute("/tenant/visits")({
  component: TenantVisits,
});

function isUpcoming(visit: Visit) {
  return (
    new Date(visit.scheduledAt).getTime() >= Date.now() &&
    (visit.status === "REQUESTED" || visit.status === "CONFIRMED")
  );
}

function VisitList({ visits }: { visits: Visit[] }) {
  return (
    <ul className="space-y-3">
      {visits.map((visit) => {
        const property = getProperty(visit.propertyId);
        const date = new Intl.DateTimeFormat("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(visit.scheduledAt));
        return (
          <li key={visit.id} className="surface-card flex items-start gap-3 p-4">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
              <h2 className="truncate font-bold">{property?.title ?? "Property unavailable"}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" aria-hidden /> {date}
              </p>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">
                {visit.status.replace("_", " ")}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function TenantVisits() {
  const { actor, isReady } = useSession();
  const navigate = useNavigate({ from: "/tenant/visits" });
  const visits = useVisitsQuery(actor);

  useEffect(() => {
    if (!isReady) return;
    if (!actor) {
      void navigate({ to: "/auth", search: { redirect: "/tenant/visits" } });
      return;
    }
    if (actor.role !== "tenant") void navigate({ to: dashboardForRole(actor.role) });
  }, [actor, isReady, navigate]);

  if (!isReady || !actor || actor.role !== "tenant") {
    return (
      <div className="container-page py-12 text-sm text-muted-foreground">Loading visits…</div>
    );
  }
  if (visits.isPending) {
    return (
      <div className="container-page py-12 text-sm text-muted-foreground">Loading visits…</div>
    );
  }
  if (visits.isError) {
    return (
      <div className="container-page py-12">
        <p className="text-muted-foreground">We couldn’t load your visits.</p>
        <Button variant="outline" className="mt-4" onClick={() => void visits.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const allVisits = visits.data ?? [];
  const upcoming = allVisits.filter(isUpcoming);
  const past = allVisits.filter((visit) => !isUpcoming(visit));

  return (
    <div className="container-page py-10 sm:py-12">
      <h1 className="text-2xl font-extrabold">Visits</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your requested and confirmed home visits.
      </p>
      {allVisits.length === 0 ? (
        <div className="mt-8 surface-card p-6">
          <p className="text-muted-foreground">No visits are scheduled yet.</p>
          <Button asChild className="mt-4">
            <Link to="/rent">Find a Home</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-lg font-bold">Upcoming</h2>
            {upcoming.length ? (
              <VisitList visits={upcoming} />
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming visits.</p>
            )}
          </section>
          <section>
            <h2 className="mb-3 text-lg font-bold">Past</h2>
            {past.length ? (
              <VisitList visits={past} />
            ) : (
              <p className="text-sm text-muted-foreground">No past visits.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
