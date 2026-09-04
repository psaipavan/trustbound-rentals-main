import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BoundScoreBadge } from "@/components/property/BoundScore";
import { VerificationBadge } from "@/components/property/VerificationBadge";
import type { Property } from "@/data/properties";
import { inr } from "@/lib/format";

export function MapPropertyPreview({
  property,
  onClose,
}: {
  property: Property;
  onClose: () => void;
}) {
  const isAgent = property.lister.type === "agent";
  return (
    <div className="surface-card animate-in fade-in slide-in-from-bottom-2 pointer-events-auto flex gap-3 overflow-hidden p-3 shadow-[var(--shadow-panel)] duration-200">
      <img
        src={property.images[0]}
        alt={`${property.bhk} BHK in ${property.locality}`}
        loading="lazy"
        className="h-24 w-28 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-bold">{property.title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="rounded-full p-1 text-muted-foreground transition hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {property.locality}, {property.city} · {property.bhk} BHK
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-base font-extrabold">{inr(property.rent)}</span>
          <span className="text-xs text-muted-foreground">/ mo</span>
          <BoundScoreBadge score={property.boundScore.total} />
          {property.propertyVerified ? (
            <VerificationBadge variant="property" label="Property Verified" />
          ) : null}
          {isAgent ? (
            <VerificationBadge variant="agent" label="Agent Listing" />
          ) : (
            <VerificationBadge variant="direct" label="Owner Direct" />
          )}
        </div>
        <Button asChild size="sm" className="mt-2">
          <Link to="/property/$propertyId" params={{ propertyId: property.id }}>
            View Property
          </Link>
        </Button>
      </div>
    </div>
  );
}
