import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { properties } from "@/data/properties";
import { hoursAgo, inr } from "@/lib/format";
import { useSaved } from "@/lib/saved-store";

const rows = [
  { key: "rent", label: "Rent" },
  { key: "deposit", label: "Deposit" },
  { key: "maintenance", label: "Maintenance" },
  { key: "locality", label: "Locality" },
  { key: "furnishing", label: "Furnishing" },
  { key: "brokerage", label: "Brokerage" },
  { key: "availability", label: "Availability" },
  { key: "score", label: "Demo Bricxley Score" },
  { key: "total", label: "Est. move-in cost" },
] as const;

export function CompareDrawer() {
  const { compareOpen, setCompareOpen, saved, toggle } = useSaved();
  const items = properties.filter((p) => saved.includes(p.id));

  return (
    <Sheet open={compareOpen} onOpenChange={setCompareOpen}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl p-6">
        <SheetHeader className="p-0 text-left">
          <SheetTitle>Saved homes &amp; comparison</SheetTitle>
          <SheetDescription>
            Compare rent, deposit, brokerage and availability side by side.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center">
            <Heart className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm text-muted-foreground">
              No saved homes yet. Tap the heart on any listing to add it here.
            </p>
            <Button asChild className="mt-4" onClick={() => setCompareOpen(false)}>
              <Link to="/rent">Browse rentals</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="w-40 p-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    Comparison
                  </th>
                  {items.map((p) => (
                    <th key={p.id} className="p-3 text-left align-top">
                      <Link
                        to="/property/$propertyId"
                        params={{ propertyId: p.id }}
                        onClick={() => setCompareOpen(false)}
                        className="font-semibold hover:text-primary"
                      >
                        {p.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => void toggle(p.id)}
                        className="mt-1 block text-xs font-medium text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="odd:bg-muted/50">
                    <td className="rounded-l-lg p-3 font-medium text-muted-foreground">
                      {row.label}
                    </td>
                    {items.map((p) => (
                      <td key={p.id} className="p-3">
                        {row.key === "rent" && `${inr(p.rent)} / mo`}
                        {row.key === "deposit" && inr(p.deposit)}
                        {row.key === "maintenance" && `${inr(p.maintenance)} / mo`}
                        {row.key === "locality" && p.locality}
                        {row.key === "furnishing" && p.furnishing}
                        {row.key === "brokerage" &&
                          (p.brokerage > 0 ? inr(p.brokerage) : "₹0 · Owner direct")}
                        {row.key === "availability" &&
                          `Confirmed ${hoursAgo(p.availabilityConfirmedHoursAgo)}`}
                        {row.key === "score" && `${p.boundScore.total} / 100`}
                        {row.key === "total" &&
                          inr(p.rent + p.deposit + p.maintenance + p.brokerage)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
