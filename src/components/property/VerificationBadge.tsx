import { BadgeCheck, Building2, IndianRupee, ShieldCheck, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "owner" | "property" | "direct" | "agent" | "brokerage" | "neutral";

const styles: Record<Variant, string> = {
  owner: "bg-verified/10 text-verified border-verified/25",
  property: "bg-verified/10 text-verified border-verified/25",
  direct: "bg-primary/10 text-primary border-primary/25",
  agent: "bg-navy/8 text-navy border-navy/20",
  brokerage: "bg-warning/15 text-warning-foreground border-warning/35",
  neutral: "bg-muted text-muted-foreground border-border",
};

const icons: Record<Variant, typeof BadgeCheck> = {
  owner: BadgeCheck,
  property: ShieldCheck,
  direct: UserRound,
  agent: Building2,
  brokerage: IndianRupee,
  neutral: BadgeCheck,
};

export function VerificationBadge({
  variant = "neutral",
  label,
  className,
  animate = false,
}: {
  variant?: Variant;
  label: string;
  className?: string;
  animate?: boolean;
}) {
  const Icon = icons[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        styles[variant],
        animate && "animate-[badge-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}
