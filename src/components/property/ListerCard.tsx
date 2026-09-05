import { BadgeCheck, Building2, Clock3, Lock, ShieldCheck, Star, UserRound } from "lucide-react";
import { VerificationBadge } from "@/components/property/VerificationBadge";
import type { Lister } from "@/data/properties";
import { inr } from "@/lib/format";

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto text-right font-medium">{value}</span>
    </div>
  );
}

export function OwnerCard({ lister }: { lister: Lister }) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-verified/12 text-verified">
          <UserRound className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="font-bold">Verified Owner</p>
          <p className="text-sm text-muted-foreground">{lister.name}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <VerificationBadge variant="owner" label="Identity verified" animate />
        <VerificationBadge variant="property" label="Property association verified" />
        <VerificationBadge variant="direct" label="Owner Direct · Brokerage ₹0" />
      </div>
      <div className="mt-4 space-y-2.5 border-t border-border pt-4">
        <Row icon={BadgeCheck} label="Member since" value={lister.memberSince} />
        <Row icon={Clock3} label="Response time" value={lister.responseTime} />
      </div>
      <p className="mt-4 flex gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Phone numbers stay private. Start a secure Bricxley chat — contact details are shared only
        when both sides choose to.
      </p>
    </div>
  );
}

export function AgentCard({ lister, brokerage }: { lister: Lister; brokerage: number }) {
  return (
    <div className="surface-card overflow-hidden">
      <div className="bg-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-navy-foreground">
        Agent Listing
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-navy/8 text-navy">
            <Building2 className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-bold">Verified Agent</p>
            <p className="text-sm text-muted-foreground">
              {lister.name} · {lister.agency}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <VerificationBadge variant="agent" label="Verified Agent" animate />
          <VerificationBadge variant="owner" label="Identity verified" />
          <VerificationBadge variant="brokerage" label={`Brokerage: ${inr(brokerage)}`} />
        </div>

        <div className="mt-4 space-y-2.5 border-t border-border pt-4">
          <Row icon={Building2} label="Agency" value={lister.agency ?? "—"} />
          <Row icon={ShieldCheck} label="Verification" value="Identity & licence on file" />
          <Row icon={BadgeCheck} label="Active listings" value={String(lister.activeListings)} />
          <Row icon={Clock3} label="Response time" value={lister.responseTime} />
          {typeof lister.rating === "number" ? (
            <Row icon={Star} label="Rating" value={`${lister.rating} / 5`} />
          ) : (
            <p className="text-xs text-muted-foreground">
              Ratings appear here once verified renter reviews exist.
            </p>
          )}
        </div>

        <p className="mt-4 rounded-lg bg-warning/12 p-3 text-xs font-medium text-warning-foreground">
          This home is listed by an agent, not the owner. Brokerage of {inr(brokerage)} is shown
          upfront and never hidden.
        </p>
      </div>
    </div>
  );
}
