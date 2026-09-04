import { Check, Info, Minus } from "lucide-react";
import type { BoundScore as BoundScoreType } from "@/data/properties";
import { cn } from "@/lib/utils";

export function BoundScoreBadge({ score, className }: { score: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-navy-foreground",
        className,
      )}
      title="Demo Bound Score — prototype value"
    >
      <span className="text-primary">{score}</span>
      <span className="opacity-70">/ 100</span>
      <span className="opacity-70">Demo Bound Score</span>
    </span>
  );
}

export function BoundScorePanel({ score }: { score: BoundScoreType }) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Demo Bound Score
          </p>
          <p className="mt-1 text-3xl font-extrabold">
            {score.total}
            <span className="text-base font-semibold text-muted-foreground"> / 100</span>
          </p>
        </div>
        <div
          className="relative grid h-16 w-16 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--color-primary) ${score.total * 3.6}deg, var(--color-muted) 0deg)`,
          }}
          aria-hidden
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-card text-sm font-bold">
            {score.total}
          </span>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {score.dimensions.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-full",
                d.met ? "bg-verified/12 text-verified" : "bg-muted text-muted-foreground",
              )}
            >
              {d.met ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            </span>
            <span className={d.met ? "" : "text-muted-foreground"}>{d.label}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Prototype value. Bound Score becomes a live, audited signal once backend verification is
        connected — it does not assert that these checks have already been performed.
      </p>
    </div>
  );
}
