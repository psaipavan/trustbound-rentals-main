import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  ContactConsent,
  Conversation,
  ConversationMessage,
  CreateVisitInput,
  Interest,
  InterestInput,
  InterestStatus,
  Visit,
  VisitStatus,
  WorkflowActor,
} from "./types";
import { WorkflowError } from "./types";

type Row = Record<string, unknown>;

function stringValue(row: Row, key: string) {
  const value = row[key];
  return typeof value === "string" ? value : "";
}

function numberValue(row: Row, key: string) {
  const value = row[key];
  return typeof value === "number" ? value : Number(value ?? 0);
}

function mapInterest(row: Row): Interest {
  return {
    id: stringValue(row, "id"),
    propertyId: stringValue(row, "property_id"),
    tenantId: stringValue(row, "tenant_id"),
    tenantName: stringValue(row, "tenant_name") || "Bricxley tenant",
    listerId: stringValue(row, "lister_id"),
    moveInDate: stringValue(row, "move_in_date"),
    occupants: numberValue(row, "occupants"),
    occupationType: stringValue(row, "occupation_type") as Interest["occupationType"],
    ...(stringValue(row, "lease_preference")
      ? { leasePreference: stringValue(row, "lease_preference") }
      : {}),
    ...(stringValue(row, "message") ? { message: stringValue(row, "message") } : {}),
    status: stringValue(row, "status") as InterestStatus,
    createdAt: stringValue(row, "created_at"),
    updatedAt: stringValue(row, "updated_at"),
  };
}

function mapMessage(row: Row): ConversationMessage {
  return {
    id: stringValue(row, "id"),
    conversationId: stringValue(row, "conversation_id"),
    senderId: typeof row["sender_id"] === "string" ? row["sender_id"] : null,
    kind: stringValue(row, "kind") as ConversationMessage["kind"],
    body: stringValue(row, "body"),
    createdAt: stringValue(row, "created_at"),
  };
}

function mapVisit(row: Row): Visit {
  return {
    id: stringValue(row, "id"),
    propertyId: stringValue(row, "property_id"),
    interestId: stringValue(row, "interest_id"),
    tenantId: stringValue(row, "tenant_id"),
    listerId: stringValue(row, "lister_id"),
    scheduledAt: stringValue(row, "scheduled_at"),
    status: stringValue(row, "status") as VisitStatus,
    createdAt: stringValue(row, "created_at"),
    updatedAt: stringValue(row, "updated_at"),
  };
}

function errorFor(error: { message?: string } | null, fallback: string): WorkflowError {
  const message = error?.message || fallback;
  if (/active interest/i.test(message)) return new WorkflowError("DUPLICATE_INTEREST", message);
  if (/unauthenticated|sign in/i.test(message))
    return new WorkflowError("UNAUTHENTICATED", message);
  if (/cannot|only tenants|not enabled/i.test(message))
    return new WorkflowError("UNAUTHORIZED", message);
  if (/unavailable/i.test(message)) return new WorkflowError("UNAVAILABLE", message);
  if (/not found/i.test(message)) return new WorkflowError("NOT_FOUND", message);
  return new WorkflowError("INVALID_TRANSITION", message);
}

async function requireResult<T>(
  promise: PromiseLike<{ data: T | null; error: { message?: string } | null }>,
  fallback: string,
) {
  const { data, error } = await promise;
  if (error || data === null) throw errorFor(error, fallback);
  return data;
}

/**
 * Browser data access is intentionally constrained by Supabase RLS. The
 * database RPCs own state transitions, duplicate prevention and match creation.
 */
export class SupabaseWorkflowService {
  async createInterest(_actor: WorkflowActor, input: InterestInput) {
    const supabase = getSupabaseBrowserClient();
    const data = await requireResult(
      supabase.rpc("create_interest", {
        p_property_id: input.propertyId,
        p_move_in_date: input.moveInDate,
        p_occupants: input.occupants,
        p_occupation_type: input.occupationType,
        p_lease_preference: input.leasePreference ?? null,
        p_message: input.message ?? null,
      }),
      "We couldn't submit your interest.",
    );
    return mapInterest(data as unknown as Row);
  }

  async getInterest(_actor: WorkflowActor, interestId: string) {
    const supabase = getSupabaseBrowserClient();
    const data = await requireResult(
      supabase.from("interests").select("*").eq("id", interestId).single(),
      "We couldn't find this interest.",
    );
    return mapInterest(data as unknown as Row);
  }

  async listTenantInterests(actor: WorkflowActor) {
    const supabase = getSupabaseBrowserClient();
    const data = await requireResult(
      supabase
        .from("interests")
        .select("*")
        .eq("tenant_id", actor.id)
        .order("updated_at", { ascending: false }),
      "We couldn't load your interests.",
    );
    return (data as unknown as Row[]).map(mapInterest);
  }

  async listOwnerInterests(actor: WorkflowActor) {
    const supabase = getSupabaseBrowserClient();
    const data = await requireResult(
      supabase
        .from("interests")
        .select("*")
        .eq("lister_id", actor.id)
        .order("updated_at", { ascending: false }),
      "We couldn't load property interests.",
    );
    return (data as unknown as Row[]).map(mapInterest);
  }

