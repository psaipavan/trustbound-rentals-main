import prop1 from "@/assets/prop-1.jpg";
import prop2 from "@/assets/prop-2.jpg";
import prop3 from "@/assets/prop-3.jpg";
import prop4 from "@/assets/prop-4.jpg";
import prop5 from "@/assets/prop-5.jpg";
import prop6 from "@/assets/prop-6.jpg";

/**
 * Prototype data layer.
 *
 * These types mirror the intended database tables (properties, profiles,
 * verifications) so the UI can be swapped to a real backend without changing
 * component contracts. Nothing here is real market data.
 */

export type ListerType = "owner" | "agent";

export type Lister = {
  id: string;
  type: ListerType;
  name: string;
  agency?: string;
  memberSince: string;
  responseTime: string;
  identityVerified: boolean;
  propertyAssociationVerified: boolean;
  activeListings: number;
  /** Only rendered when real ratings exist. */
  rating?: number;
};

export type BoundScore = {
  /** Demo score for the prototype — not a verified computation. */
  total: number;
  dimensions: { label: string; met: boolean }[];
};

export type Property = {
  id: string;
  title: string;
  locality: string;
  city: string;
  rent: number;
  deposit: number;
  maintenance: number;
  brokerage: number;
  bhk: number;
  bathrooms: number;
  areaSqft: number;
  furnishing: "Unfurnished" | "Semi-furnished" | "Fully furnished";
  propertyType: "Apartment" | "Independent House" | "Villa" | "Studio" | "Gated Community";
  floor: string;
  parking: string;
  availableFrom: string;
  tenantPreference: string;
  petPolicy: string;
  propertyAgeYears: number;
  availabilityConfirmedHoursAgo: number;
  verifiedHoursAgo: number;
  images: string[];
  description: string;
  amenities: string[];
  nearby: { label: string; value: string }[];
  lister: Lister;
  boundScore: BoundScore;
  ownerVerified: boolean;
  propertyVerified: boolean;
  /** Map position of the listing (demo coordinates near the real locality). */
  lat: number;
  lng: number;
  /** Owners may keep the exact building private until an inquiry starts. */
  locationPrivacy: "exact" | "approximate";
  status: "available" | "rented" | "paused";
  postedDaysAgo: number;
};

type SeedProperty = Omit<Property, "lat" | "lng" | "locationPrivacy" | "status" | "postedDaysAgo">;

const owner = (over: Partial<Lister> & { id: string; name: string }): Lister => ({
  type: "owner",
  memberSince: "2024",
  responseTime: "Usually replies within 2 hours",
  identityVerified: true,
  propertyAssociationVerified: true,
  activeListings: 1,
  ...over,
});

const agent = (over: Partial<Lister> & { id: string; name: string; agency: string }): Lister => ({
  type: "agent",
  memberSince: "2023",
  responseTime: "Usually replies within 1 hour",
  identityVerified: true,
  propertyAssociationVerified: true,
  activeListings: 12,
  ...over,
});

const score = (total: number, missing: string[] = []): BoundScore => ({
  total,
  dimensions: [
    "Identity Verified",
    "Property Verified",
    "Photos Checked",
    "Availability Confirmed",
    "Transparent Pricing",
  ].map((label) => ({ label, met: !missing.includes(label) })),
});

