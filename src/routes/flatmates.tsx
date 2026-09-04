import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock3 } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";

const preferences = [
  "Area",
  "Budget",
  "Move-in date",
  "Occupation",
  "Food preference",
  "Smoking",
  "Pets",
  "Lifestyle",
];

export const Route = createFileRoute("/flatmates")({
  head: () => ({
    meta: [
      { title: "Find a Flatmate — coming soon to Bricxley" },
      {
        name: "description",
        content:
          "The Bricxley flatmate module is in design. Match on area, budget, move-in date and lifestyle — with the same verification and privacy rules.",
      },
      { property: "og:title", content: "Find a Flatmate — coming soon to Bricxley" },
      {
        property: "og:description",
        content: "Flatmate matching built on the same verified, privacy-first foundation.",
      },
    ],
  }),
  component: FlatmatesPage,
});

function FlatmatesPage() {
  return (
    <>
      <PageHero
        eyebrow="Coming soon"
        title="Find a Flatmate"
        subtitle="Sharing a home is as much about the people as the property. This module launches once we can support it with the same verification and privacy standards as rentals."
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold">
          <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden />
          Coming Soon
        </span>
      </PageHero>

      <section className="container-page py-16">
        <h2 className="text-2xl font-extrabold">What you’ll be able to set</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Preferences will be matched respectfully and only where legally appropriate.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {preferences.map((p) => (
            <li key={p} className="surface-card px-4 py-3.5 text-sm font-medium">
              {p}
            </li>
          ))}
        </ul>
        <Button asChild className="mt-10">
          <Link to="/rent">Browse rentals meanwhile</Link>
        </Button>
      </section>
    </>
  );
}
