import { Suspense, lazy, useEffect, useState, type ComponentProps } from "react";
import type { MapView as MapViewType } from "@/components/map/MapView";
import { cn } from "@/lib/utils";

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
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-border bg-muted/40",
        className ?? "h-full w-full",
      )}
      role="status"
      aria-label="Loading map"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,transparent_42%,var(--color-border)_42%,var(--color-border)_43%,transparent_43%,transparent_70%,var(--color-border)_70%,var(--color-border)_71%,transparent_71%)] opacity-50" />
      <div
        className="absolute left-[18%] top-[24%] h-3 w-3 rounded-full bg-primary/45"
        aria-hidden
      />
      <div
        className="absolute bottom-[28%] right-[24%] h-4 w-4 rounded-full bg-primary/30"
        aria-hidden
      />
      <span className="relative rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
        Loading map…
      </span>
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
