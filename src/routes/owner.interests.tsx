import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  OwnerInterestList,
  selectOwnerInterestTab,
  type OwnerInterestTab,
} from "@/components/workflow/OwnerInterestList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dashboardForRole, useSession } from "@/lib/auth/session";
import {
  useAcceptInterestMutation,
  useConversationsQuery,
  useDeclineInterestMutation,
  useOwnerInterestsQuery,
} from "@/lib/workflow/query";

export const Route = createFileRoute("/owner/interests")({
  component: OwnerInterests,
});

function OwnerInterests() {
  const { actor, isReady } = useSession();
  const navigate = useNavigate({ from: "/owner/interests" });
  const interests = useOwnerInterestsQuery(actor);
  const conversations = useConversationsQuery(actor);
  const acceptInterest = useAcceptInterestMutation(actor);
  const declineInterest = useDeclineInterestMutation(actor);
  const [tab, setTab] = useState<OwnerInterestTab>("pending");

  useEffect(() => {
    if (!isReady) return;
    if (!actor) {
      void navigate({ to: "/auth", search: { redirect: "/owner/interests" } });
      return;
    }
    if (actor.role !== "owner" && actor.role !== "agent") {
      void navigate({ to: dashboardForRole(actor.role) });
    }
  }, [actor, isReady, navigate]);

  if (!isReady || !actor || (actor.role !== "owner" && actor.role !== "agent")) {
    return <PageLoading message="Loading interests…" />;
  }

  const conversationByInterest = new Map(
    (conversations.data ?? []).map((conversation) => [conversation.interestId, conversation.id]),
  );
  const selectedInterests = selectOwnerInterestTab(interests.data ?? [], tab);
  const isUpdating = acceptInterest.isPending || declineInterest.isPending;

  const accept = async (interestId: string) => {
    try {
      await acceptInterest.mutateAsync(interestId);
      toast.success("Interest accepted — secure chat is ready.");
      setTab("matched");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't accept this interest.");
    }
  };

  const decline = async (interestId: string) => {
    try {
      await declineInterest.mutateAsync(interestId);
      toast.success("Interest declined");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't decline this interest.");
    }
  };

  return (
    <div className="container-page py-10 sm:py-12">
      <h1 className="text-2xl font-extrabold">Tenant interests</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Review requests, match when it feels right, and keep the conversation in Bricxley.
      </p>
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as OwnerInterestTab)}
        className="mt-6"
      >
        <TabsList aria-label="Interest status">
          <TabsTrigger value="pending">To review</TabsTrigger>
          <TabsTrigger value="matched">Matched</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>
      {interests.isPending ? <PageLoading message="Loading interests…" /> : null}
      {interests.isError ? (
        <div className="mt-8 surface-card p-6">
          <p className="text-muted-foreground">We couldn’t load your interests.</p>
          <Button variant="outline" className="mt-4" onClick={() => void interests.refetch()}>
            Try again
          </Button>
        </div>
      ) : null}
      {!interests.isPending && !interests.isError && interests.data?.length === 0 ? (
        <div className="mt-8 surface-card p-6 text-muted-foreground">
          New tenant requests will appear here.
        </div>
      ) : null}
      {!interests.isPending && !interests.isError && selectedInterests.length ? (
        <div className="mt-6">
          <OwnerInterestList
            interests={selectedInterests}
            conversationByInterest={conversationByInterest}
            isUpdating={isUpdating}
            onAccept={(interestId) => void accept(interestId)}
            onDecline={(interestId) => void decline(interestId)}
            onOpenConversation={(conversationId) =>
              void navigate({
                to: "/owner/messages/$conversationId" as never,
                params: { conversationId } as never,
              })
            }
          />
        </div>
      ) : null}
      {!interests.isPending &&
      !interests.isError &&
      interests.data?.length &&
      !selectedInterests.length ? (
        <div className="mt-6 surface-card p-6 text-sm text-muted-foreground">
          No {tab === "pending" ? "interests to review" : `${tab} interests`} right now.
        </div>
      ) : null}
    </div>
  );
}

function PageLoading({ message }: { message: string }) {
  return <div className="mt-8 text-sm text-muted-foreground">{message}</div>;
}
