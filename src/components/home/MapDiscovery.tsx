import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPinned } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { LazyMapView } from "@/components/map/LazyMapView";
import { properties } from "@/data/properties";
import { localityCoords, HYDERABAD_CENTER, type GeoPoint } from "@/data/geo";
import { cn } from "@/lib/utils";

const areas = [
  "Gachibowli",
  "Financial District",
  "HITEC City",
  "Kondapur",
  "Madhapur",
  "Kokapet",
] as const;

/**
 * Secondary, non-intrusive map discovery block. Rendered below featured
 * rentals — never in the hero and never as the default search interface.
 */
export function MapDiscovery() {
  const [active, setActive] = useState<string | null>(null);
  const focus: GeoPoint = (active && localityCoords[active]) || HYDERABAD_CENTER;

  return (
    <section className="container-page py-20" aria-labelledby="map-discovery-heading">
      <SectionHeading
        eyebrow="Map discovery"
        title={<span id="map-discovery-heading">Find homes around the places that matter</span>}
        subtitle="Explore rentals visually across Hyderabad. Browsing the map never changes your search."
      />

      <div className="mt-8 flex flex-wrap gap-2">
        {areas.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setActive(a === active ? null : a)}
            aria-pressed={a === active}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              a === active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <LazyMapView
          className="h-[360px] min-h-[350px] w-full sm:h-[420px] lg:h-[480px]"
          properties={properties}
          focus={focus}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link to="/rent" search={{ view: "map" }}>
            <MapPinned className="h-4 w-4" aria-hidden /> Explore rentals on map
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/rent">
            Browse listings instead <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}
