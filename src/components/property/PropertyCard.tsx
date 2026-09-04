import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Clock3, Heart, MapPin, Sofa } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BoundScoreBadge } from "@/components/property/BoundScore";
import { VerificationBadge } from "@/components/property/VerificationBadge";
import { PropertyImage } from "@/components/property/PropertyImage";
import type { Property } from "@/data/properties";
import { hoursAgo, inr } from "@/lib/format";
import { useSaved } from "@/lib/saved-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Card layout contract — every region reserves fixed vertical space so cards in
 * the same grid row align exactly, regardless of badge count or text length:
 * ImageSection (16/9) → Content (flex-1: badges, title, location, price,
 * amenities, metadata) → ActionArea (bottom).
 */
export function PropertyCard({
  property,
  active = false,
  onHoverChange,
  onSelect,
  compact = false,
}: {
  property: Property;
  active?: boolean;
  onHoverChange?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  compact?: boolean;
}) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(property.id);
  const isAgent = property.lister.type === "agent";

  return (
    <article
      onMouseEnter={() => onHoverChange?.(property.id)}
      onMouseLeave={() => onHoverChange?.(null)}
      onClick={() => onSelect?.(property.id)}
      className={cn(
        "surface-card hover-lift group flex h-full flex-col overflow-hidden transition-shadow",
        active ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "",
      )}
    >
      {/* ImageSection */}
      <div className="relative shrink-0">
        <Link
          to="/property/$propertyId"
          params={{ propertyId: property.id }}
          aria-label={`View ${property.title}`}
          className="block"
        >
          <PropertyImage
            src={property.images[0]}
            alt={`${property.bhk}BHK ${property.propertyType.toLowerCase()} in ${property.locality}`}
            className={compact ? "aspect-[16/10]" : "aspect-[16/9]"}
            zoomOnHover
          />
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle(property.id);
            toast.success(saved ? "Removed from saved homes" : "Saved to your homes");
          }}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved homes" : "Save this home"}
          className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-card/90 backdrop-blur transition-transform duration-200 hover:scale-105 active:scale-95 motion-reduce:transition-none"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-transform duration-200 motion-reduce:transition-none",
              saved ? "scale-110 fill-destructive text-destructive" : "",
            )}
          />
        </button>
        <div className="absolute left-3 top-3">
          <BoundScoreBadge score={property.boundScore.total} />
        </div>
        {property.status !== "available" ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-foreground/85 px-2.5 py-1 text-xs font-semibold text-background">
            {property.status === "rented" ? "Rented" : "Temporarily unavailable"}
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* BadgeArea — reserves two rows */}
        <div className="flex min-h-[60px] flex-wrap content-start gap-1.5">
          {property.ownerVerified ? (
            <VerificationBadge variant="owner" label="Owner Verified" />
          ) : null}
          {property.propertyVerified ? (
            <VerificationBadge variant="property" label="Property Verified" />
          ) : null}
          {isAgent ? (
            <VerificationBadge variant="agent" label="Agent Listing" />
          ) : (
            <VerificationBadge variant="direct" label="Owner Direct" />
          )}
        </div>

        {/* TitleArea — exactly two lines of space */}
        <h3 className="mt-3 line-clamp-2 min-h-[3rem] text-base font-bold leading-6">
          <Link
            to="/property/$propertyId"
            params={{ propertyId: property.id }}
            className="transition-colors hover:text-primary"
          >
            {property.title}
          </Link>
        </h3>

        {/* Location — single row */}
        <p className="mt-1 flex h-5 items-center gap-1.5 text-sm leading-5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {property.locality}, {property.city}
          </span>
        </p>

        {/* PriceArea */}
        <div className="mt-3 flex items-baseline gap-2 whitespace-nowrap">
          <span className="text-xl font-extrabold leading-7">{inr(property.rent)}</span>
          <span className="text-sm text-muted-foreground">/ month</span>
        </div>
        <p className="h-5 truncate text-sm leading-5 text-muted-foreground">
          Deposit {inr(property.deposit)} · {property.propertyType}
        </p>

        {/* Amenities */}
        <dl className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-muted/70 p-3 text-xs">
          <div className="flex min-w-0 items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{property.bhk} BHK</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Bath className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{property.bathrooms} Bath</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Sofa className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            <span className="truncate capitalize">
              {property.furnishing.replace("-furnished", "")}
            </span>
          </div>
        </dl>

        {/* Metadata — four fixed single-line rows */}
        <div className="mt-3 space-y-1 text-xs leading-5 text-muted-foreground">
          <p className="h-5 truncate">
            Available: <span className="font-medium text-foreground">{property.availableFrom}</span>
          </p>
          <p className="h-5 truncate font-medium text-foreground">
            {isAgent ? `${property.lister.name} · ${property.lister.agency}` : property.lister.name}
          </p>
          <p
            className={cn(
              "h-5 truncate font-semibold",
              property.brokerage > 0 ? "text-warning-foreground" : "text-verified",
            )}
          >
            {property.brokerage > 0
              ? `Brokerage: ${inr(property.brokerage)}`
              : "Brokerage: ₹0 · Owner direct"}
          </p>
          <p className="flex h-5 items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              Availability confirmed {hoursAgo(property.availabilityConfirmedHoursAgo)}
            </span>
          </p>
        </div>

        {/* ActionArea — pushed to the bottom by the content flex column */}
        <div className="mt-auto pt-4">
          <Button asChild className="h-11 w-full">
            <Link to="/property/$propertyId" params={{ propertyId: property.id }}>
              View Property
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
