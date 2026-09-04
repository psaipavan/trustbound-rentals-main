import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

export type Filters = {
  minRent: number;
  maxRent: number;
  bhk: number[];
  propertyTypes: string[];
  furnishing: string[];
  listerType: string[];
  amenities: string[];
  zeroBrokerage: boolean;
  parking: boolean;
  pets: boolean;
  verifiedOnly: boolean;
  minScore: number;
  moveIn: string;
};

export const defaultFilters: Filters = {
  minRent: 10000,
  maxRent: 100000,
  bhk: [],
  propertyTypes: [],
  furnishing: [],
  listerType: [],
  amenities: [],
  zeroBrokerage: false,
  parking: false,
  pets: false,
  verifiedOnly: false,
  minScore: 0,
  moveIn: "",
};

export const amenityOptions = [
  "Gym",
  "Swimming pool",
  "Power backup",
  "Lift",
  "24x7 security",
  "Covered parking",
  "Children's play area",
];

export function countActiveFilters(f: Filters): number {
  let n = 0;
  if (f.minRent !== defaultFilters.minRent || f.maxRent !== defaultFilters.maxRent) n++;
  n += f.bhk.length + f.propertyTypes.length + f.furnishing.length + f.listerType.length;
  n += f.amenities.length;
  if (f.zeroBrokerage) n++;
  if (f.parking) n++;
  if (f.pets) n++;
  if (f.verifiedOnly) n++;
  if (f.minScore > 0) n++;
  if (f.moveIn) n++;
  return n;
}

export function FilterSidebar({
  filters,
  onChange,
  className,
  sticky = true,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  className?: string;
  sticky?: boolean;
}) {
  const toggle = <K extends "bhk" | "furnishing" | "listerType" | "propertyTypes" | "amenities">(
    key: K,
    value: Filters[K][number],
  ) => {
    const list = filters[key] as (string | number)[];
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    onChange({ ...filters, [key]: next } as Filters);
  };

  const active = countActiveFilters(filters);

  return (
    <aside
      className={cn(
        "surface-card h-fit p-5",
        sticky ? "lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto" : "",
        className,
      )}
      aria-label="Filters"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider">
          Filters{active ? ` (${active})` : ""}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => onChange(defaultFilters)}>
          Reset
        </Button>
      </div>

      <div className="mt-5 space-y-6">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rent range
          </Label>
          <p className="mt-2 text-sm font-bold">
            {inr(filters.minRent)} – {inr(filters.maxRent)} / mo
          </p>
          <Slider
            className="mt-3"
            min={10000}
            max={100000}
            step={1000}
            value={[filters.minRent, filters.maxRent]}
            onValueChange={([min, max]) =>
              onChange({
                ...filters,
                minRent: min ?? filters.minRent,
                maxRent: max ?? filters.maxRent,
              })
            }
          />
        </div>

        <Group
          title="BHK"
          options={[1, 2, 3, 4]}
          labels={(v) => (v === 4 ? "4+ BHK" : `${v} BHK`)}
          selected={filters.bhk}
          onToggle={(v) => toggle("bhk", v as number)}
        />

        <Group
          title="Property type"
          options={["Apartment", "Gated Community", "Independent House", "Villa", "Studio"]}
          selected={filters.propertyTypes}
          onToggle={(v) => toggle("propertyTypes", v as string)}
        />

        <Group
          title="Furnishing"
          options={["Unfurnished", "Semi-furnished", "Fully furnished"]}
          selected={filters.furnishing}
          onToggle={(v) => toggle("furnishing", v as string)}
        />

        <Group
          title="Listed by"
          options={["owner", "agent"]}
          labels={(v) => (v === "owner" ? "Owner direct" : "Verified agent")}
          selected={filters.listerType}
          onToggle={(v) => toggle("listerType", v as string)}
        />

        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Move-in by
          </Label>
          <Input
            type="date"
            className="mt-2"
            value={filters.moveIn}
            onChange={(e) => onChange({ ...filters, moveIn: e.target.value })}
          />
        </div>

        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Minimum Bricxley Score
          </Label>
          <p className="mt-2 text-sm font-bold">{filters.minScore || "Any"}</p>
          <Slider
            className="mt-3"
            min={0}
            max={95}
            step={5}
            value={[filters.minScore]}
            onValueChange={([v]) => onChange({ ...filters, minScore: v ?? 0 })}
          />
        </div>

        <Group
          title="Amenities"
          options={amenityOptions}
          selected={filters.amenities}
          onToggle={(v) => toggle("amenities", v as string)}
        />

        <div className="space-y-2.5">
          <Toggle
            id="zero-brokerage"
            label="Zero brokerage only"
            checked={filters.zeroBrokerage}
            onChange={(c) => onChange({ ...filters, zeroBrokerage: c })}
          />
          <Toggle
            id="parking"
            label="Parking available"
            checked={filters.parking}
            onChange={(c) => onChange({ ...filters, parking: c })}
          />
          <Toggle
            id="pets"
            label="Pets allowed"
            checked={filters.pets}
            onChange={(c) => onChange({ ...filters, pets: c })}
          />
          <Toggle
            id="verified"
            label="Verified properties only"
            checked={filters.verifiedOnly}
            onChange={(c) => onChange({ ...filters, verifiedOnly: c })}
          />
        </div>
      </div>
    </aside>
  );
}

function Toggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={(c) => onChange(Boolean(c))} />
      <Label htmlFor={id} className="font-normal">
        {label}
      </Label>
    </div>
  );
}

function Group<T extends string | number>({
  title,
  options,
  selected,
  onToggle,
  labels,
}: {
  title: string;
  options: T[];
  selected: (string | number)[];
  onToggle: (v: T) => void;
  labels?: (v: T) => string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="mt-2.5 space-y-2">
        {options.map((o) => (
          <div key={String(o)} className="flex items-center gap-2.5">
            <Checkbox
              id={`${title}-${o}`}
              checked={selected.includes(o)}
              onCheckedChange={() => onToggle(o)}
            />
            <Label htmlFor={`${title}-${o}`} className="font-normal">
              {labels ? labels(o) : String(o)}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
