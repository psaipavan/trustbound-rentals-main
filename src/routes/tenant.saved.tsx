import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useSaved } from "@/lib/saved-store";
import { properties } from "@/data/properties";

export const Route = createFileRoute("/tenant/saved")({
  head: () => ({ meta: [{ title: "Saved homes — Bricxley" }] }),
  component: TenantSavedHomes,
});

function TenantSavedHomes() {
  const { saved, isLoading } = useSaved();
  const savedProperties = properties.filter((property) => saved.includes(property.id));
  return (
    <DashboardShell
      role="tenant"
      title="Saved Homes"
      subtitle="Compare your shortlist and send interest when you’re ready."
      action={
        <Button asChild variant="outline">
          <Link to="/rent">Find more homes</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading saved homes…</p>
        ) : savedProperties.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {savedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} compact />
            ))}
          </div>
        ) : (
          <div className="surface-card border-dashed p-10 text-center">
            <Heart className="mx-auto h-6 w-6 text-primary" aria-hidden />
            <h2 className="mt-3 font-bold">No saved homes yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore verified rentals and save the homes you want to revisit.
            </p>
            <Button asChild className="mt-5">
              <Link to="/rent">Explore homes</Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
