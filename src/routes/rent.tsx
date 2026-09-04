import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Home, List, Map as MapIcon, SlidersHorizontal, X } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { PropertyCard } from "@/components/property/PropertyCard";
import {
  FilterSidebar,
  defaultFilters,
  countActiveFilters,
  type Filters,
} from "@/components/search/FilterSidebar";
import { boundsContain, type MapBounds } from "@/components/map/map-bounds";
import { LazyMapView } from "@/components/map/LazyMapView";
import { MapPropertyPreview } from "@/components/map/MapPropertyPreview";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { properties, sortProperties, type SortKey } from "@/data/properties";
import { findPlace, localityCoords, type GeoPoint } from "@/data/geo";

const mapLocalities = [
  "Gachibowli",
  "Financial District",
  "HITEC City",
  "Kondapur",
  "Madhapur",
  "Kokapet",
  "Manikonda",
  "Nallagandla",
];

export type RentSearch = {
  q?: string | undefined;
  type?: string | undefined;
  bhk?: string | undefined;
  minRent?: number | undefined;
  maxRent?: number | undefined;
  moveIn?: string | undefined;
  sort?: string | undefined;
  view?: string | undefined;
};

const str = (v: unknown, fallback?: string) => (typeof v === "string" ? v : fallback);
const num = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined);

export const Route = createFileRoute("/rent")({
  validateSearch: (search: Record<string, unknown>): RentSearch => ({
    q: str(search["q"]),
    type: str(search["type"], "any"),
    bhk: str(search["bhk"], "any"),
    minRent: num(Number(search["minRent"])),
    maxRent: num(Number(search["maxRent"])),
    moveIn: str(search["moveIn"]),
    sort: str(search["sort"], "recommended"),
    view: str(search["view"], "list"),
  }),
  head: () => ({
    meta: [
      { title: "Rent Homes in Hyderabad | In Bound" },
      {
        name: "description",
        content:
          "Browse verified rentals in Gachibowli, Madhapur, Kondapur and more on a live map. Brokerage shown upfront, availability confirmed, ₹0 viewing fees.",
      },
      { property: "og:title", content: "Rent Homes in Hyderabad | In Bound" },
      {
        property: "og:description",
        content: "Verified rentals on a live map, with transparent brokerage and secure chat.",
      },
    ],
  }),
  component: RentPage,
});

function RentPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/rent" });

  const [filters, setFilters] = useState<Filters>(() => ({
    ...defaultFilters,
    ...(search.minRent ? { minRent: search.minRent } : {}),
    ...(search.maxRent ? { maxRent: search.maxRent } : {}),
    ...(search.moveIn ? { moveIn: search.moveIn } : {}),
  }));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [areaBounds, setAreaBounds] = useState<MapBounds | null>(null);
  const [focus, setFocus] = useState<GeoPoint | null>(null);

  // Only ever mount one map instance — the layout swaps panels at `lg`.
  const [isLarge, setIsLarge] = useState(true);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLarge(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const view = (search.view ?? "list") as "split" | "list" | "map";
  const sort = (search.sort ?? "recommended") as SortKey;

  // Centre the map on the searched place.
  useEffect(() => {
    if (!search.q) return;
    const place = findPlace(search.q);
    if (place) setFocus({ lat: place.lat, lng: place.lng });
  }, [search.q]);

  const results = useMemo(() => {
    const filtered = properties.filter((p) => {
      if (search.q) {
        const q = search.q.toLowerCase();
        const place = findPlace(search.q);
        const matchesText =
          p.locality.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q);
        const matchesPlace = place ? p.locality === place.locality : false;
        if (!matchesText && !matchesPlace) return false;
      }
      if (search.type && search.type !== "any" && p.propertyType !== search.type) return false;
      if (search.bhk && search.bhk !== "any") {
        const n = Number(search.bhk);
        if (n === 4 ? p.bhk < 4 : p.bhk !== n) return false;
      }
      if (p.rent < filters.minRent || p.rent > filters.maxRent) return false;
      if (filters.bhk.length && !filters.bhk.some((b) => (b === 4 ? p.bhk >= 4 : p.bhk === b)))
        return false;
      if (filters.propertyTypes.length && !filters.propertyTypes.includes(p.propertyType))
        return false;
      if (filters.furnishing.length && !filters.furnishing.includes(p.furnishing)) return false;
      if (filters.listerType.length && !filters.listerType.includes(p.lister.type)) return false;
      if (filters.amenities.length && !filters.amenities.every((a) => p.amenities.includes(a)))
        return false;
      if (filters.zeroBrokerage && p.brokerage > 0) return false;
      if (filters.parking && !/car|two-wheeler/i.test(p.parking)) return false;
      if (filters.pets && !/allowed/i.test(p.petPolicy)) return false;
      if (filters.verifiedOnly && !(p.propertyVerified && p.lister.identityVerified)) return false;
      if (filters.minScore && p.boundScore.total < filters.minScore) return false;
      if (areaBounds && !boundsContain(areaBounds, p)) return false;
      return true;
    });
    return sortProperties(filtered, sort);
  }, [search, filters, sort, areaBounds]);

  const selected = results.find((p) => p.id === selectedId) ?? null;
  const activeFilters = countActiveFilters(filters);

  const setView = (next: "split" | "list" | "map") =>
    navigate({ search: (prev) => ({ ...prev, view: next }) });

  const resultsPanel = (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{results.length}</span>{" "}
            {results.length === 1 ? "home" : "homes"}
          </p>
        </div>
        <div className="flex items-center gap-2">

          <Select
            value={sort}
            onValueChange={(v) => navigate({ search: (prev) => ({ ...prev, sort: v }) })}
          >
            <SelectTrigger className="h-9 w-[190px]" aria-label="Sort results">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rent-asc">Rent: Low to High</SelectItem>
              <SelectItem value="rent-desc">Rent: High to Low</SelectItem>
              <SelectItem value="score">Highest Bound Score</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters{activeFilters ? ` (${activeFilters})` : ""}
          </Button>
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No properties match these filters."
          description="Try widening your rent range, clearing an amenity or searching a nearby locality."
          action={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters(defaultFilters);
                  setAreaBounds(null);
                }}
              >
                Reset filters
              </Button>
              <Button onClick={() => navigate({ search: () => ({ view }) })}>
                Clear search
              </Button>
            </>
          }
        />
      ) : (
        <div
          className={
            view === "split"
              ? "grid items-stretch gap-5 sm:grid-cols-2"
              : "grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3"
          }
        >
          {results.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              compact={view === "split"}
              active={hoveredId === p.id || selectedId === p.id}
              onHoverChange={setHoveredId}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      )}
    </div>
  );

  const mapPanel = (heightClass: string) => (
    <div className={`relative ${heightClass}`}>
      <LazyMapView
        className="h-full w-full"
        properties={results}
        selectedId={selectedId}
        hoveredId={hoveredId}
        onSelect={setSelectedId}
        onHover={setHoveredId}
        focus={focus}
        onSearchArea={setAreaBounds}
      />
      {selected ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 sm:inset-x-6">
          <MapPropertyPreview property={selected} onClose={() => setSelectedId(null)} />
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="bg-sand/60">
      <div className="container-page py-10">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          {search.q ? `Rentals near ${search.q}` : "Verified rentals in Hyderabad"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Brokerage shown upfront. Availability confirmed by the lister. ₹0 viewing fees.
        </p>

        <SearchBar className="mt-6" compact />

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-border bg-background p-1">
            {(
              [
                ["list", "List", List],
                ["split", "Split", SlidersHorizontal],
                ["map", "Map", MapIcon],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                aria-pressed={view === key}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  view === key ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                } ${key === "split" ? "hidden lg:flex" : ""}`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>
          {view !== "list" ? (
            <Button variant="ghost" size="sm" onClick={() => setView("list")}>
              <List className="h-4 w-4" aria-hidden /> Back to list
            </Button>
          ) : null}
          {areaBounds ? (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Map area active
              </span>
              <Button variant="ghost" size="sm" onClick={() => setAreaBounds(null)}>
                <X className="h-4 w-4" aria-hidden /> Clear map area
              </Button>
            </div>
          ) : null}
        </div>


        {view !== "list" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {mapLocalities.map((name) => {
              const point = localityCoords[name];
              if (!point) return null;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFocus({ lat: point.lat, lng: point.lng })}
                  className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {name}
                </button>
              );
            })}
          </div>
        ) : null}

        {view === "map" ? (
          <div className="mt-6 lg:hidden">
            {!isLarge ? mapPanel("h-[calc(100vh-13rem)] min-h-[380px]") : null}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block">
            <FilterSidebar filters={filters} onChange={setFilters} />
          </div>

          {view === "split" ? (
            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className={view === "split" ? "lg:max-h-[80vh] lg:overflow-y-auto lg:pr-2" : ""}>
                {resultsPanel}
              </div>
              <div className="hidden xl:block">
                <div className="sticky top-24">{mapPanel("h-[80vh]")}</div>
              </div>
            </div>
          ) : view === "map" ? (
            <div className="hidden lg:block">
              {isLarge ? mapPanel("h-[80vh] min-h-[450px]") : null}
            </div>
          ) : (
            resultsPanel
          )}
        </div>

        {view === "map" ? <div className="mt-6 lg:hidden">{resultsPanel}</div> : null}

        {view === "list" ? (
          <section className="mt-14" aria-labelledby="rent-map-discovery">
            <h2 id="rent-map-discovery" className="text-2xl font-extrabold">
              Explore rentals on the map
            </h2>
            <p className="mt-2 text-muted-foreground">
              See where available homes are located around the areas that matter to you.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse visually without changing your current search.
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl border border-border">
              <LazyMapView
                className="h-[360px] min-h-[350px] w-full sm:h-[440px] lg:h-[480px]"
                properties={results}
                focus={focus}
                interactive={false}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={() => setView("map")}>
                <MapIcon className="h-4 w-4" aria-hidden /> Open Map View
              </Button>
              <Button variant="outline" className="hidden lg:inline-flex" onClick={() => setView("split")}>
                Open Split View
              </Button>
            </div>
          </section>
        ) : null}
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-4">
          <SheetTitle>Filters</SheetTitle>
          <FilterSidebar
            className="mt-3 border-0 p-0 shadow-none"
            sticky={false}
            filters={filters}
            onChange={setFilters}
          />
          <Button className="mt-4 w-full" onClick={() => setFiltersOpen(false)}>
            Show {results.length} homes
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
