/**
 * Map canvas colours.
 *
 * The map renders to a WebGL canvas, so it cannot consume Tailwind classes.
 * These hex values mirror the In Bound design tokens defined in styles.css and
 * are the single source of truth for map paint properties.
 */
export const mapColors = {
  marker: "#0F3D5C",
  markerActive: "#0E9F6E",
  markerText: "#FFFFFF",
  cluster: "#0F3D5C",
  clusterText: "#FFFFFF",
  radius: "#0E9F6E",
} as const;

/** Free, key-less raster basemap (OpenStreetMap). Swappable for Mapbox later. */
export const rasterStyle = {
  version: 8 as const,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster" as const, source: "osm" }],
};
