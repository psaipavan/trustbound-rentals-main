/** Map bounds helpers — kept free of maplibre imports so search logic never
 * pulls the map bundle into the initial page load. */
export type MapBounds = { west: number; south: number; east: number; north: number };

export function boundsContain(b: MapBounds, p: { lat: number; lng: number }) {
  return p.lng >= b.west && p.lng <= b.east && p.lat >= b.south && p.lat <= b.north;
}
