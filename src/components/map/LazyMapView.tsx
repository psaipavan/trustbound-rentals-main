import { Suspense, lazy, useEffect, useState, type ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import type { MapView as MapViewType } from "@/components/map/MapView";

/**
 * Lazily loads the MapLibre bundle. The map is a secondary discovery feature —
 * property search and results must render (and keep working) without it.
 */
const MapView = lazy(() =>
  import("@/components/map/MapView").then((m) => ({ default: m.MapView })),
);

export function MapSkeleton({ className }: { className?: string | undefined }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl border border-border bg-muted/40 ${className ?? "h-full w-full"}`}
      role="status"
      aria-label="Loading map"
    >
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
    </div>
  );
}

export function LazyMapView(props: ComponentProps<typeof MapViewType>) {
  // Never load map JS during SSR / first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <MapSkeleton className={props.className} />;

  return (
    <Suspense fallback={<MapSkeleton className={props.className} />}>
      <MapView {...props} />
    </Suspense>
  );
}