const seedProperties: SeedProperty[] = [
  {
    id: "br-001",
    title: "Bright 2BHK in a quiet gated community",
    locality: "Gachibowli",
    city: "Hyderabad",
    rent: 32000,
    deposit: 64000,
    maintenance: 2500,
    brokerage: 0,
    bhk: 2,
    bathrooms: 2,
    areaSqft: 1180,
    furnishing: "Semi-furnished",
    propertyType: "Gated Community",
    floor: "6th of 14",
    parking: "1 covered car + 1 two-wheeler",
    availableFrom: "Immediately",
    tenantPreference: "Family or working professionals",
    petPolicy: "Pets allowed",
    propertyAgeYears: 5,
    availabilityConfirmedHoursAgo: 4,
    verifiedHoursAgo: 9,
    images: [prop1, prop3, prop4, prop6],
    description:
      "A calm, well-lit 2BHK inside a gated community close to the Gachibowli tech corridor. The home gets good morning light, has modular kitchen fittings and wardrobes in both bedrooms. Community includes a gym, clubhouse and 24x7 security.",
    amenities: [
      "Lift",
      "Power backup",
      "24x7 security",
      "Gym",
      "Clubhouse",
      "Children's play area",
      "Piped gas",
      "Visitor parking",
    ],
    nearby: [
      { label: "Nearby workplaces", value: "Gachibowli IT corridor, DLF Cyber City" },
      { label: "Metro", value: "Nearest station — distance to be connected" },
      { label: "Supermarkets", value: "Two large-format stores within the locality" },
      { label: "Hospitals", value: "Multi-speciality hospital in the locality" },
      { label: "Schools", value: "Several CBSE/IB schools nearby" },
      { label: "Commute estimate", value: "Estimates connected in a later release" },
    ],
    lister: owner({ id: "u-anita", name: "Verified Owner · A. Reddy" }),
    boundScore: score(94),
    ownerVerified: true,
    propertyVerified: true,
  },
  {
    id: "br-002",
    title: "Skyline-facing 3BHK with large balcony",
    locality: "Kokapet",
    city: "Hyderabad",
    rent: 58000,
    deposit: 174000,
    maintenance: 4500,
    brokerage: 29000,
    bhk: 3,
    bathrooms: 3,
    areaSqft: 1820,
    furnishing: "Fully furnished",
    propertyType: "Apartment",
    floor: "21st of 32",
    parking: "2 covered car parks",
    availableFrom: "15 Oct 2026",
    tenantPreference: "Family",
    petPolicy: "Pets on request",
    propertyAgeYears: 2,
    availabilityConfirmedHoursAgo: 11,
    verifiedHoursAgo: 20,
    images: [prop2, prop6, prop1, prop4],
    description:
      "High-floor 3BHK with an uninterrupted skyline view, full furnishing and premium fittings. Suited to families relocating to the Financial District area who want a move-in ready home.",
    amenities: [
      "Lift",
      "Power backup",
      "Swimming pool",
      "Gym",
      "Concierge",
      "Air conditioning",
      "Modular kitchen",
      "Covered parking",
    ],
    nearby: [
      { label: "Nearby workplaces", value: "Financial District, Neopolis offices" },
      { label: "Metro", value: "Nearest station — distance to be connected" },
      { label: "Supermarkets", value: "In-community convenience retail" },
      { label: "Hospitals", value: "Multi-speciality hospital within 15 min drive" },
      { label: "Schools", value: "International schools in the corridor" },
      { label: "Commute estimate", value: "Estimates connected in a later release" },
    ],
    lister: agent({
      id: "a-skyline",
      name: "Verified Agent · S. Kumar",
      agency: "Skyline Homes Realty",
      activeListings: 18,
    }),
    boundScore: score(88, ["Photos Checked"]),
    ownerVerified: false,
    propertyVerified: true,
  },
  {
    id: "br-003",
    title: "Compact 1BHK walkable to HITEC City",
    locality: "Madhapur",
    city: "Hyderabad",
    rent: 21000,
    deposit: 42000,
    maintenance: 1500,
    brokerage: 0,
    bhk: 1,
    bathrooms: 1,
    areaSqft: 620,
    furnishing: "Semi-furnished",
    propertyType: "Studio",
    floor: "3rd of 5",
    parking: "1 two-wheeler",
    availableFrom: "Immediately",
    tenantPreference: "Bachelors or working professionals",
    petPolicy: "No pets",
    propertyAgeYears: 8,
    availabilityConfirmedHoursAgo: 2,
    verifiedHoursAgo: 6,
    images: [prop5, prop3, prop1],
    description:
      "A practical, low-maintenance home for someone working in HITEC City. Walkable to cafés, coworking spaces and daily-needs stores.",
    amenities: ["Lift", "Power backup", "Water supply", "Security", "Wardrobe", "Geyser"],
    nearby: [
      { label: "Nearby workplaces", value: "HITEC City, Raheja Mindspace" },
      { label: "Metro", value: "Hitec City corridor — distance to be connected" },
      { label: "Supermarkets", value: "Daily-needs stores on the same street" },
      { label: "Hospitals", value: "Clinics and a hospital nearby" },
      { label: "Schools", value: "Schools within the locality" },
      { label: "Commute estimate", value: "Estimates connected in a later release" },
    ],
    lister: owner({ id: "u-ravi", name: "Verified Owner · R. Sharma", memberSince: "2025" }),
    boundScore: score(91),
    ownerVerified: true,
    propertyVerified: true,
  },
  {
    id: "br-004",
    title: "Family 3BHK in a green community",
    locality: "Nallagandla",
    city: "Hyderabad",
    rent: 38000,
    deposit: 100000,
    maintenance: 3200,
    brokerage: 0,
    bhk: 3,
    bathrooms: 3,
    areaSqft: 1640,
    furnishing: "Unfurnished",
    propertyType: "Gated Community",
    floor: "9th of 18",
    parking: "1 covered car park",
    availableFrom: "1 Oct 2026",
    tenantPreference: "Family",
    petPolicy: "Pets allowed",
    propertyAgeYears: 6,
    availabilityConfirmedHoursAgo: 7,
    verifiedHoursAgo: 14,
    images: [prop4, prop1, prop3, prop6],
    description:
      "Spacious unfurnished 3BHK inside a large green community with walking tracks, a clubhouse and sports courts. Good option for families with school-going children.",
    amenities: [
      "Lift",
      "Power backup",
      "Clubhouse",
      "Jogging track",
      "Badminton court",
      "Children's play area",
      "24x7 security",
    ],
    nearby: [
      { label: "Nearby workplaces", value: "Gachibowli, Lingampally corridor" },
      { label: "Metro", value: "Nearest station — distance to be connected" },
      { label: "Supermarkets", value: "Large-format store within the community" },
      { label: "Hospitals", value: "Hospital within 10 min drive" },
      { label: "Schools", value: "Multiple schools in Nallagandla" },
      { label: "Commute estimate", value: "Estimates connected in a later release" },
    ],
    lister: owner({ id: "u-lakshmi", name: "Verified Owner · L. Rao", memberSince: "2023" }),
    boundScore: score(90),
    ownerVerified: true,
    propertyVerified: true,
  },
  {
    id: "br-005",
    title: "Semi-furnished 2BHK near Financial District",
    locality: "Manikonda",
    city: "Hyderabad",
    rent: 27500,
    deposit: 55000,
    maintenance: 2000,
    brokerage: 13750,
    bhk: 2,
    bathrooms: 2,
    areaSqft: 1100,
    furnishing: "Semi-furnished",
    propertyType: "Apartment",
    floor: "4th of 9",
    parking: "1 open car park",
    availableFrom: "Immediately",
    tenantPreference: "Any",
    petPolicy: "Pets on request",
    propertyAgeYears: 7,
    availabilityConfirmedHoursAgo: 16,
    verifiedHoursAgo: 26,
    images: [prop3, prop5, prop1],
    description:
      "Value 2BHK a short drive from the Financial District, with wardrobes, modular kitchen and a covered balcony.",
    amenities: ["Lift", "Power backup", "Security", "Wardrobe", "Modular kitchen", "Balcony"],
    nearby: [
      { label: "Nearby workplaces", value: "Financial District, Gachibowli" },
      { label: "Metro", value: "Nearest station — distance to be connected" },
      { label: "Supermarkets", value: "Supermarkets on the main road" },
      { label: "Hospitals", value: "Hospital nearby" },
      { label: "Schools", value: "Schools within the locality" },
      { label: "Commute estimate", value: "Estimates connected in a later release" },
    ],
    lister: agent({
      id: "a-urban",
      name: "Verified Agent · N. Fatima",
      agency: "Urban Key Property Advisors",
      activeListings: 9,
    }),
    boundScore: score(85, ["Photos Checked", "Availability Confirmed"]),
    ownerVerified: false,
    propertyVerified: true,
  },
  {
    id: "br-006",
    title: "Fully furnished 2BHK for quick move-in",
    locality: "Kondapur",
    city: "Hyderabad",
    rent: 42000,
    deposit: 84000,
    maintenance: 3000,
    brokerage: 0,
    bhk: 2,
    bathrooms: 2,
    areaSqft: 1290,
    furnishing: "Fully furnished",
    propertyType: "Apartment",
    floor: "11th of 15",
    parking: "1 covered car park",
    availableFrom: "Immediately",
    tenantPreference: "Working professionals",
    petPolicy: "Pets allowed",
    propertyAgeYears: 3,
    availabilityConfirmedHoursAgo: 1,
    verifiedHoursAgo: 3,
    images: [prop6, prop2, prop3, prop5],
    description:
      "Move-in ready 2BHK with all furniture, appliances and air conditioning included. Ideal for professionals relocating to Hyderabad who want zero setup effort.",
    amenities: [
      "Lift",
      "Power backup",
      "Air conditioning",
      "Washing machine",
      "Refrigerator",
      "Gym",
      "24x7 security",
    ],
    nearby: [
      { label: "Nearby workplaces", value: "HITEC City, Kondapur offices" },
      { label: "Metro", value: "Nearest station — distance to be connected" },
      { label: "Supermarkets", value: "Multiple supermarkets nearby" },
      { label: "Hospitals", value: "Multi-speciality hospital nearby" },
      { label: "Schools", value: "Schools within 3 km" },
      { label: "Commute estimate", value: "Estimates connected in a later release" },
    ],
    lister: owner({ id: "u-vinay", name: "Verified Owner · V. Chandra", memberSince: "2022" }),
    boundScore: score(96),
    ownerVerified: true,
    propertyVerified: true,
  },
];

