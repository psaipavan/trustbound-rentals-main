import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { InterestCard } from "@/components/workflow/InterestCard";
import { interestStatusGroups, type Interest } from "@/lib/workflow/types";

export type OwnerInterestTab = keyof typeof interestStatusGroups;

/** Keeps the owner review queues aligned with the domain's explicit status groups. */
export function selectOwnerInterestTab(
  interests: readonly Interest[],
  tab: OwnerInterestTab,
): Interest[] {
  const statuses = interestStatusGroups[tab] as readonly Interest["status"][];
  return interests.filter((interest) => statuses.includes(interest.status));
}

type OwnerInterestListProps = {
  interests: readonly Interest[];
  conversationByInterest: ReadonlyMap<string, string>;
  isUpdating: boolean;
  onAccept: (interestId: string) => void;
  onDecline: (interestId: string) => void;
  onOpenConversation: (conversationId: string) => void;
};

export function OwnerInterestList({
  interests,
  conversationByInterest,
  isUpdating,
  onAccept,
  onDecline,
  onOpenConversation,
}: OwnerInterestListProps) {
  return (
    <ul className="space-y-3">
      {interests.map((interest) => {
        const conversationId = conversationByInterest.get(interest.id);
        const action = getInterestAction({
          interest,
          conversationId,
          isUpdating,
          onAccept,
          onDecline,
          onOpenConversation,
        });

        return (
          <li key={interest.id}>
            <InterestCard
              interest={interest}
              action={
                <div className="space-y-3">
                  <OwnerInterestDetails interest={interest} />
                  {action}
                </div>
              }
            />
          </li>
        );
      })}
    </ul>
  );
}

function OwnerInterestDetails({ interest }: { interest: Interest }) {
  const moveIn = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(interest.moveInDate),
  );

  return (
    <details className="rounded-lg border border-border bg-muted/35 px-3 py-2 text-sm">
      <summary className="cursor-pointer font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        View request details
      </summary>
      <dl className="mt-3 grid gap-2 text-muted-foreground">
        <div className="flex justify-between gap-4">
          <dt>Tenant</dt>
          <dd className="text-right font-medium text-foreground">{interest.tenantName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Move-in</dt>
          <dd className="text-right font-medium text-foreground">{moveIn}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Occupants</dt>
          <dd className="text-right font-medium text-foreground">{interest.occupants}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>About</dt>
          <dd className="text-right font-medium text-foreground">{interest.occupationType}</dd>
        </div>
        {interest.message ? (
          <div className="border-t border-border pt-2">
            <dt>Message</dt>
            <dd className="mt-1 whitespace-pre-line text-foreground">{interest.message}</dd>
          </div>
        ) : null}
      </dl>
    </details>
  );
}

function getInterestAction({
  interest,
  conversationId,
  isUpdating,
  onAccept,
  onDecline,
  onOpenConversation,
}: {
  interest: Interest;
  conversationId: string | undefined;
  isUpdating: boolean;
  onAccept: (interestId: string) => void;
  onDecline: (interestId: string) => void;
  onOpenConversation: (conversationId: string) => void;
}): ReactNode {
  if (interest.status === "SUBMITTED") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={isUpdating}
          onClick={() => onAccept(interest.id)}
          aria-label={`Accept ${interest.tenantName}'s interest`}
        >
          Accept & match
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isUpdating}
          onClick={() => onDecline(interest.id)}
          aria-label={`Decline ${interest.tenantName}'s interest`}
        >
          Decline
        </Button>
      </div>
    );
  }

  if (interest.status === "ACCEPTED" && conversationId) {
    return (
      <Button size="sm" variant="outline" onClick={() => onOpenConversation(conversationId)}>
        Open secure chat
      </Button>
    );
  }

  return null;
}
