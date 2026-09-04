import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchPlaces, type PlaceSuggestion } from "@/data/geo";
import { cn } from "@/lib/utils";

export function LocationAutocomplete({
  value,
  onChange,
  onSelectPlace,
  placeholder = "Search Gachibowli, DLF Cyber City, Kondapur…",
  className,
  inputClassName,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelectPlace?: (place: PlaceSuggestion) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const results = useMemo(() => searchPlaces(value), [value]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const choose = (place: PlaceSuggestion) => {
    onChange(place.name);
    onSelectPlace?.(place);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || results.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => (h + 1) % results.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => (h - 1 + results.length) % results.length);
          } else if (e.key === "Enter" && open) {
            const pick = results[highlight];
            if (pick) {
              e.preventDefault();
              choose(pick);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-label="Location or landmark"
        className={inputClassName}
      />

      {open && results.length > 0 ? (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-50 mt-2 w-full min-w-64 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-[var(--shadow-panel)] animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {results.map((r, i) => (
            <li key={`${r.kind}-${r.name}`}>
              <button
                type="button"
                role="option"
                aria-selected={i === highlight}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => choose(r)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  i === highlight ? "bg-muted" : "",
                )}
              >
                {r.kind === "locality" ? (
                  <MapPin className="h-4 w-4 text-primary" aria-hidden />
                ) : (
                  <Building2 className="h-4 w-4 text-primary" aria-hidden />
                )}
                <span className="font-medium">{r.name}</span>
                {r.kind === "landmark" ? (
                  <span className="ml-auto text-xs text-muted-foreground">{r.locality}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
