import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  IndianRupee,
  MessagesSquare,
  UserRound,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
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

export const Route = createFileRoute("/dashboard/agent")({
  head: () => ({
    meta: [
      { title: "Agent dashboard — Bricxley" },
      {
        name: "description",
        content:
          "Verified agents manage properties, leads, visits, messages, brokerage settings and verification on Bricxley.",
      },
      { property: "og:title", content: "Agent dashboard — Bricxley" },
      {
        property: "og:description",
        content: "Transparency that separates legitimate agents from impostors.",
      },
    ],
  }),
  component: AgentDashboard,
});

const sections = [
  {
    key: "properties",
    label: "Properties",
    icon: Building2,
    description: "Listings you represent, each labelled as an agent listing.",
    items: ["Active", "Pending verification", "Rented", "Archived"],
  },
  {
    key: "leads",
    label: "Leads",
    icon: Users,
    description: "Tenant interest across your portfolio.",
    items: ["New leads", "Qualified", "Visit booked", "Closed"],
  },
  {
    key: "visits",
    label: "Visits",
    icon: CalendarCheck,
    description: "Coordinate viewings without exchanging numbers first.",
    items: ["Today", "This week", "Awaiting confirmation", "Completed"],
  },
  {
    key: "messages",
    label: "Messages",
    icon: MessagesSquare,
    description: "Secure Bricxley Chat threads.",
    items: ["Unread", "Active", "Contact sharing requests", "Archived"],
  },
  {
    key: "brokerage",
    label: "Brokerage Settings",
    icon: IndianRupee,
    description: "Brokerage is always shown to tenants before contact.",
    items: ["Default brokerage", "Per-listing override", "Fee disclosure text", "Invoices"],
  },
  {
    key: "verification",
    label: "Verification",
    icon: BadgeCheck,
    description: "Identity, agency and licence records on file.",
    items: ["Identity documents", "Agency registration", "Licence status", "Re-verification"],
  },
  {
    key: "profile",
    label: "Profile",
    icon: UserRound,
    description: "Your public agent profile as tenants see it.",
    items: [
      "Agency details",
      "Active listings",
      "Response time",
      "Ratings (when real reviews exist)",
    ],
  },
];

function AgentDashboard() {
  const { actor } = useSession();
  const interests = useOwnerInterestsQuery(actor);
  const visits = useVisitsQuery(actor);
  const conversations = useConversationsQuery(actor);
  const managedProperties = useQuery({
    queryKey: ["managed-properties", actor?.id],
    queryFn: () => listManagedProperties(actor!),
    enabled: actor?.role === "agent",
  });
  const mine = managedProperties.data ?? [];

  return (
    <DashboardShell
      role="agent"
      title="Transparency is your advantage."
      subtitle="Verified agents stand apart when identity, agency and brokerage are visible upfront."
      sections={sections}
      aside={
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Active listings", mine.filter((item) => item.status === "PUBLISHED").length],
              [
                "New interests",
                (interests.data ?? []).filter((item) => item.status === "SUBMITTED").length,
              ],
              ["Secure chats", (conversations.data ?? []).length],
              [
                "Upcoming visits",
                (visits.data ?? []).filter(
                  (item) => item.status === "REQUESTED" || item.status === "CONFIRMED",
                ).length,
              ],
            ].map(([label, value]) => (
              <div key={String(label)} className="surface-card p-4">
                <p className="text-2xl font-extrabold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          <section className="surface-card p-6">
            <h2 className="text-lg font-bold">Your agent listings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Each of these displays the Agent Listing label and your brokerage to tenants.
            </p>
            {!mine.length ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Your agent listing drafts will appear here.
              </p>
            ) : null}
            <ul className="mt-5 space-y-3">
              {mine.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3.5"
                >
                  <div>
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.locality} · {inr(p.monthlyRent)} / month
                    </p>
                  </div>
                  <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning-foreground">
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </section>
      }
    />
  );
}
