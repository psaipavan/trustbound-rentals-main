import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  Clock3,
  Heart,
  MessagesSquare,
  Send,
  UserRound,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import { properties } from "@/data/properties";
import { useSaved } from "@/lib/saved-store";

export const Route = createFileRoute("/dashboard/tenant")({
  head: () => ({
    meta: [
      { title: "Tenant dashboard — In Bound" },
      {
        name: "description",
        content:
          "Track saved homes, inquiries, scheduled visits and secure messages in your In Bound tenant dashboard.",
      },
      { property: "og:title", content: "Tenant dashboard — In Bound" },
      {
        property: "og:description",
        content: "Everything about your rental search, in one place.",
      },
    ],
  }),
  component: TenantDashboard,
});

const sections = [
  {
    key: "saved",
    label: "Saved Properties",
    icon: Heart,
    description: "Homes you’ve shortlisted, ready to compare side by side.",
    items: ["Shortlist", "Compare drawer", "Price change alerts", "Availability alerts"],
  },
  {
    key: "inquiries",
    label: "My Inquiries",
    icon: Send,
    description: "Every home you’ve reached out about and its current status.",
    items: ["Awaiting reply", "Replied", "Visit offered", "Closed"],
  },
  {
    key: "visits",
    label: "Scheduled Visits",
    icon: CalendarCheck,
    description: "Upcoming and past visits, with ₹0 viewing fees always.",
    items: ["Upcoming visits", "Reschedule requests", "Visit history", "Visit notes"],
  },
  {
    key: "messages",
    label: "Messages",
    icon: MessagesSquare,
    description: "Secure In Bound Chat threads with owners and verified agents.",
    items: ["Unread threads", "Owner threads", "Agent threads", "Contact sharing requests"],
  },
  {
    key: "recent",
    label: "Recently Viewed",
    icon: Clock3,
    description: "Pick up where you left off.",
    items: ["Last 7 days", "Last 30 days", "Similar homes", "Localities viewed"],
  },
  {
    key: "profile",
    label: "Profile",
    icon: UserRound,
    description: "Identity, preferences and contact privacy settings.",
    items: ["Identity verification", "Rental preferences", "Contact privacy", "Notifications"],
  },
];

function TenantDashboard() {
  const { saved, setCompareOpen } = useSaved();
  const savedItems = properties.filter((p) => saved.includes(p.id));

  return (
    <DashboardShell
      role="tenant"
      title="Your rental search, organised."
      subtitle="Saved homes, inquiries, visits and secure messages in one place."
      sections={sections}
      aside={
        <section className="surface-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Saved homes</h2>
            {savedItems.length > 0 ? (
              <Button variant="outline" size="sm" onClick={() => setCompareOpen(true)}>
                Compare {savedItems.length}
              </Button>
            ) : null}
          </div>
          {savedItems.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="text-sm text-muted-foreground">
                You haven’t saved any homes yet.
              </p>
              <Button asChild className="mt-4">
                <Link to="/rent">Browse verified rentals</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {savedItems.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </section>
      }
    />
  );
}
