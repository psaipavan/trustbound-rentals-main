import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/SearchBar";

export function Hero() {
  return (
    <section className="gradient-hero relative overflow-hidden border-b border-border/70">
      <div className="container-page pb-14 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex animate-[fade-in_0.5s_ease_both] items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold shadow-[var(--shadow-soft)]">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
            Renting, rebuilt around trust.
          </span>

          <h1 className="mt-6 animate-[fade-up_0.7s_cubic-bezier(0.16,1,0.3,1)_both] text-4xl font-extrabold leading-[1.08] text-balance-tight sm:text-6xl">
            Find your space.
            <br />
            Meet the right people.
            <br />
            Move with <span className="text-primary">Bricxley</span>.
          </h1>

          <p className="mx-auto mt-5 max-w-xl animate-[fade-up_0.8s_cubic-bezier(0.16,1,0.3,1)_both] text-base text-muted-foreground sm:text-lg">
            Discover verified rentals, connect safely with owners and agents, schedule visits and
            move with confidence.
          </p>

          <p className="mt-4 text-sm font-semibold tracking-wide text-primary">
            Rent with clarity.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="group">
              <Link to="/rent">
                Find a Home
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/list-property">List Your Property</Link>
            </Button>
          </div>
        </div>

        <SearchBar className="mx-auto mt-12 max-w-6xl animate-[fade-up_0.9s_cubic-bezier(0.16,1,0.3,1)_both]" />
      </div>
    </section>
  );
}
