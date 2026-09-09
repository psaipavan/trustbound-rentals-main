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
import { useSession } from "@/lib/auth/session";
import {
  useConversationsQuery,
  useOwnerInterestsQuery,
  useVisitsQuery,
} from "@/lib/workflow/query";
import { useQuery } from "@tanstack/react-query";
import { listManagedProperties } from "@/lib/properties/service";

export const Route = createFileRoute("/dashboard/owner")({
  head: () => ({
    meta: [
      { title: "Owner dashboard — Bricxley" },
      {
        name: "description",
        content:
          "Manage your listings, inquiries, visits and availability from the Bricxley owner dashboard.",
      },
      { property: "og:title", content: "Owner dashboard — Bricxley" },
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
  const { actor } = useSession();
  const interests = useOwnerInterestsQuery(actor);
  const visits = useVisitsQuery(actor);
  const conversations = useConversationsQuery(actor);
  const managedProperties = useQuery({
    queryKey: ["managed-properties", actor?.id],
    queryFn: () => listManagedProperties(actor!),
    enabled: actor?.role === "owner",
  });
  const mine = managedProperties.data ?? [];
  const newInterests = (interests.data ?? []).filter((item) => item.status === "SUBMITTED").length;
  const upcomingVisits = (visits.data ?? []).filter(
    (item) => item.status === "REQUESTED" || item.status === "CONFIRMED",
  ).length;

  return (
    <DashboardShell
      role="owner"
      title="Find the right tenant without the noise."
      subtitle="Listings, inquiries, visits and availability — all under your control."
      sections={sections}
      aside={
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Active listings", mine.filter((item) => item.status === "PUBLISHED").length],
              ["New interests", newInterests],
              ["Unread chats", (conversations.data ?? []).length],
              ["Upcoming visits", upcomingVisits],
            ].map(([label, value]) => (
              <div key={String(label)} className="surface-card p-4">
                <p className="text-2xl font-extrabold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          <h2 className="text-lg font-bold">Your listings</h2>
          {mine.length === 0 ? (
            <p className="surface-card p-5 text-sm text-muted-foreground">
              Your saved listing drafts will appear here.
            </p>
          ) : null}
          {mine.map((p) => (
            <div key={p.id} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.locality} · {inr(p.monthlyRent)} / month
                  </p>
                </div>
                <span className="rounded-full bg-verified/10 px-3 py-1 text-xs font-semibold text-verified">
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </section>
      }
    />
  );
}
