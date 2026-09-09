import { useEffect } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { MessageCircleMore } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/button";
import { getProperty } from "@/data/properties";
import { dashboardForRole, useSession } from "@/lib/auth/session";
import { useConversationsQuery } from "@/lib/workflow/query";
import type { WorkflowRole } from "@/lib/workflow/types";

type InboxRole = Extract<WorkflowRole, "tenant" | "owner">;

export function WorkflowInbox({ role }: { role: InboxRole }) {
  const { actor, isReady } = useSession();
  const navigate = useNavigate();
  const conversations = useConversationsQuery(actor);
  const inboxPath = `/${role}/messages`;
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    if (!isReady) return;
    if (!actor) {
      void navigate({ to: "/auth", search: { redirect: inboxPath } });
      return;
    }
    if (actor.role !== role && !(role === "owner" && actor.role === "agent")) {
      void navigate({ to: dashboardForRole(actor.role) });
    }
  }, [actor, inboxPath, isReady, navigate, role]);

  if (pathname !== inboxPath) return <Outlet />;

  if (
    !isReady ||
    !actor ||
    (actor.role !== role && !(role === "owner" && actor.role === "agent"))
  ) {
    return (
      <div className="container-page py-12 text-sm text-muted-foreground">Loading messages…</div>
    );
  }
  if (conversations.isPending) {
    return (
      <div className="container-page py-12 text-sm text-muted-foreground">Loading messages…</div>
    );
  }
  if (conversations.isError) {
    return (
      <div className="container-page py-12">
        <p className="text-muted-foreground">We couldn’t load your messages.</p>
        <Button variant="outline" className="mt-4" onClick={() => void conversations.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const items = conversations.data ?? [];
  const dashboardRole =
    actor.role === "tenant" ? "tenant" : actor.role === "agent" ? "agent" : "owner";
  return (
    <DashboardShell
      role={dashboardRole}
      title="Messages"
      subtitle="Keep every matched conversation private and in one place."
    >
      {!items.length ? (
        <div className="surface-card p-6 text-center">
          <MessageCircleMore className="mx-auto h-8 w-8 text-primary" aria-hidden />
          <h2 className="mt-3 font-bold">No secure chats yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A chat opens once a tenant interest is accepted.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((conversation) => {
            const property = getProperty(conversation.propertyId);
            const latest = conversation.messages.at(-1);
            return (
              <li key={conversation.id}>
                <Link
                  to={`/${role}/messages/$conversationId` as never}
                  params={{ conversationId: conversation.id } as never}
                  className="surface-card hover-lift block p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <MessageCircleMore
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <h2 className="truncate font-bold">
                        {property?.title ?? "Property conversation"}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {role === "tenant" ? "Listing manager" : "Tenant"}
                      </p>
                      <p className="mt-2 truncate text-sm text-muted-foreground">
                        {latest?.body ?? "Your secure match is ready to chat."}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardShell>
  );
}
