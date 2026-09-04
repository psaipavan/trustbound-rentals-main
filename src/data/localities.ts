export type Locality = {
  slug: string;
  name: string;
  blurb: string;
  bestFor: string;
  metro: string;
  rangeNote: string;
};

/**
 * Prototype locality content. Rental ranges, commute times and market data are
 * intentionally left as placeholders — real values will be connected to a data
 * source before launch.
 */
export const localities: Locality[] = [
  {
    slug: "gachibowli",
    name: "Gachibowli",
    blurb: "Dense IT corridor with gated communities and quick access to ORR.",
    bestFor: "Working professionals",
    metro: "Metro access — data pending",
    rangeNote: "Typical range — to be connected",
  },
  {
    slug: "financial-district",
    name: "Financial District",
    blurb: "Campus offices, newer towers and wide roads.",
    bestFor: "Corporate campuses",
    metro: "Metro access — data pending",
    rangeNote: "Typical range — to be connected",
  },
  {
    slug: "hitec-city",
    name: "HITEC City",
    blurb: "The original tech hub with mature retail and nightlife.",
    bestFor: "Convenience seekers",
    metro: "On the Blue Line corridor",
    rangeNote: "Typical range — to be connected",
  },
  {
    slug: "kondapur",
    name: "Kondapur",
    blurb: "Balanced mix of independent homes and community apartments.",
    bestFor: "Families",
    metro: "Metro access — data pending",
    rangeNote: "Typical range — to be connected",
  },
  {
    slug: "madhapur",
    name: "Madhapur",
    blurb: "Walkable to offices, cafés and coworking spaces.",
    bestFor: "Young professionals",
    metro: "Close to Hitec City station",
    rangeNote: "Typical range — to be connected",
  },
  {
    slug: "kokapet",
    name: "Kokapet",
    blurb: "Fast-developing skyline with premium high-rises.",
    bestFor: "Premium rentals",
    metro: "Metro access — data pending",
    rangeNote: "Typical range — to be connected",
  },
  {
    slug: "nallagandla",
    name: "Nallagandla",
    blurb: "Quieter, greener community living near Lingampally.",
    bestFor: "Families & quiet living",
    metro: "Metro access — data pending",
    rangeNote: "Typical range — to be connected",
  },
  {
    slug: "manikonda",
    name: "Manikonda",
    blurb: "Value rentals close to the Financial District.",
    bestFor: "Budget-conscious renters",
    metro: "Metro access — data pending",
    rangeNote: "Typical range — to be connected",
  },
  {
    slug: "miyapur",
    name: "Miyapur",
    blurb: "Metro terminus with spacious, affordable apartments.",
    bestFor: "Commuters",
    metro: "Red Line terminus",
    rangeNote: "Typical range — to be connected",
  },
  {
    slug: "kukatpally",
    name: "Kukatpally",
    blurb: "Established neighbourhood with schools and markets.",
    bestFor: "Long-term residents",
    metro: "KPHB metro corridor",
    rangeNote: "Typical range — to be connected",
  },
];

export const quickChips = [
  "Gachibowli",
  "Financial District",
  "HITEC City",
  "Kondapur",
  "Madhapur",
  "Kokapet",
  "Nallagandla",
  "Manikonda",
];
