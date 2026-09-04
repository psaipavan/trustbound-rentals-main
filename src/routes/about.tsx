import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/PageHero";
import { FinalCta } from "@/components/home/FinalCta";

const pillars = [
  {
    title: "Verified rentals",
    text: "A listing should mean a real, available home — with checks that can be audited rather than claimed.",
  },
  {
    title: "Transparent people",
    text: "You should always know whether you’re speaking to an owner or an agent, and what it costs.",
  },
  {
    title: "Better connections",
    text: "Renting is a relationship. Bricxley is built to start it well and keep it in one honest thread.",
  },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Bricxley — Verified rentals, transparent people" },
      {
        name: "description",
        content:
          "Bricxley is a trusted rental marketplace helping tenants, owners and verified agents find each other and rent transparently in Hyderabad.",
      },
      { property: "og:title", content: "About Bricxley" },
      {
        property: "og:description",
        content: "Verified rentals. Transparent people. Better connections.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Verified rentals. Transparent people. Better connections."
        subtitle="Bricxley brings tenants, property owners, verified agents and the right homes together through trust, transparency and technology. Rent with clarity."
      />

      <section className="container-page py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="surface-card hover-lift p-6">
              <h2 className="text-base font-bold">{p.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>

        <div className="surface-card mt-10 p-8">
          <h2 className="text-2xl font-extrabold">Where we start</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Hyderabad first. The rental market here moves quickly, spans owner-direct homes and
            professional agents, and attracts thousands of people relocating each year. Getting the
            trust layer right here means it works anywhere.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
            This is an early product. Listing content, Bricxley Scores and locality data shown today
            are illustrative placeholders — the architecture is designed so each becomes a real,
            verifiable signal as the platform grows.
          </p>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
