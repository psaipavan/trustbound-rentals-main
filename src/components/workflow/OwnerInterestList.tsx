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
            <InterestCard interest={interest} action={action} />
          </li>
        );
      })}
    </ul>
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
