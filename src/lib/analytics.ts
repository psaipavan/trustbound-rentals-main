export type WorkflowAnalyticsEvent =
  | "property_viewed"
  | "interest_started"
  | "interest_submitted"
  | "interest_accepted"
  | "interest_declined"
  | "match_created"
  | "chat_started"
  | "visit_requested"
  | "visit_confirmed"
  | "visit_cancelled"
  | "contact_shared";

export type WorkflowAnalyticsPayloads = {
  property_viewed: { propertyId: string };
  interest_started: { propertyId: string };
  interest_submitted: { interestId: string; propertyId: string };
  interest_accepted: { interestId: string; propertyId: string };
  interest_declined: { interestId: string; propertyId: string };
  match_created: { conversationId: string; interestId: string; propertyId: string };
  chat_started: { conversationId: string; interestId: string };
  visit_requested: { interestId: string; visitId: string };
  visit_confirmed: { interestId: string; visitId: string };
  visit_cancelled: { interestId: string; visitId: string };
  contact_shared: { conversationId: string };
};

/**
 * A deliberately provider-free analytics seam. A future provider can subscribe
 * here without coupling workflow UI or services to its SDK.
 */
export function trackWorkflowEvent<Event extends WorkflowAnalyticsEvent>(
  event: Event,
  payload: WorkflowAnalyticsPayloads[Event],
) {
  if (import.meta.env.DEV) {
    console.info("[workflow]", event, payload);
  }
}