  async acceptInterest(_actor: WorkflowActor, interestId: string) {
    const data = await requireResult(
      getSupabaseBrowserClient().rpc("accept_interest", { p_interest_id: interestId }),
      "We couldn't accept this interest.",
    );
    return mapInterest(data as unknown as Row);
  }

  async declineInterest(_actor: WorkflowActor, interestId: string) {
    const data = await requireResult(
      getSupabaseBrowserClient().rpc("decline_interest", { p_interest_id: interestId }),
      "We couldn't decline this interest.",
    );
    return mapInterest(data as unknown as Row);
  }

  async withdrawInterest(_actor: WorkflowActor, interestId: string) {
    const data = await requireResult(
      getSupabaseBrowserClient().rpc("withdraw_interest", { p_interest_id: interestId }),
      "We couldn't withdraw this interest.",
    );
    return mapInterest(data as unknown as Row);
  }

  async getConversation(_actor: WorkflowActor, conversationId: string): Promise<Conversation> {
    const supabase = getSupabaseBrowserClient();
    const conversation = await requireResult(
      supabase.from("conversations").select("*").eq("id", conversationId).single(),
      "We couldn't find this conversation.",
    );
    const messages = await requireResult(
      supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
      "We couldn't load messages.",
    );
    const row = conversation as unknown as Row;
    return {
      id: stringValue(row, "id"),
      propertyId: stringValue(row, "property_id"),
      interestId: stringValue(row, "interest_id"),
      tenantId: stringValue(row, "tenant_id"),
      listerId: stringValue(row, "lister_id"),
      createdAt: stringValue(row, "created_at"),
      updatedAt: stringValue(row, "updated_at"),
      messages: (messages as unknown as Row[]).map(mapMessage),
    };
  }

  async getConversationForInterest(actor: WorkflowActor, interestId: string) {
    const supabase = getSupabaseBrowserClient();
    const row = await requireResult(
      supabase.from("conversations").select("id").eq("interest_id", interestId).single(),
      "A conversation is available after a match.",
    );
    return this.getConversation(actor, stringValue(row as unknown as Row, "id"));
  }

  async listConversations(actor: WorkflowActor) {
    const supabase = getSupabaseBrowserClient();
    const rows = await requireResult(
      supabase
        .from("conversations")
        .select("id")
        .or(`tenant_id.eq.${actor.id},lister_id.eq.${actor.id}`)
        .order("updated_at", { ascending: false }),
      "We couldn't load conversations.",
    );
    return Promise.all(
      (rows as unknown as Row[]).map((row) => this.getConversation(actor, stringValue(row, "id"))),
    );
  }

  async sendMessage(actor: WorkflowActor, conversationId: string, body: string) {
    const trimmed = body.trim();
    if (!trimmed) throw new WorkflowError("INVALID_TRANSITION", "Write a message before sending.");
    const data = await requireResult(
      getSupabaseBrowserClient()
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: actor.id,
          kind: "message",
          body: trimmed,
        })
        .select("*")
        .single(),
      "We couldn't send your message.",
    );
    return mapMessage(data as unknown as Row);
  }

  async shareContact(actor: WorkflowActor, conversationId: string): Promise<ContactConsent> {
    const data = await requireResult(
      getSupabaseBrowserClient()
        .from("contact_consents")
        .upsert(
          { conversation_id: conversationId, user_id: actor.id },
          { onConflict: "conversation_id,user_id" },
        )
        .select("*")
        .single(),
      "We couldn't record your contact-sharing consent.",
    );
    const row = data as unknown as Row;
    return {
      id: stringValue(row, "id"),
      conversationId: stringValue(row, "conversation_id"),
      userId: stringValue(row, "user_id"),
      sharedAt: stringValue(row, "shared_at"),
    };
  }

  async listVisits(actor: WorkflowActor) {
    const data = await requireResult(
      getSupabaseBrowserClient()
        .from("visits")
        .select("*")
        .or(`tenant_id.eq.${actor.id},lister_id.eq.${actor.id}`)
        .order("scheduled_at", { ascending: true }),
      "We couldn't load visits.",
    );
    return (data as unknown as Row[]).map(mapVisit);
  }

  async createVisit(_actor: WorkflowActor, input: CreateVisitInput) {
    const data = await requireResult(
      getSupabaseBrowserClient().rpc("request_visit", {
        p_interest_id: input.interestId,
        p_scheduled_at: input.scheduledAt,
      }),
      "We couldn't schedule this visit.",
    );
    return mapVisit(data as unknown as Row);
  }

  async confirmVisit(_actor: WorkflowActor, visitId: string) {
    const data = await requireResult(
      getSupabaseBrowserClient().rpc("confirm_visit", { p_visit_id: visitId }),
      "We couldn't confirm this visit.",
    );
    return mapVisit(data as unknown as Row);
  }

  async cancelVisit(_actor: WorkflowActor, visitId: string) {
    const data = await requireResult(
      getSupabaseBrowserClient().rpc("cancel_visit", { p_visit_id: visitId }),
      "We couldn't cancel this visit.",
    );
    return mapVisit(data as unknown as Row);
  }
}
