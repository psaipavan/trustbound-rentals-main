import { inr } from "@/lib/format";
import type { Property } from "@/data/properties";

export function CostBreakdown({ property }: { property: Property }) {
  const oneTime = property.deposit + property.brokerage;
  const moveIn = property.rent + property.maintenance + oneTime;

  return (
    <section className="surface-card overflow-hidden" aria-labelledby="cost-heading">
      <div className="border-b border-border bg-sand px-5 py-4">
        <h2 id="cost-heading" className="text-lg font-bold">
          Move-in Cost Breakdown
        </h2>
        <p className="text-sm text-muted-foreground">Monthly and one-time charges, separated.</p>
      </div>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Monthly
        </p>
        <dl className="mt-2 space-y-2 text-sm">
          <Line label="Monthly Rent" value={inr(property.rent)} />
          <Line label="Maintenance" value={inr(property.maintenance)} />
          <Line label="Total monthly" value={inr(property.rent + property.maintenance)} emphasis />
        </dl>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          One-time
        </p>
        <dl className="mt-2 space-y-2 text-sm">
          <Line label="Security Deposit" value={inr(property.deposit)} />
          <Line
            label="Brokerage"
            value={property.brokerage > 0 ? inr(property.brokerage) : "₹0"}
            hint={property.brokerage > 0 ? "Agent listing" : "Owner direct"}
          />
          <Line label="Total one-time" value={inr(oneTime)} emphasis />
        </dl>

        <div className="mt-6 flex items-baseline justify-between rounded-xl bg-navy px-4 py-4 text-navy-foreground">
          <span className="text-sm font-semibold">Estimated Move-in Cost</span>
          <span className="text-2xl font-extrabold text-primary">{inr(moveIn)}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Includes first month’s rent, maintenance, deposit and brokerage where applicable. Final
          amounts are agreed directly with the owner or agent.
        </p>
      </div>
    </section>
  );
}

function Line({
  label,
  value,
  emphasis,
  hint,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  hint?: string;
}) {
  return (
    <div
      className={
        emphasis
          ? "flex items-center justify-between border-t border-border pt-2 font-bold"
          : "flex items-center justify-between"
      }
    >
      <dt className={emphasis ? "" : "text-muted-foreground"}>
        {label}
        {hint ? <span className="ml-2 text-xs text-muted-foreground">({hint})</span> : null}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
