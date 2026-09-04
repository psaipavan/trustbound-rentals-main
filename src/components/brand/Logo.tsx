import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * Bricxley temporary wordmark. The mark combines a doorway with a minimal B.
 */
export function BricxleyMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="Bricxley logo"
      className={cn("h-8 w-8", className)}
    >
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="9.5" className="fill-navy" />
      <rect x="8" y="9" width="3" height="14" rx="1.5" className="fill-primary" />
      <path
        d="M15 23V13.5A4.5 4.5 0 0 1 19.5 9h0A4.5 4.5 0 0 1 24 13.5v0A4.5 4.5 0 0 1 19.5 18H15"
        fill="none"
        strokeWidth="2.6"
        strokeLinecap="round"
        className="stroke-navy-foreground"
      />
      <circle cx="19.5" cy="13.6" r="1.7" className="fill-primary" />
    </svg>
  );
}

export function BricxleyLogo({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BricxleyMark />
      <span className="flex flex-col leading-none">
        <span className="text-[1.05rem] font-extrabold tracking-tight">{BRAND.name}</span>
        {showTagline ? (
          <span className="mt-1 text-xs text-muted-foreground">Rent with clarity.</span>
        ) : null}
      </span>
    </span>
  );
}
