import type { Property } from "@/data/properties";
import { inr } from "@/lib/format";

export function PropertySummaryCard({ property }: { property: Property }) {
  return (
    <aside className="surface-card overflow-hidden lg:sticky lg:top-24">
      <img
        src={property.images[0]}
        alt={property.title}
        width={640}
        height={360}
        loading="lazy"
        className="h-36 w-full object-cover"
      />
      <div className="p-4">
        <p className="font-semibold leading-snug">{property.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{property.locality}</p>
        <p className="mt-2 font-bold">
          {inr(property.rent)}
          <span className="text-sm font-normal text-muted-foreground">/month</span>
        </p>
      </div>
    </aside>
  );
}
