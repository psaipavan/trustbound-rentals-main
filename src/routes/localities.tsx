import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/PageHero";
import { LocalityCard } from "@/components/locality/LocalityCard";
import { localities } from "@/data/localities";

export const Route = createFileRoute("/localities")({
  head: () => ({
    meta: [
      { title: "Explore Hyderabad localities — In Bound" },
      {
        name: "description",
        content:
          "Gachibowli, Financial District, HITEC City, Kondapur, Madhapur and more — understand each neighbourhood before you rent.",
      },
      { property: "og:title", content: "Explore Hyderabad localities — In Bound" },
      {
        property: "og:description",
        content: "Neighbourhood guides for renters relocating across Hyderabad.",
      },
    ],
  }),
  component: LocalitiesPage,
});

function LocalitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Localities"
        title="Explore Hyderabad"
        subtitle="Commute, metro access, lifestyle and typical rental ranges — connected to live data as the platform grows. Nothing here is fabricated market data."
      />
      <section className="container-page py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {localities.map((l) => (
            <LocalityCard key={l.slug} locality={l} />
          ))}
        </div>
      </section>
    </>
  );
}
