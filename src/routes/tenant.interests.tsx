import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import {
  InterestCard,
  selectInterestTab,
  type InterestTab,
} from "@/components/workflow/InterestCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dashboardForRole, useSession } from "@/lib/auth/session";
import { useConversationsQuery, useTenantInterestsQuery } from "@/lib/workflow/query";

export const Route = createFileRoute("/tenant/interests")({
  component: TenantInterests,
});

function TenantInterests() {
  const { actor, isReady } = useSession();
  const navigate = useNavigate({ from: "/tenant/interests" });
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const interests = useTenantInterestsQuery(actor);
  const conversations = useConversationsQuery(actor);
  const [tab, setTab] = useState<InterestTab>("pending");

  useEffect(() => {
    if (!isReady) return;
    if (!actor) {
      void navigate({ to: "/auth", search: { redirect: "/tenant/interests" } });
      return;
    }
    if (actor.role !== "tenant") void navigate({ to: dashboardForRole(actor.role) });
  }, [actor, isReady, navigate]);

  if (pathname !== "/tenant/interests") return <Outlet />;

  if (!isReady || !actor || actor.role !== "tenant") {
    return (
      <div className="container-page py-12 text-sm text-muted-foreground">Loading interests…</div>
    );
  }

  const selectedInterests = selectInterestTab(interests.data ?? [], tab);
  const conversationByInterest = new Map(
    (conversations.data ?? []).map((conversation) => [conversation.interestId, conversation.id]),
  );

  return (
    <DashboardShell
      role="tenant"
      title="My Interests"
      subtitle="Track responses to the homes you’ve contacted."
    >
      <Tabs value={tab} onValueChange={(value) => setTab(value as InterestTab)}>
        <TabsList aria-label="Interest status">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="matched">Matched</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>
      {interests.isPending ? (
        <p className="mt-6 text-muted-foreground">Loading your interests…</p>
      ) : null}
      {interests.isError ? (
        <div className="mt-6 surface-card p-6">
          <p className="text-muted-foreground">We couldn’t load your interests.</p>
          <Button variant="outline" className="mt-4" onClick={() => void interests.refetch()}>
            Try again
          </Button>
        </div>
      ) : null}
      {!interests.isPending && interests.data?.length === 0 ? (
        <div className="mt-6 surface-card p-6">
          <p className="text-muted-foreground">You haven’t sent an interest yet.</p>
          <Button asChild className="mt-4">
            <Link to="/rent">Find a Home</Link>
          </Button>
        </div>
      ) : null}
      {!interests.isPending && !interests.isError && interests.data?.length ? (
        <ul className="mt-6 space-y-3">
          {selectedInterests.map((interest) => {
            const conversationId = conversationByInterest.get(interest.id);
            const cardClassName =
              "block rounded-2xl transition hover:ring-2 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

            return (
              <li key={interest.id}>
                {interest.status === "ACCEPTED" && conversationId ? (
                  <Link
                    to={"/tenant/messages/$conversationId" as never}
                    params={{ conversationId } as never}
                    className={cardClassName}
                  >
                    <InterestCard interest={interest} />
                  </Link>
                ) : (
                  <Link
                    to="/tenant/interests/$interestId"
                    params={{ interestId: interest.id }}
                    className={cardClassName}
                  >
                    <InterestCard interest={interest} />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
      {!interests.isPending &&
      !interests.isError &&
      interests.data?.length &&
      !selectedInterests.length ? (
        <div className="mt-6 surface-card p-6 text-sm text-muted-foreground">
          No {tab} interests right now.
        </div>
      ) : null}
    </DashboardShell>
  );
}
