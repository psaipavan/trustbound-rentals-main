import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, LngLatBoundsLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Crosshair, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { mapColors, rasterStyle } from "@/components/map/map-theme";
import { HYDERABAD_CENTER, type GeoPoint } from "@/data/geo";
import type { Property } from "@/data/properties";
import { cn } from "@/lib/utils";

import type { MapBounds } from "@/components/map/map-bounds";

export type { MapBounds };

function shortRent(rent: number) {
  return rent >= 100000 ? `₹${(rent / 100000).toFixed(1)}L` : `₹${Math.round(rent / 1000)}K`;
}

/** Guards against undefined/NaN/out-of-range coordinates reaching the map. */
function hasValidCoords(p: Property) {
  const ok =
    typeof p.lat === "number" &&
    typeof p.lng === "number" &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lng) &&
    p.lat >= -90 &&
    p.lat <= 90 &&
    p.lng >= -180 &&
    p.lng <= 180;
  if (!ok && import.meta.env.DEV) {
    console.warn(`[map] skipping listing ${p.id}: invalid coordinates`, p.lat, p.lng);
  }
  return ok;
}

export function MapView({
  properties,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  focus,
  onSearchArea,
  className,
  interactive = true,
}: {
  properties: Property[];
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (id: string | null) => void;
  onHover?: (id: string | null) => void;
  focus?: GeoPoint | null;
  onSearchArea?: (bounds: MapBounds) => void;
  className?: string;
  interactive?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [moved, setMoved] = useState(false);
  const [locating, setLocating] = useState(false);

  // Initialise once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let map: MapLibreMap;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: rasterStyle,
        center: [HYDERABAD_CENTER.lng, HYDERABAD_CENTER.lat],
        zoom: 11.2,
        attributionControl: { compact: true },
        interactive,
      });
    } catch {
      setFailed(true);
      return;
    }
    mapRef.current = map;
    map.on("error", () => setFailed(true));

    map.on("load", () => {
      map.addSource("properties", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterRadius: 55,
        clusterMaxZoom: 14,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "properties",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": mapColors.cluster,
          "circle-radius": ["step", ["get", "point_count"], 20, 10, 26, 30, 32],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "properties",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 13,
          "text-font": ["Open Sans Semibold"],
          "text-allow-overlap": true,
        },
        paint: { "text-color": mapColors.clusterText },
      });

      map.addLayer({
        id: "points",
        type: "circle",
        source: "properties",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "case",
            ["boolean", ["feature-state", "active"], false],
            mapColors.markerActive,
            mapColors.marker,
          ],
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "active"], false],
            24,
            20,
          ],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });
      map.addLayer({
        id: "point-label",
        type: "symbol",
        source: "properties",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "text-field": ["get", "label"],
          "text-size": 11,
          "text-font": ["Open Sans Semibold"],
          "text-allow-overlap": true,
        },
        paint: { "text-color": mapColors.markerText },
      });

      map.on("click", "clusters", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const clusterId = feature.properties?.["cluster_id"] as number;
        const source = map.getSource("properties") as maplibregl.GeoJSONSource;
        void source.getClusterExpansionZoom(clusterId).then((zoom: number) => {
          const [lng, lat] = (feature.geometry as { coordinates: [number, number] }).coordinates as [number, number];
          map.easeTo({ center: [lng, lat], zoom });
        });
      });

      for (const layer of ["points", "point-label"]) {
        map.on("click", layer, (e) => {
          const id = e.features?.[0]?.properties?.["id"] as string | undefined;
          if (id) onSelect?.(id);
        });
        map.on("mouseenter", layer, (e) => {
          map.getCanvas().style.cursor = "pointer";
          const id = e.features?.[0]?.properties?.["id"] as string | undefined;
          if (id) onHover?.(id);
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
          onHover?.(null);
        });
      }
      map.on("mouseenter", "clusters", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "clusters", () => (map.getCanvas().style.cursor = ""));
      // Only a real user pan/zoom offers "Search this area" — programmatic
      // easeTo (locality focus, geolocation) must not prompt a new search.
      map.on("moveend", (e) => {
        if ((e as { originalEvent?: unknown }).originalEvent) setMoved(true);
      });

      setReady(true);
    });

    // Container can be sized after init (tabs, split view, lazy mount).
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => mapRef.current?.resize());
    });
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push data.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const source = map.getSource("properties") as maplibregl.GeoJSONSource | undefined;
    source?.setData({
      type: "FeatureCollection",
      features: properties.filter(hasValidCoords).map((p) => ({
        type: "Feature" as const,
        id: Number(p.id.replace(/\D/g, "")),
        properties: { id: p.id, label: shortRent(p.rent) },
        geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
      })),
    });
  }, [properties, ready]);

  // Active marker state (selection or card hover).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const activeId = hoveredId ?? selectedId ?? null;
    for (const p of properties) {
      map.setFeatureState(
        { source: "properties", id: Number(p.id.replace(/\D/g, "")) },
        { active: p.id === activeId },
      );
    }
  }, [hoveredId, selectedId, properties, ready]);

  // External focus (locality selection, "use my location").
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !focus) return;
    map.easeTo({ center: [focus.lng, focus.lat], zoom: 13.2, duration: 700 });
  }, [focus, ready]);

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.info("Location isn’t available in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        mapRef.current?.easeTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 13.5,
        });
        setMoved(true);
      },
      () => {
        setLocating(false);
        toast.info("We’ll keep showing Hyderabad", {
          description: "Location permission was declined — everything else still works.",
        });
      },
      { timeout: 8000 },
    );
  };

  const searchArea = () => {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBounds() as unknown as { toArray: () => number[][] };
    const [[west, south], [east, north]] = b.toArray() as [number[], number[]];
    onSearchArea?.({
      west: west as number,
      south: south as number,
      east: east as number,
      north: north as number,
    });
    setMoved(false);
  };

  if (failed) {
    return (
      <div
        className={cn(
          "surface-card grid place-items-center p-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        <div>
          <p className="font-semibold text-foreground">Map couldn’t load</p>
          <p className="mt-1">
            The list view below still shows every matching home in Hyderabad.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border", className)}>
      <div ref={containerRef} className="h-full w-full" aria-label="Map of rental properties" />

      {!ready ? (
        <div className="absolute inset-0 grid place-items-center bg-muted/70">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading map…
          </span>
        </div>
      ) : null}

      {interactive ? (
        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center gap-2 px-3">
          {onSearchArea && moved ? (
            <Button size="sm" className="pointer-events-auto shadow-lg" onClick={searchArea}>
              <Search className="h-4 w-4" /> Search this area
            </Button>
          ) : null}
        </div>
      ) : null}

      {interactive ? (
        <Button
          size="sm"
          variant="secondary"
          onClick={useMyLocation}
          className="absolute bottom-8 right-3 shadow-lg"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Crosshair className="h-4 w-4" aria-hidden />
          )}
          Use my location
        </Button>
      ) : null}
    </div>
  );
}

export { boundsContain } from "@/components/map/map-bounds";

export type { LngLatBoundsLike };
