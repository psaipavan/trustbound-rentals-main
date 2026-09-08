import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Lock, Send, UserRound } from "lucide-react";
import { toast } from "sonner";
import { VisitScheduler } from "@/components/property/VisitScheduler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProperty, presetChatQuestions } from "@/data/properties";
import { dashboardForRole, useSession } from "@/lib/auth/session";
import {
  useConversationQuery,
  useCreateVisitMutation,
  useSendMessageMutation,
  useShareContactMutation,
  useVisitsQuery,
} from "@/lib/workflow/query";
import type { WorkflowRole } from "@/lib/workflow/types";

type ConversationRole = Extract<WorkflowRole, "tenant" | "owner">;

export function WorkflowConversation({
  role,
  conversationId,
}: {
  role: ConversationRole;
  conversationId: string;
}) {
  const { actor, isReady } = useSession();
  const navigate = useNavigate();
  const conversation = useConversationQuery(actor, conversationId);
  const visits = useVisitsQuery(actor);
  const sendMessage = useSendMessageMutation(actor);
  const shareContact = useShareContactMutation(actor);
  const createVisit = useCreateVisitMutation(actor);
  const [message, setMessage] = useState("");
  const inboxPath = `/${role}/messages`;

  useEffect(() => {
    if (!isReady) return;
    if (!actor) {
      void navigate({ to: "/auth", search: { redirect: `${inboxPath}/${conversationId}` } });
      return;
    }
    if (actor.role !== role && !(role === "owner" && actor.role === "agent")) {
      void navigate({ to: dashboardForRole(actor.role) });
    }
  }, [actor, conversationId, inboxPath, isReady, navigate, role]);

  if (
    !isReady ||
    !actor ||
    (actor.role !== role && !(role === "owner" && actor.role === "agent")) ||
    conversation.isPending
  ) {
    return (
      <div className="container-page py-12 text-sm text-muted-foreground">
        Loading conversation…
      </div>
    );
  }
  if (conversation.isError || !conversation.data) {
    return (
      <div className="container-page py-12">
        <h1 className="text-xl font-bold">Conversation unavailable</h1>
        <Button asChild className="mt-4">
          <Link to={inboxPath as never}>Back to messages</Link>
        </Button>
      </div>
    );
  }

  const item = conversation.data;
  const property = getProperty(item.propertyId);
  const latestVisit = (visits.data ?? [])
    .filter((visit) => visit.interestId === item.interestId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  const submitMessage = async (body: string) => {
    if (!body.trim()) return;
    try {
      await sendMessage.mutateAsync({ conversationId: item.id, body });
      setMessage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't send that message.");
    }
  };

  const requestVisit = async (scheduledAt: string) => {
    await createVisit.mutateAsync({ interestId: item.interestId, scheduledAt });
  };

  const recordContactConsent = async () => {
    try {
      await shareContact.mutateAsync(item.id);
      toast.success("Your contact-sharing consent was recorded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't record your consent.");
    }
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <Link to={inboxPath as never} className="text-sm font-medium text-primary hover:underline">
        ← Back to messages
      </Link>
      <div className="mt-4 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="surface-card overflow-hidden">
          <header className="border-b border-border p-4 sm:p-5">
            <h1 className="font-extrabold">{property?.title ?? "Property conversation"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {role === "tenant" ? "Listing manager" : "Tenant"} · matched through Bricxley
            </p>
          </header>
          <div
            className="max-h-[52vh] min-h-72 space-y-3 overflow-y-auto bg-muted/35 p-4 sm:p-5"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {item.messages.map((entry) => {
              const isSystem = entry.kind === "system";
              const isSender = entry.senderId === actor.id;
              return isSystem ? (
                <p
                  key={entry.id}
                  className="mx-auto max-w-md whitespace-pre-line rounded-xl bg-background px-3 py-2 text-center text-xs text-muted-foreground motion-safe:animate-message-in"
                >
                  {entry.body}
                </p>
              ) : (
                <div
                  key={entry.id}
                  className={`${
                    isSender
                      ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-background"
                  } max-w-[88%] rounded-2xl px-3.5 py-2 text-sm shadow-sm motion-safe:animate-message-in`}
                >
                  {entry.body}
                </div>
              );
            })}
          </div>
          <div className="border-t border-border p-4 sm:p-5">
            <div className="flex flex-wrap gap-2">
              {presetChatQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  className="rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => void submitMessage(question)}
                  disabled={sendMessage.isPending}
                >
                  {question}
                </button>
              ))}
            </div>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void submitMessage(message);
              }}
            >
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write a message…"
                disabled={sendMessage.isPending}
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Send message"
                disabled={sendMessage.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="surface-card p-5">
            <h2 className="font-bold">Plan a visit</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Propose a time. The listing manager confirms it before the visit.
            </p>
            {latestVisit ? (
              <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm font-medium">
                Visit {latestVisit.status.toLowerCase()}
              </p>
            ) : null}
            <div className="mt-4">
              <VisitScheduler
                propertyTitle={property?.title ?? "This home"}
                onRequest={requestVisit}
                isRequesting={createVisit.isPending}
              />
            </div>
          </div>
          <div className="surface-card p-5">
            <div className="flex items-center gap-2 font-bold">
              <Lock className="h-4 w-4 text-primary" aria-hidden /> Privacy first
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Phone numbers stay private. Share your contact only when you choose to.
            </p>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => void recordContactConsent()}
              disabled={shareContact.isPending}
            >
              <UserRound className="h-4 w-4" />
              {shareContact.isPending ? "Saving…" : "Share my contact consent"}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
