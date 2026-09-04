import { Link } from "@tanstack/react-router";
import { ArrowUpRight, TrainFront } from "lucide-react";
import type { Locality } from "@/data/localities";

export function LocalityCard({ locality }: { locality: Locality }) {
  return (
    <Link
      to="/rent"
      search={{ q: locality.name, type: "any", bhk: "any", sort: "recommended", view: "split" }}
      className="surface-card hover-lift group block p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold">{locality.name}</h3>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{locality.blurb}</p>
      <dl className="mt-4 space-y-1.5 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Best suited for</dt>
          <dd className="font-medium">{locality.bestFor}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="flex items-center gap-1 text-muted-foreground">
            <TrainFront className="h-3 w-3" aria-hidden /> Metro
          </dt>
          <dd className="text-right font-medium">{locality.metro}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Rental range</dt>
          <dd className="font-medium text-muted-foreground">{locality.rangeNote}</dd>
        </div>
      </dl>
    </Link>
  );
}
