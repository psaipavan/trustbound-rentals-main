import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/PageHero";
import { SafetySection } from "@/components/home/SafetySection";
import { FinalCta } from "@/components/home/FinalCta";

const principles = [
  {
    title: "Your number stays yours",
    text: "Conversations begin inside In Bound Chat. Phone numbers are exchanged only when both people choose to share them.",
  },
  {
    title: "₹0 to view a property",
    text: "In Bound does not require tenants to pay money simply to view a property. Any request for a viewing payment can be reported.",
  },
  {
    title: "Agents are labelled as agents",
    text: "An agent profile can never visually appear as an owner profile, and brokerage is displayed before contact.",
  },
  {
    title: "Reports go to human review",
    text: "Listings are never removed automatically in the prototype. Reports enter a moderation queue with a full audit trail.",
  },
];

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety & trust at In Bound" },
      {
        name: "description",
        content:
          "How In Bound handles fake listings, hidden brokerage, spam calls, outdated listings and viewing-fee scams.",
      },
      { property: "og:title", content: "Safety & trust at In Bound" },
      {
        property: "og:description",
        content: "Verification, transparent brokerage, secure chat and moderation-ready reporting.",
      },
    ],
  }),
  component: SafetyPage,
});

function SafetyPage() {
  return (
    <>
      <PageHero
        eyebrow="Safety"
        title="Trust isn’t a badge. It’s how the product behaves."
        subtitle="Privacy is one part of a larger trust-first rental system — verification, transparency and accountability sit alongside it."
      />

      <section className="container-page py-16">
        <div className="grid gap-5 md:grid-cols-2">
          {principles.map((p) => (
            <div key={p.title} className="surface-card hover-lift p-6">
              <h2 className="text-base font-bold">{p.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <SafetySection />
      <FinalCta />
    </>
  );
}
