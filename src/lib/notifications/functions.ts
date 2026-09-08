import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { brandedEmail, getEmailProvider } from "@/lib/email/provider.server";
import { getSupabaseAdminClient, requireServerUser } from "@/lib/supabase/server";

const eventSchema = z.object({
  event: z.enum([
    "WELCOME",
    "INTEREST_RECEIVED",
    "INTEREST_ACCEPTED",
    "NEW_MESSAGE",
    "VISIT_REQUESTED",
    "VISIT_CONFIRMED",
    "VISIT_CANCELLED",
  ]),
  entityId: z.string().uuid().optional(),
});

type EmailEvent = z.infer<typeof eventSchema>["event"];

function contentFor(event: EmailEvent) {
  const messages: Record<EmailEvent, { subject: string; title: string; body: string }> = {
    WELCOME: {
      subject: "Welcome to Bricxley",
      title: "Welcome to Bricxley",
      body: "Your account is ready. Browse homes with confidence and keep your details private until you choose to share them.",
    },
    INTEREST_RECEIVED: {
      subject: "New interest in your Bricxley property",
      title: "New interest received",
      body: "A tenant is interested in your property. Review the interest in your Bricxley dashboard.",
    },
    INTEREST_ACCEPTED: {
      subject: "Your Bricxley interest was accepted",
      title: "Good news — your interest was accepted",
      body: "You can now continue the conversation securely on Bricxley and schedule a visit.",
    },
    NEW_MESSAGE: {
      subject: "You have a new Bricxley message",
      title: "New secure message",
      body: "Open Bricxley to read and reply. Your phone number remains private unless you choose to share it.",
    },
    VISIT_REQUESTED: {
      subject: "A Bricxley visit needs your confirmation",
      title: "Visit requested",
      body: "A visit has been requested. Open Bricxley to review and confirm the proposed time.",
    },
    VISIT_CONFIRMED: {
      subject: "Your Bricxley visit is confirmed",
      title: "Visit confirmed",
      body: "Your visit is confirmed. Open Bricxley for the property and scheduling details.",
    },
    VISIT_CANCELLED: {
      subject: "Your Bricxley visit was cancelled",
      title: "Visit cancelled",
      body: "A visit was cancelled. Open Bricxley to arrange another time if needed.",
    },
  };
  return messages[event];
}

async function recipientForEvent(actorId: string, event: EmailEvent, entityId?: string) {
  const admin = getSupabaseAdminClient();
  if (event === "WELCOME") return actorId;
  if (!entityId) throw new Error("Notification details are missing.");

  if (event === "INTEREST_RECEIVED" || event === "INTEREST_ACCEPTED") {
    const { data, error } = await admin
      .from("interests")
      .select("tenant_id,lister_id")
      .eq("id", entityId)
      .single();
    if (error || !data || (actorId !== data.tenant_id && actorId !== data.lister_id)) {
      throw new Error("You cannot notify this account.");
    }
    return event === "INTEREST_RECEIVED" ? data.lister_id : data.tenant_id;
  }

  if (event === "NEW_MESSAGE") {
    const { data, error } = await admin
      .from("conversations")
      .select("tenant_id,lister_id")
      .eq("id", entityId)
      .single();
    if (error || !data || (actorId !== data.tenant_id && actorId !== data.lister_id)) {
      throw new Error("You cannot notify this account.");
    }
    return actorId === data.tenant_id ? data.lister_id : data.tenant_id;
  }

  const { data, error } = await admin
    .from("visits")
    .select("tenant_id,lister_id")
    .eq("id", entityId)
    .single();
  if (error || !data || (actorId !== data.tenant_id && actorId !== data.lister_id)) {
    throw new Error("You cannot notify this account.");
  }
  return actorId === data.tenant_id ? data.lister_id : data.tenant_id;
}

/**
 * Best-effort email delivery. Database notifications are created by the
 * transactional RPCs first, so a Resend outage never loses workflow state.
 */
export const dispatchTransactionalEmail = createServerFn({ method: "POST" })
  .validator(eventSchema)
  .handler(async ({ data }) => {
    const { user } = await requireServerUser();
    const recipientId = await recipientForEvent(user.id, data.event, data.entityId);
    const admin = getSupabaseAdminClient();
    const { data: recipient } = await admin
      .from("profiles")
      .select("email")
      .eq("id", recipientId)
      .maybeSingle();
    if (!recipient?.email) return { delivered: false, reason: "No verified email address" };

    const content = contentFor(data.event);
    await getEmailProvider().send({
      to: recipient.email,
      subject: content.subject,
      text: content.body,
      html: brandedEmail(content.title, content.body),
    });
    return { delivered: true };
  });
