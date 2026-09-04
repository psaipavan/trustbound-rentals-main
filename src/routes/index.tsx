import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  CalendarCheck,
  Heart,
  IndianRupee,
  Lock,
  MapPinned,
  MessagesSquare,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SafetySection } from "@/components/home/SafetySection";
import { FinalCta } from "@/components/home/FinalCta";
import { MapDiscovery } from "@/components/home/MapDiscovery";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/PropertyCard";
import { LocalityCard } from "@/components/locality/LocalityCard";
import { boundAiExamples } from "@/components/ai/BoundAi";
import { properties } from "@/data/properties";
import { localities } from "@/data/localities";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bricxley — Verified rentals in Hyderabad" },
      {
        name: "description",
        content:
          "Discover verified rentals, connect safely with owners and verified agents, schedule visits and rent transparently in Hyderabad.",
      },
      { property: "og:title", content: "Bricxley — Rent with clarity." },
      {
        property: "og:description",
        content:
          "A trusted rental marketplace bringing tenants, owners and verified agents together.",
      },
    ],
  }),
  component: Home,
});

const ownerBenefits = [
  { icon: Send, text: "Post your property in minutes" },
  { icon: Lock, text: "Control your privacy and contact sharing" },
  { icon: MessagesSquare, text: "Manage inquiries in one inbox" },
  { icon: CalendarCheck, text: "Schedule and track visits" },
  { icon: BellRing, text: "Mark availability so listings stay current" },
  { icon: Users, text: "See genuine tenant interest" },
  { icon: BarChart3, text: "Transparent listing performance" },
];

const tenantBenefits = [
  { icon: BadgeCheck, text: "Verified identities on both sides" },
  { icon: IndianRupee, text: "Transparent brokerage, shown upfront" },
  { icon: IndianRupee, text: "No hidden viewing fees" },
  { icon: Lock, text: "Secure Bricxley Chat" },
  { icon: BellRing, text: "Real-time availability" },
  { icon: Heart, text: "Saved properties and comparison" },
  { icon: CalendarCheck, text: "Visit scheduling" },
  { icon: MapPinned, text: "Locality insights" },
];

const frustrations = [
  {
    title: "“The flat was rented two weeks ago.”",
    text: "Listings age silently. Bricxley asks owners and agents to re-confirm availability, and stamps every card with when it was last confirmed.",
  },
  {
    title: "“I was told it was owner-direct.”",
    text: "Agent listings are labelled as agent listings, with agency and brokerage displayed before you ever call.",
  },
  {
    title: "“My phone rang for a month.”",
    text: "Conversations start inside Bricxley Chat. Numbers are exchanged only when both people choose to.",
  },
  {
    title: "“I paid just to see the house.”",
    text: "Bricxley does not require tenants to pay money simply to view a property. ₹0 viewing fee, stated everywhere.",
  },
];

function Home() {
  return (
    <>
      <Hero />
      <TrustBar />

      <section className="container-page py-8" aria-labelledby="discover-heading">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <SectionHeading
            eyebrow="Discover"
            title={<span id="discover-heading">Homes worth moving into</span>}
            subtitle="Recently verified rentals across Hyderabad."
            className="min-w-0"
          />
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/rent">
              Browse all rentals <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.slice(0, 6).map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      <MapDiscovery />

      <HowItWorks />

      <section className="container-page pb-20" aria-labelledby="owners-heading">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="surface-card p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">For owners</p>
            <h2 id="owners-heading" className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Find the right tenant without the noise.
            </h2>
            <ul className="mt-6 space-y-3">
              {ownerBenefits.map((b) => (
                <li key={b.text} className="flex items-center gap-3 text-sm">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <b.icon className="h-4 w-4" aria-hidden />
                  </span>
                  {b.text}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-7">
              <Link to="/list-property">List Your Property</Link>
            </Button>
          </div>

          <div className="surface-card p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">For tenants</p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Your rental search should feel simple.
            </h2>
            <ul className="mt-6 space-y-3">
              {tenantBenefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-verified/10 text-verified">
                    <b.icon className="h-4 w-4" aria-hidden />
                  </span>
                  {b.text}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-7" variant="outline">
              <Link to="/rent">Start Searching</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-sand py-20" aria-labelledby="agents-heading">
        <div className="container-page">
          <SectionHeading
            eyebrow="Agents"
            title={<span id="agents-heading">Verified Agent Marketplace</span>}
            subtitle="Good agents aren’t the problem — hidden ones are. Every agent listing on Bricxley states who they are, which agency they represent and exactly what the brokerage is."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Agent badge", "Agent listings are visually distinct from owner listings, always."],
              ["Agency", "The agency name is attached to every listing and profile."],
              ["Brokerage", "The exact amount is displayed before you make contact."],
              ["Verification status", "Identity and licence checks shown on the profile."],
            ].map(([title, text]) => (
              <div key={title} className="surface-card hover-lift p-5">
                <h3 className="text-sm font-bold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Agent ratings appear only once real, verified renter reviews exist.
          </p>
        </div>
      </section>

      <section className="container-page py-20" aria-labelledby="localities-heading">
        <SectionHeading
          eyebrow="Localities"
          title={<span id="localities-heading">Explore Hyderabad</span>}
          subtitle="Understand the neighbourhood before you commit to the address."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {localities.slice(0, 6).map((l) => (
            <LocalityCard key={l.slug} locality={l} />
          ))}
        </div>
        <Button asChild variant="outline" className="mt-8">
          <Link to="/localities">
            See all localities <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <SafetySection />

      <section className="container-page py-20" aria-labelledby="bricxley-ai-heading">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Coming soon"
              title={
                <span id="bricxley-ai-heading">
                  <span className="text-primary">Bricxley AI</span>, your rental co-pilot
                </span>
              }
              subtitle="Ask about homes, budgets and localities in plain language. Bricxley AI is a preview experience — it will never present generated information as verified fact."
            />
          </div>
          <div className="surface-card p-6">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden /> Example questions
            </p>
            <ul className="mt-4 space-y-2.5">
              {boundAiExamples.map((q) => (
                <li
                  key={q}
                  className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground"
                >
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page pb-20" aria-labelledby="frustrations-heading">
        <SectionHeading
          align="center"
          eyebrow="Why we built this"
          title={<span id="frustrations-heading">Built around real rental frustrations</span>}
          subtitle="We haven’t invented customer quotes. These are the problems Bricxley is designed to remove."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {frustrations.map((f) => (
            <div key={f.title} className="surface-card hover-lift p-6">
              <p className="text-base font-bold">{f.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
                Example User Scenario
              </p>
            </div>
          ))}
        </div>
      </section>

      <FinalCta />
    </>
  );
}
