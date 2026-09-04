export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="gradient-hero border-b border-border/70">
      <div className="container-page py-16">
        <div className="max-w-2xl animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
          {eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          ) : null}
          <h1 className="mt-2 text-4xl font-extrabold text-balance-tight sm:text-5xl">{title}</h1>
          {subtitle ? <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p> : null}
          {children ? <div className="mt-7">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
