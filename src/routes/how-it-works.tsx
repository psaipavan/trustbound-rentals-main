import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/PageHero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FinalCta } from "@/components/home/FinalCta";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How In Bound works — Discover to Move In" },
      {
        name: "description",
        content:
          "Discover, verify, connect, visit, decide and move in. See how In Bound guides the full early rental journey in Hyderabad.",
      },
      { property: "og:title", content: "How In Bound works" },
      {
        property: "og:description",
        content: "Six steps from discovering a home to moving in, built around trust.",
      },
    ],
  }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="From first search to first night in your new home."
        subtitle="In Bound covers the early rental journey end to end, so tenants, owners and verified agents stay in one transparent thread."
      >
        <Button asChild size="lg">
          <Link to="/rent">Find a Home</Link>
        </Button>
      </PageHero>
      <HowItWorks />
      <FinalCta />
    </>
  );
}
