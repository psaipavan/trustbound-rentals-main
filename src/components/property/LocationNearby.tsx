import { useMemo } from "react";
import {
  Building2,
  Dumbbell,
  GraduationCap,
  Hospital,
  ShoppingCart,
  TrainFront,
  Utensils,
} from "lucide-react";
import { MapView } from "@/components/map/MapView";
import { distanceKm, nearbyFor, type NearbyCategory } from "@/data/geo";
import type { Property } from "@/data/properties";

const icons: Record<NearbyCategory, React.ElementType> = {
  "Metro / Transport": TrainFront,
  Workplaces: Building2,
  Hospitals: Hospital,
  Schools: GraduationCap,
  Supermarkets: ShoppingCart,
  Restaurants: Utensils,
  Gyms: Dumbbell,
};

export function LocationNearby({ property }: { property: Property }) {
  const point = { lat: property.lat, lng: property.lng };

  const grouped = useMemo(() => {
    const places = nearbyFor(point, 2);
    const map = new Map<NearbyCategory, { name: string; km: number }[]>();
    for (const p of places) {
      const list = map.get(p.category) ?? [];
      list.push({ name: p.name, km: distanceKm(point, p) });
      map.set(p.category, list);
    }
    return [...map.entries()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property.id]);

  return (
    <section className="surface-card overflow-hidden" aria-labelledby="location-heading">
      <div className="h-64">
        <MapView
          className="h-full w-full"
          properties={[property]}
          selectedId={property.id}
          focus={point}
          interactive
        />
      </div>
      <div className="p-6">
        <h2 id="location-heading" className="text-lg font-bold">
          Location &amp; nearby
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {property.locationPrivacy === "approximate"
            ? "The lister has chosen to show an approximate location. The exact address is shared once a conversation starts."
            : `${property.locality}, ${property.city}. Distances below are straight-line map distances.`}
        </p>

        <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {grouped.map(([category, places]) => {
            const Icon = icons[category];
            return (
              <div key={category}>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  {category}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {places.map((p) => (
                    <li key={p.name} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate">{p.name}</span>
                      <span className="shrink-0 font-semibold">{p.km.toFixed(1)} km</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {property.nearby.length ? (
          <dl className="mt-6 grid gap-x-6 gap-y-3 border-t border-border pt-5 sm:grid-cols-2">
            {property.nearby.map((n) => (
              <div key={n.label} className="text-sm">
                <dt className="text-muted-foreground">{n.label}</dt>
                <dd className="font-medium">{n.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
