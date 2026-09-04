import type { ReactNode } from "react";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProperty } from "@/data/properties";
import { inr } from "@/lib/format";
import { interestStatusGroups, type Interest, type InterestStatus } from "@/lib/workflow/types";

export type InterestTab = keyof typeof interestStatusGroups;

const statusLabels: Record<InterestStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Pending",
  ACCEPTED: "Matched",
  DECLINED: "Declined",
  WITHDRAWN: "Withdrawn",
  EXPIRED: "Expired",
};

const statusStyles: Record<InterestStatus, string> = {
  DRAFT: "border-border bg-muted text-muted-foreground",
  SUBMITTED: "border-warning/30 bg-warning/15 text-warning-foreground",
  ACCEPTED: "border-verified/30 bg-verified/10 text-verified",
  DECLINED: "border-destructive/20 bg-destructive/10 text-destructive",
  WITHDRAWN: "border-border bg-muted text-muted-foreground",
  EXPIRED: "border-border bg-muted text-muted-foreground",
};

/** Keeps the three tenant tabs aligned with the domain's explicit status groups. */
export function selectInterestTab(interests: readonly Interest[], tab: InterestTab): Interest[] {
  const statuses = interestStatusGroups[tab] as readonly InterestStatus[];
  return interests.filter((interest) => statuses.includes(interest.status));
}

export function InterestCard({ interest, action }: { interest: Interest; action?: ReactNode }) {
  const property = getProperty(interest.propertyId);
  const submittedAt = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(interest.createdAt));

  return (
    <article className="surface-card flex gap-4 p-4 sm:p-5">
      {property ? (
        <img
          src={property.images[0]}
          alt=""
          width={112}
          height={88}
          loading="lazy"
          className="h-[88px] w-28 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="h-[88px] w-28 shrink-0 rounded-xl bg-muted" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate font-bold">{property?.title ?? "Property unavailable"}</h2>
            {property ? (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{property.locality}</span>
              </p>
            ) : null}
          </div>
          <Badge variant="outline" className={statusStyles[interest.status]}>
            {statusLabels[interest.status]}
          </Badge>
        </div>
        {property ? <p className="mt-2 text-sm font-semibold">{inr(property.rent)} / month</p> : null}
        <p className="mt-1 text-xs text-muted-foreground">Submitted {submittedAt}</p>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </article>
  );
}