/* ------------------------------------------------------------------ */
/* Coordinates + additional demo inventory across Hyderabad localities  */
/* ------------------------------------------------------------------ */

import { localityCoords, HYDERABAD_CENTER } from "@/data/geo";

/** Deterministic jitter so listings spread out instead of stacking. */
function place(locality: string, i: number) {
  const base = localityCoords[locality] ?? HYDERABAD_CENTER;
  const angle = (i * 137.5 * Math.PI) / 180;
  const radius = 0.004 + (i % 5) * 0.0022;
  return {
    lat: +(base.lat + Math.sin(angle) * radius).toFixed(6),
    lng: +(base.lng + Math.cos(angle) * radius).toFixed(6),
  };
}

const stockImages = [prop1, prop2, prop3, prop4, prop5, prop6];

type GenSpec = [
  locality: string,
  bhk: number,
  rent: number,
  type: Property["propertyType"],
  furnishing: Property["furnishing"],
  brokerage: number,
];

const generatedSpecs: GenSpec[] = [
  ["Financial District", 3, 52000, "Gated Community", "Fully furnished", 26000],
  ["Financial District", 2, 36000, "Apartment", "Semi-furnished", 0],
  ["HITEC City", 1, 19500, "Studio", "Fully furnished", 0],
  ["HITEC City", 3, 47000, "Apartment", "Semi-furnished", 23500],
  ["Kondapur", 2, 29000, "Apartment", "Unfurnished", 0],
  ["Madhapur", 3, 55000, "Gated Community", "Fully furnished", 27500],
  ["Miyapur", 2, 18500, "Apartment", "Semi-furnished", 0],
  ["Miyapur", 3, 26000, "Independent House", "Unfurnished", 13000],
  ["Kukatpally", 2, 22000, "Apartment", "Semi-furnished", 0],
  ["Kukatpally", 1, 14500, "Studio", "Semi-furnished", 0],
  ["Chandanagar", 2, 17000, "Independent House", "Unfurnished", 0],
  ["Chandanagar", 3, 24000, "Apartment", "Semi-furnished", 12000],
  ["Nanakramguda", 4, 78000, "Villa", "Fully furnished", 39000],
  ["Nanakramguda", 2, 34000, "Apartment", "Semi-furnished", 0],
  ["Nallagandla", 3, 41000, "Gated Community", "Semi-furnished", 0],
  ["Manikonda", 1, 16000, "Studio", "Unfurnished", 0],
  ["Kokapet", 3, 62000, "Villa", "Fully furnished", 31000],
  ["Gachibowli", 3, 45000, "Apartment", "Fully furnished", 22500],
];

