import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, IndianRupee, Home, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationAutocomplete } from "@/components/search/LocationAutocomplete";
import { quickChips } from "@/data/localities";
import { cn } from "@/lib/utils";

const budgets: [string, string, number | undefined, number | undefined][] = [
  ["any", "Any budget", undefined, undefined],
  ["0-25000", "Under ₹25,000", 10000, 25000],
  ["25000-40000", "₹25,000 – ₹40,000", 25000, 40000],
  ["40000-60000", "₹40,000 – ₹60,000", 40000, 60000],
  ["60000-1000000", "Above ₹60,000", 60000, 100000],
];

export function SearchBar({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [type, setType] = useState("any");
  const [budget, setBudget] = useState("any");
  const [bhk, setBhk] = useState("any");
  const [moveIn, setMoveIn] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const range = budgets.find((b) => b[0] === budget);
    navigate({
      to: "/rent",
      search: {
        q: location || undefined,
        type,
        bhk,
        minRent: range?.[2],
        maxRent: range?.[3],
        moveIn: moveIn || undefined,
        sort: "recommended",
        view: "split",
      },
    });
  };

  return (
    <section
      className={cn(
        "surface-card p-4 shadow-[var(--shadow-panel)] transition-shadow duration-200 focus-within:shadow-[var(--shadow-lift)] motion-reduce:transition-none sm:p-5",
        className,
      )}
      aria-label="Property search"
    >
      <form onSubmit={submit} className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_0.8fr_1fr_auto]">
        <Field label="Location / Locality" icon={MapPin}>
          <LocationAutocomplete
            value={location}
            onChange={setLocation}
            inputClassName="border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </Field>

        <Field label="Property Type" icon={Home}>
          <SelectControl
            value={type}
            onChange={setType}
            options={[
              ["any", "Any type"],
              ["Apartment", "Apartment"],
              ["Gated Community", "Gated Community"],
              ["Independent House", "Independent House"],
              ["Villa", "Villa"],
              ["Studio", "Studio"],
            ]}
          />
        </Field>

        <Field label="Budget" icon={IndianRupee}>
          <SelectControl
            value={budget}
            onChange={setBudget}
            options={budgets.map((b) => [b[0], b[1]] as [string, string])}
          />
        </Field>

        <Field label="BHK">
          <SelectControl
            value={bhk}
            onChange={setBhk}
            options={[
              ["any", "Any"],
              ["1", "1 BHK"],
              ["2", "2 BHK"],
              ["3", "3 BHK"],
              ["4", "4+ BHK"],
            ]}
          />
        </Field>

        <Field label="Move-in Date" icon={CalendarDays}>
          <Input
            type="date"
            value={moveIn}
            onChange={(e) => setMoveIn(e.target.value)}
            className="border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </Field>

        <Button type="submit" size="lg" className="h-full min-h-12 lg:px-6">
          <Search className="h-4 w-4" />
          Explore Rentals
        </Button>
      </form>

      {!compact ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Popular
          </span>
          {quickChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() =>
                navigate({
                  to: "/rent",
                  search: { q: chip, type: "any", bhk: "any", sort: "recommended", view: "split" },
                })
              }
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:-translate-y-0.5 hover:border-primary hover:text-primary motion-reduce:hover:translate-y-0"
            >
              {chip}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-3.5 py-2 transition-[border-color,box-shadow] duration-150 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 motion-reduce:transition-none">
      <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
        {label}
      </Label>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function SelectControl({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 border-0 px-0 shadow-none focus:ring-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([v, label]) => (
          <SelectItem key={v} value={v}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
