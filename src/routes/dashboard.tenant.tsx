import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Heart, Search, Send } from "lucide-react";
import { DashboardShell, DashboardStat } from "@/components/dashboard/DashboardShell";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyCardSkeleton } from "@/components/property/PropertyCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { properties } from "@/data/properties";
import { useSession } from "@/lib/auth/session";
import { useSaved } from "@/lib/saved-store";
import { useTenantInterestsQuery, useVisitsQuery } from "@/lib/workflow/query";

export const Route = createFileRoute("/dashboard/tenant")({
  head: () => ({
    meta: [
      { title: "Tenant dashboard — Bricxley" },
      {
        name: "description",
        content: "Saved homes, interests and visits in one private Bricxley workspace.",
      },
    ],
  }),
  component: TenantDashboard,
});

function firstName(value: string | undefined) {
  return value?.trim().split(/\s+/)[0] || "there";
}

function TenantDashboard() {
  const { actor } = useSession();
  const navigate = useNavigate({ from: "/dashboard/tenant" });
  const { saved, isLoading: savedLoading } = useSaved();
  const [searchQuery, setSearchQuery] = useState("");
  const interests = useTenantInterestsQuery(actor);
  const visits = useVisitsQuery(actor);
  const activeInterests = (interests.data ?? []).filter(
    (item) => item.status === "SUBMITTED" || item.status === "ACCEPTED",
  ).length;
  const upcomingVisits = (visits.data ?? []).filter(
    (item) => item.status === "REQUESTED" || item.status === "CONFIRMED",
  ).length;
  const recommendations = properties
    .filter((property) => property.status === "available")
    .slice(0, 3);

  const searchHomes = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void navigate({
      to: "/rent",
      search: searchQuery.trim() ? { q: searchQuery.trim() } : {},
    });
  };

  return (
    <DashboardShell
      role="tenant"
      title={`Good morning, ${firstName(actor?.displayName)}! 👋`}
      subtitle="Find your next home today."
    >
      <div className="space-y-6">
        <form
          className="surface-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center"
          onSubmit={searchHomes}
        >
          <Search
            className="ml-1 hidden h-4 w-4 shrink-0 text-muted-foreground sm:block"
            aria-hidden
          />
          <Input
            aria-label="Search for a home"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by location, society or landmark..."
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button type="submit" className="shrink-0">
            Search
          </Button>
        </form>
        <div className="grid gap-3 sm:grid-cols-3">
          <DashboardStat label="Saved Homes" value={saved.length} icon={Heart} />
          <DashboardStat label="Interests" value={activeInterests} icon={Send} />
          <DashboardStat label="Upcoming Visits" value={upcomingVisits} icon={CalendarDays} />
        </div>

        <section className="surface-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Recommended for You</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A compact shortlist of verified homes to explore next.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/rent">View all</Link>
            </Button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {savedLoading || interests.isPending || visits.isPending
              ? Array.from({ length: 3 }, (_, index) => <PropertyCardSkeleton key={index} />)
              : recommendations.map((property) => (
                  <PropertyCard key={property.id} property={property} compact />
                ))}
          </div>
        </section>

        {interests.isError || visits.isError ? (
          <section className="surface-card p-5 text-sm text-muted-foreground">
            Some dashboard updates could not be loaded. Refresh the page to try again.
          </section>
        ) : null}
      </div>
    </DashboardShell>
  );
}
