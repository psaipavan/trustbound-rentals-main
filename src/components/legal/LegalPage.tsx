import { PageHero } from "@/components/layout/PageHero";

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} subtitle={intro} />
      <section className="container-page py-16">
        <div className="surface-card mx-auto max-w-3xl divide-y divide-border p-8">
          {sections.map((s) => (
            <article key={s.heading} className="py-6 first:pt-0 last:pb-0">
              <h2 className="text-lg font-bold">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2026 In Bound. Prototype document — not legal advice.
        </p>
      </section>
    </>
  );
}