const generatedProperties: SeedProperty[] = generatedSpecs.map(
  ([locality, bhk, rent, propertyType, furnishing, brokerage], i) => {
    const isAgent = brokerage > 0;
    const idx = i + 7;
    return {
      id: `ib-${String(idx).padStart(3, "0")}`,
      title: `${bhk} BHK ${propertyType.toLowerCase()} in ${locality}`,
      locality,
      city: "Hyderabad",
      rent,
      deposit: rent * 2,
      maintenance: 1200 + (i % 4) * 600,
      brokerage,
      bhk,
      bathrooms: Math.max(1, bhk - (i % 2)),
      areaSqft: 480 + bhk * 420 + (i % 3) * 60,
      furnishing,
      propertyType,
      floor: `${1 + (i % 12)}th of ${14 + (i % 6)}`,
      parking: i % 3 === 0 ? "1 two-wheeler" : "1 covered car + 1 two-wheeler",
      availableFrom: i % 4 === 0 ? "Immediately" : `From ${["1 Oct", "15 Oct", "1 Nov"][i % 3]}`,
      tenantPreference: i % 3 === 0 ? "Family preferred" : "Family or working professionals",
      petPolicy: i % 2 === 0 ? "Pets allowed" : "Pets not allowed",
      propertyAgeYears: 1 + (i % 9),
      availabilityConfirmedHoursAgo: 2 + (i % 30),
      verifiedHoursAgo: 12 + (i % 60),
      images: [
        stockImages[i % 6] as string,
        stockImages[(i + 2) % 6] as string,
        stockImages[(i + 4) % 6] as string,
      ],
      description: `A ${furnishing.toLowerCase()} ${bhk} BHK ${propertyType.toLowerCase()} in ${locality}, close to the ${locality} main road and the wider IT corridor. Demo listing created for the Bricxley prototype.`,
      amenities: [
        "Power backup",
        "Lift",
        "24x7 security",
        ...(i % 2 === 0 ? ["Gym", "Swimming pool"] : ["Children's play area"]),
        ...(i % 3 === 0 ? ["Covered parking"] : []),
      ],
      nearby: [
        { label: "Nearby workplaces", value: "IT corridor offices" },
        { label: "Metro", value: "Nearest station shown on the map" },
        { label: "Supermarkets", value: "Supermarkets within walking distance" },
      ],
      lister: isAgent
        ? agent({
            id: `u-agent-${idx}`,
            name: `Verified Agent · ${["R. Sharma", "K. Prasad", "S. Iyer", "M. Fatima"][i % 4]}`,
            agency: ["Bricxley Realty Partners", "Cyber Homes", "Skyline Estates", "Urban Nest"][
              i % 4
            ] as string,
          })
        : owner({
            id: `u-owner-${idx}`,
            name: `Verified Owner · ${["A. Rao", "P. Menon", "D. Kaur", "N. Reddy"][i % 4]}`,
          }),
      boundScore: score(78 + (i % 20), i % 5 === 0 ? ["Photos Checked"] : []),
      ownerVerified: !isAgent,
      propertyVerified: i % 6 !== 0,
    };
  },
);

