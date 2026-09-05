import { SectionHeading } from "@/components/ui/section-heading";

export const risks = [
  { risk: "Fake listings", answer: "Verification checks and one-tap reporting." },
  { risk: "Hidden brokerage", answer: "Brokerage shown upfront on every agent listing." },
  { risk: "Spam calls", answer: "Secure Bricxley Chat instead of exposed phone numbers." },
  { risk: "Outdated listings", answer: "Recurring availability confirmations from the lister." },
  { risk: "Visit scams", answer: "The ₹0 viewing fee principle, stated on every listing." },
  {
    risk: "Duplicate listings",
    answer: "Duplicate-detection architecture built into the catalogue.",
  },
];

export function SafetySection() {
  return (
    <section className="bg-navy py-20 text-navy-foreground" aria-labelledby="safety-heading">
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="Safety"
          title={<span id="safety-heading">Rent without second guessing everything.</span>}
          subtitle="Common rental risks, and the specific way Bricxley addresses each one."
          className="[&_h2]:text-navy-foreground [&_p:last-child]:text-navy-foreground/70"
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {risks.map((r) => (
            <div
              key={r.risk}
              className="rounded-2xl border border-navy-foreground/12 bg-navy-foreground/5 p-5 transition hover:border-primary/40"
            >
              <p className="text-sm font-bold">{r.risk}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-primary">Bricxley answer</p>
              <p className="mt-1.5 text-sm text-navy-foreground/75">{r.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
