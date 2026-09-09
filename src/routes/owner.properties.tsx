import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2, Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { dashboardForRole, useSession } from "@/lib/auth/session";
import { listManagedProperties } from "@/lib/properties/service";

export const Route = createFileRoute("/owner/properties")({
  head: () => ({ meta: [{ title: "My properties — Bricxley" }] }),
  component: ManagedProperties,
});

function ManagedProperties() {
  const { actor, isReady } = useSession();
  const navigate = useNavigate({ from: "/owner/properties" });
  const listings = useQuery({
    queryKey: ["managed-properties", actor?.id],
    queryFn: () => listManagedProperties(actor!),
    enabled: actor?.role === "owner" || actor?.role === "agent",
  });

  useEffect(() => {
    if (!isReady) return;
    if (!actor) {
      void navigate({ to: "/auth", search: { redirect: "/owner/properties", role: "owner" } });
      return;
    }
    if (actor.role !== "owner" && actor.role !== "agent") {
      void navigate({ to: dashboardForRole(actor.role) });
    }
  }, [actor, isReady, navigate]);

  if (!isReady || !actor || (actor.role !== "owner" && actor.role !== "agent")) {
    return (
      <div className="container-page py-12 text-sm text-muted-foreground">Loading properties…</div>
    );
  }

  const label = actor.role === "agent" ? "My Listings" : "My Properties";
  return (
    <DashboardShell
      role={actor.role}
      title={label}
      subtitle="Keep availability, pricing and brokerage details transparent."
      action={
        <Button asChild>
          <Link to="/list-property">
            <Plus className="h-4 w-4" aria-hidden /> Add Property
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {listings.isPending ? (
          <p className="text-sm text-muted-foreground">Loading listings…</p>
        ) : null}
        {listings.isError ? (
          <div className="surface-card p-6">
            <p className="text-sm text-muted-foreground">We couldn’t load your listings.</p>
            <Button variant="outline" className="mt-4" onClick={() => void listings.refetch()}>
              Try again
            </Button>
          </div>
        ) : null}
        {!listings.isPending && !listings.isError && !listings.data?.length ? (
          <div className="surface-card border-dashed p-10 text-center">
            <Building2 className="mx-auto h-6 w-6 text-primary" aria-hidden />
            <h2 className="mt-3 font-bold">You haven’t listed a property yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a draft and publish once your details are ready.
            </p>
            <Button asChild className="mt-5">
              <Link to="/list-property">Add Property</Link>
            </Button>
          </div>
        ) : null}
        {listings.data?.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.data.map((listing) => (
              <li key={listing.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {actor.role === "agent" ? (
                      <span className="text-xs font-bold uppercase tracking-wide text-primary">
                        Agent listing
                      </span>
                    ) : null}
                    <h2 className="mt-1 truncate font-bold">{listing.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{listing.locality}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                    {listing.status}
                  </span>
                </div>
                <p className="mt-5 text-lg font-extrabold">
                  ₹{listing.monthlyRent.toLocaleString("en-IN")} / mo
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {listing.propertyType} · Brokerage ₹{listing.brokerage.toLocaleString("en-IN")}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </DashboardShell>
  );
}
