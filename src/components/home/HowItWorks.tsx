import { BadgeCheck, CalendarCheck, KeyRound, MessagesSquare, Scale, Search } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

export const steps = [
  { icon: Search, title: "Discover", text: "Find rentals matching your lifestyle and budget." },
  {
    icon: BadgeCheck,
    title: "Verify",
    text: "Understand who posted the property and its verification status.",
  },
  {
    icon: MessagesSquare,
    title: "Connect",
    text: "Talk through Bricxley without immediately revealing your number.",
  },
  { icon: CalendarCheck, title: "Visit", text: "Schedule property visits directly." },
  { icon: Scale, title: "Decide", text: "Compare saved homes transparently." },
  { icon: KeyRound, title: "Move In", text: "Complete the rental journey." },
];

export function HowItWorks() {
  return (
    <section className="container-page py-20" aria-labelledby="how-heading">
      <SectionHeading
        align="center"
        eyebrow="The journey"
        title={
          <span id="how-heading">
            How <span className="text-primary">Bricxley</span> works
          </span>
        }
        subtitle="Six steps that take you from searching to signing — with the same people, in one place."
      />

      <div className="relative mt-14">
        <div
          className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block"
          aria-hidden
        />
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {steps.map((step, i) => (
            <li key={step.title} className="relative text-center lg:text-left">
              <span className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border bg-card text-primary shadow-[var(--shadow-soft)] lg:mx-0">
                <step.icon className="h-6 w-6" aria-hidden />
              </span>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Step {i + 1}
              </p>
              <h3 className="mt-1 text-base font-bold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
