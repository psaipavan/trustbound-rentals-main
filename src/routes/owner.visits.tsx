import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getProperty } from "@/data/properties";
import { dashboardForRole, useSession } from "@/lib/auth/session";
import {
  useCancelVisitMutation,
  useConfirmVisitMutation,
  useVisitsQuery,
} from "@/lib/workflow/query";

export const Route = createFileRoute("/owner/visits")({
  component: OwnerVisits,
});

function OwnerVisits() {
  const { actor, isReady } = useSession();
  const navigate = useNavigate({ from: "/owner/visits" });
  const visits = useVisitsQuery(actor);
  const confirmVisit = useConfirmVisitMutation(actor);
  const cancelVisit = useCancelVisitMutation(actor);

  useEffect(() => {
    if (!isReady) return;
    if (!actor) {
      void navigate({ to: "/auth", search: { redirect: "/owner/visits" } });
      return;
    }
    if (actor.role !== "owner" && actor.role !== "agent") {
      void navigate({ to: dashboardForRole(actor.role) });
    }
  }, [actor, isReady, navigate]);

  if (
    !isReady ||
    !actor ||
    (actor.role !== "owner" && actor.role !== "agent") ||
    visits.isPending
  ) {
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

  const confirm = async (visitId: string) => {
    try {
      await confirmVisit.mutateAsync(visitId);
      toast.success("Visit confirmed — the tenant has been notified.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't confirm this visit.");
    }
  };

  const cancel = async (visitId: string) => {
    try {
      await cancelVisit.mutateAsync(visitId);
      toast.success("Visit cancelled — the tenant has been notified.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't cancel this visit.");
    }
  };

  const items = visits.data ?? [];
  return (
    <div className="container-page py-10 sm:py-12">
      <h1 className="text-2xl font-extrabold">Visits</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Confirm proposed times and keep each visit connected to its secure chat.
      </p>
      {!items.length ? (
        <div className="mt-8 surface-card p-6 text-muted-foreground">
          Visit requests from matched tenants will appear here.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((visit) => {
            const property = getProperty(visit.propertyId);
            const date = new Intl.DateTimeFormat("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(visit.scheduledAt));
            return (
              <li
                key={visit.id}
                className="surface-card flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5"
              >
                <div className="flex min-w-0 gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0">
                    <h2 className="truncate font-bold">
                      {property?.title ?? "Property unavailable"}
                    </h2>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden /> {date}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">
                      {visit.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
                {visit.status === "REQUESTED" || visit.status === "CONFIRMED" ? (
                  <div className="flex gap-2">
                    {visit.status === "REQUESTED" ? (
                      <Button
                        size="sm"
                        disabled={confirmVisit.isPending || cancelVisit.isPending}
                        onClick={() => void confirm(visit.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Confirm visit
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={confirmVisit.isPending || cancelVisit.isPending}
                      onClick={() => void cancel(visit.id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
