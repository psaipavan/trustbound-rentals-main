import { useState } from "react";
import { CircleCheck, CircleSlash, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { hoursAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

type Status = "available" | "rented" | "paused";

const options: { key: Status; label: string; icon: React.ElementType }[] = [
  { key: "available", label: "Still Available", icon: CircleCheck },
  { key: "rented", label: "Rental Confirmed", icon: CircleSlash },
  { key: "paused", label: "Temporarily Unavailable", icon: Clock3 },
];

export function AvailabilityControl({
  confirmedHoursAgo,
  ownerView = false,
}: {
  confirmedHoursAgo: number;
  ownerView?: boolean;
}) {
  const [status, setStatus] = useState<Status>("available");

  return (
    <div className="surface-card p-5">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verified/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-verified" />
        </span>
        Availability confirmed {hoursAgo(confirmedHoursAgo)}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Owners and agents re-confirm availability regularly, so you don’t chase homes that are
        already rented.
      </p>

      {ownerView ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => {
                setStatus(o.key);
                toast.success(`Marked as “${o.label}”`);
              }}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition",
                status === o.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50",
              )}
            >
              <o.icon className="h-4 w-4" aria-hidden />
              {o.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
