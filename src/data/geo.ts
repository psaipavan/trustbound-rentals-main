/**
 * Hyderabad geography for the Bricxley prototype.
 *
 * Coordinates are real, publicly known locality/landmark centroids. Individual
 * demo properties are placed near — not exactly at — these points.
 */

export type GeoPoint = { lat: number; lng: number };

export type PlaceSuggestion = GeoPoint & {
  name: string;
  kind: "locality" | "landmark";
  locality: string;
};

export const HYDERABAD_CENTER: GeoPoint = { lat: 17.4485, lng: 78.3616 };

export const localityCoords: Record<string, GeoPoint> = {
  Gachibowli: { lat: 17.4401, lng: 78.3489 },
  "Financial District": { lat: 17.4156, lng: 78.3402 },
  "HITEC City": { lat: 17.4474, lng: 78.3762 },
  Kondapur: { lat: 17.4615, lng: 78.3639 },
  Madhapur: { lat: 17.4483, lng: 78.3915 },
  Kokapet: { lat: 17.4113, lng: 78.3277 },
  Nallagandla: { lat: 17.4703, lng: 78.3096 },
  Manikonda: { lat: 17.4048, lng: 78.3772 },
  Miyapur: { lat: 17.4967, lng: 78.3578 },
  Kukatpally: { lat: 17.4948, lng: 78.3996 },
  Chandanagar: { lat: 17.4948, lng: 78.3238 },
  Nanakramguda: { lat: 17.4213, lng: 78.3444 },
};

export const landmarks: PlaceSuggestion[] = [
  { name: "DLF Cyber City", kind: "landmark", locality: "Gachibowli", lat: 17.4353, lng: 78.3833 },
  {
    name: "Knowledge City",
    kind: "landmark",
    locality: "Nanakramguda",
    lat: 17.4276,
    lng: 78.3441,
  },
  { name: "Wipro Circle", kind: "landmark", locality: "Gachibowli", lat: 17.4275, lng: 78.3446 },
  {
    name: "Raidurg Metro Station",
    kind: "landmark",
    locality: "HITEC City",
    lat: 17.4157,
    lng: 78.3831,
  },
  { name: "IKEA Hyderabad", kind: "landmark", locality: "HITEC City", lat: 17.4405, lng: 78.3766 },
  { name: "Inorbit Mall", kind: "landmark", locality: "Madhapur", lat: 17.4341, lng: 78.3866 },
  { name: "Botanical Garden", kind: "landmark", locality: "Kondapur", lat: 17.4623, lng: 78.3564 },
  { name: "ISB Hyderabad", kind: "landmark", locality: "Gachibowli", lat: 17.4353, lng: 78.3372 },
  {
    name: "Outer Ring Road – Kokapet",
    kind: "landmark",
    locality: "Kokapet",
    lat: 17.4045,
    lng: 78.3287,
  },
  {
    name: "Forum Sujana Mall",
    kind: "landmark",
    locality: "Kukatpally",
    lat: 17.4855,
    lng: 78.3915,
  },
  {
    name: "Miyapur Metro Depot",
    kind: "landmark",
    locality: "Miyapur",
    lat: 17.4966,
    lng: 78.3612,
  },
  { name: "Lanco Hills", kind: "landmark", locality: "Manikonda", lat: 17.4038, lng: 78.3843 },
];

export const placeSuggestions: PlaceSuggestion[] = [
  ...Object.entries(localityCoords).map(([name, point]) => ({
    name,
    kind: "locality" as const,
    locality: name,
    ...point,
  })),
  ...landmarks,
];

export function findPlace(query: string): PlaceSuggestion | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return (
    placeSuggestions.find((p) => p.name.toLowerCase() === q) ??
    placeSuggestions.find((p) => p.name.toLowerCase().includes(q))
  );
}

export function searchPlaces(query: string, limit = 6): PlaceSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return placeSuggestions.filter((p) => p.kind === "locality").slice(0, limit);
  return placeSuggestions.filter((p) => p.name.toLowerCase().includes(q)).slice(0, limit);
}

/** Haversine distance in kilometres. */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type NearbyCategory =
  | "Metro / Transport"
  | "Workplaces"
  | "Hospitals"
  | "Schools"
  | "Supermarkets"
  | "Restaurants"
  | "Gyms";

export type NearbyPlace = GeoPoint & { name: string; category: NearbyCategory };

/**
 * Known points of interest used to compute straight-line distances for demo
 * listings. Travel time is never fabricated — only map distance is shown.
 */
export const pointsOfInterest: NearbyPlace[] = [
  { name: "Raidurg Metro Station", category: "Metro / Transport", lat: 17.4157, lng: 78.3831 },
  { name: "HITEC City MMTS", category: "Metro / Transport", lat: 17.4487, lng: 78.3808 },
  { name: "Miyapur Metro Station", category: "Metro / Transport", lat: 17.4966, lng: 78.3612 },
  { name: "KPHB Colony Metro", category: "Metro / Transport", lat: 17.4855, lng: 78.3915 },
  { name: "DLF Cyber City", category: "Workplaces", lat: 17.4353, lng: 78.3833 },
  { name: "Knowledge City", category: "Workplaces", lat: 17.4276, lng: 78.3441 },
  { name: "Mindspace IT Park", category: "Workplaces", lat: 17.4362, lng: 78.3854 },
  { name: "Financial District offices", category: "Workplaces", lat: 17.4156, lng: 78.3402 },
  { name: "Continental Hospitals", category: "Hospitals", lat: 17.4222, lng: 78.3383 },
  { name: "AIG Hospitals", category: "Hospitals", lat: 17.4237, lng: 78.3411 },
  { name: "KIMS Kondapur", category: "Hospitals", lat: 17.4653, lng: 78.3653 },
  { name: "Oakridge International School", category: "Schools", lat: 17.4463, lng: 78.3134 },
  { name: "Delhi Public School Nacharam Rd", category: "Schools", lat: 17.4324, lng: 78.3405 },
  { name: "Chirec International School", category: "Schools", lat: 17.4557, lng: 78.3699 },
  { name: "Ratnadeep Supermarket", category: "Supermarkets", lat: 17.4432, lng: 78.3512 },
  { name: "More Megastore", category: "Supermarkets", lat: 17.4611, lng: 78.3665 },
  { name: "DMart Miyapur", category: "Supermarkets", lat: 17.4931, lng: 78.3591 },
  { name: "Sarvi Restaurant", category: "Restaurants", lat: 17.4468, lng: 78.3521 },
  { name: "Barbeque Nation Gachibowli", category: "Restaurants", lat: 17.4419, lng: 78.3487 },
  { name: "Cult Fit Kondapur", category: "Gyms", lat: 17.4645, lng: 78.3651 },
  { name: "Gold's Gym Madhapur", category: "Gyms", lat: 17.4472, lng: 78.3908 },
];

export function nearbyFor(point: GeoPoint, perCategory = 2): NearbyPlace[] {
  const byCategory = new Map<NearbyCategory, (NearbyPlace & { km: number })[]>();
  for (const poi of pointsOfInterest) {
    const list = byCategory.get(poi.category) ?? [];
    list.push({ ...poi, km: distanceKm(point, poi) });
    byCategory.set(poi.category, list);
  }
  const out: NearbyPlace[] = [];
  for (const list of byCategory.values()) {
    list.sort((a, b) => a.km - b.km);
    out.push(...list.slice(0, perCategory));
  }
  return out;
}