export const properties: Property[] = [...seedProperties, ...generatedProperties].map((p, i) => ({
  ...p,
  ...place(p.locality, i),
  locationPrivacy: i % 4 === 0 ? "approximate" : "exact",
  status: "available",
  postedDaysAgo: (i * 3) % 45,
}));

export const sortOptions = [
  { key: "recommended", label: "Recommended" },
  { key: "newest", label: "Newest" },
  { key: "rent-asc", label: "Rent: Low to High" },
  { key: "rent-desc", label: "Rent: High to Low" },
  { key: "score", label: "Highest Bricxley Score" },
] as const;

export type SortKey = (typeof sortOptions)[number]["key"];

export function sortProperties(list: Property[], key: SortKey): Property[] {
  const out = [...list];
  switch (key) {
    case "newest":
      return out.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    case "rent-asc":
      return out.sort((a, b) => a.rent - b.rent);
    case "rent-desc":
      return out.sort((a, b) => b.rent - a.rent);
    case "score":
      return out.sort((a, b) => b.boundScore.total - a.boundScore.total);
    default:
      return out.sort(
        (a, b) =>
          b.boundScore.total - a.boundScore.total ||
          a.availabilityConfirmedHoursAgo - b.availabilityConfirmedHoursAgo,
      );
  }
}

export function moveInCost(p: Property) {
  return {
    monthly: p.rent + p.maintenance,
    oneTime: p.deposit + p.brokerage,
    total: p.rent + p.maintenance + p.deposit + p.brokerage,
  };
}

export function getProperty(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

export const presetChatQuestions = [
  "Is this still available?",
  "Can I schedule a visit?",
  "Is the rent negotiable?",
  "What is the final deposit?",
  "When can I move in?",
];

export const reportReasons = [
  "Property already rented",
  "Fake listing",
  "Agent pretending to be owner",
  "Wrong location",
  "Incorrect price",
  "Misleading photos",
  "Owner requesting payment before visit",
  "Duplicate property",
  "Other",
];
