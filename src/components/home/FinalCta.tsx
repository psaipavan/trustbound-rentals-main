import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="container-page py-20">
      <div className="gradient-hero overflow-hidden rounded-3xl border border-border px-6 py-16 text-center shadow-[var(--shadow-panel)] sm:px-14">
        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold text-balance-tight sm:text-4xl">
          A better rental begins with a better connection.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Whether you're looking for a home or looking for the right tenant, Bricxley brings both
          sides together.
        </p>
        <p className="mt-6 text-lg font-bold text-primary">Rent with clarity.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/rent">Find a Home</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/list-property">Post a Property</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
