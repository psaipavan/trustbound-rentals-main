import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  BellRing,
  CalendarCheck,
  Home,
  MessagesSquare,
  PlusCircle,
  Send,
  UserRound,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AvailabilityControl } from "@/components/property/AvailabilityControl";
import { properties } from "@/data/properties";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/dashboard/owner")({
  head: () => ({
    meta: [
      { title: "Owner dashboard — In Bound" },
      {
        name: "description",
        content:
          "Manage your listings, inquiries, visits and availability from the In Bound owner dashboard.",
      },
      { property: "og:title", content: "Owner dashboard — In Bound" },
      {
        property: "og:description",
        content: "Find the right tenant without the noise.",
      },
    ],
  }),
  component: OwnerDashboard,
});

const sections = [
  {
    key: "properties",
    label: "My Properties",
    icon: Home,
    description: "Everything you have listed, with verification status.",
    items: ["Published", "Draft", "Pending verification", "Archived"],
  },
  {
    key: "add",
    label: "Add Property",
    icon: PlusCircle,
    description: "Create a new listing with transparent pricing.",
    items: ["Basic details", "Photos", "Pricing & deposit", "Availability"],
  },
  {
    key: "inquiries",
    label: "Inquiries",
    icon: Send,
    description: "Genuine tenant interest, filtered and organised.",
    items: ["New", "Responded", "Visit requested", "Closed"],
  },
  {
    key: "visits",
    label: "Scheduled Visits",
    icon: CalendarCheck,
    description: "Confirm, reschedule or decline visit requests.",
    items: ["Today", "This week", "Awaiting confirmation", "Completed"],
  },
  {
    key: "messages",
    label: "Messages",
    icon: MessagesSquare,
    description: "Secure chat threads — your number stays private.",
    items: ["Unread", "Active threads", "Contact sharing requests", "Archived"],
  },
  {
    key: "analytics",
    label: "Listing Analytics",
    icon: BarChart3,
    description: "How your listing is performing, honestly reported.",
    items: ["Views", "Saves", "Inquiries", "Visit conversion"],
  },
  {
    key: "availability",
    label: "Availability",
    icon: BellRing,
    description: "Keep listings current so renters trust them.",
    items: ["Still available", "Rental confirmed", "Temporarily unavailable", "Reminder settings"],
  },
  {
    key: "profile",
    label: "Profile",
    icon: UserRound,
    description: "Identity verification and privacy controls.",
    items: ["Identity verification", "Property association", "Contact privacy", "Payout details"],
  },
];

function OwnerDashboard() {
  const mine = properties.filter((p) => p.lister.type === "owner").slice(0, 3);

  return (
    <DashboardShell
      role="owner"
      title="Find the right tenant without the noise."
      subtitle="Listings, inquiries, visits and availability — all under your control."
      sections={sections}
      aside={
        <section className="space-y-4">
          <h2 className="text-lg font-bold">Your listings</h2>
          {mine.map((p) => (
            <div key={p.id} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.locality} · {inr(p.rent)} / month · Demo Bound Score {p.boundScore.total}
                  </p>
                </div>
                <span className="rounded-full bg-verified/10 px-3 py-1 text-xs font-semibold text-verified">
                  Published
                </span>
              </div>
              <div className="mt-4">
                <AvailabilityControl
                  confirmedHoursAgo={p.availabilityConfirmedHoursAgo}
                  ownerView
                />
              </div>
            </div>
          ))}
        </section>
      }
    />
  );
}
