import { getProperty, type Property } from "@/data/properties";
import type {
  ContactConsent,
  Conversation,
  ConversationMessage,
  CreateVisitInput,
  Interest,
  InterestInput,
  WorkflowActor,
  WorkflowRepository,
  WorkflowSnapshot,
  Visit,
} from "./types";
import { WorkflowError } from "./types";

type WorkflowDependencies = {
  getProperty: (propertyId: string) => Property | undefined;
  now: () => Date;
  createId: (prefix: string) => string;
};

const activeInterestStatuses = new Set(["DRAFT", "SUBMITTED", "ACCEPTED"]);

const defaultDependencies: WorkflowDependencies = {
  getProperty,
  now: () => new Date(),
  createId: (prefix) => `${prefix}-${crypto.randomUUID()}`,
};

function isoNow(now: () => Date) {
  return now().toISOString();
}

function requireTenant(actor: WorkflowActor) {
  if (actor.role !== "tenant") {
    throw new WorkflowError("UNAUTHORIZED", "Only tenants can perform this action.");
  }
}

function requireLister(actor: WorkflowActor) {
  if (actor.role !== "owner" && actor.role !== "agent") {
    throw new WorkflowError("UNAUTHORIZED", "Only listing managers can perform this action.");
  }
}

function getInterestFrom(snapshot: WorkflowSnapshot, interestId: string) {
  const interest = snapshot.interests.find((item) => item.id === interestId);
  if (!interest) throw new WorkflowError("NOT_FOUND", "We couldn't find this interest.");
  return interest;
}

function mayReadInterest(actor: WorkflowActor, interest: Interest) {
  return actor.id === interest.tenantId || actor.id === interest.listerId;
}

function requireInterestAccess(actor: WorkflowActor, interest: Interest) {
  if (!mayReadInterest(actor, interest)) {
    throw new WorkflowError("UNAUTHORIZED", "You cannot access this interest.");
  }
}

function conversationForInterest(snapshot: WorkflowSnapshot, interestId: string) {
  return snapshot.conversations.find((item) => item.interestId === interestId);
}

function getConversationFrom(snapshot: WorkflowSnapshot, conversationId: string) {
  const conversation = snapshot.conversations.find((item) => item.id === conversationId);
  if (!conversation) throw new WorkflowError("NOT_FOUND", "We couldn't find this conversation.");
  return conversation;
}

function requireConversationAccess(actor: WorkflowActor, conversation: Conversation) {
  if (actor.id !== conversation.tenantId && actor.id !== conversation.listerId) {
    throw new WorkflowError("UNAUTHORIZED", "You cannot access this conversation.");
  }
}

export class WorkflowService {
  constructor(
    private readonly repository: WorkflowRepository,
    private readonly dependencies: WorkflowDependencies = defaultDependencies,
  ) {}

  async createInterest(actor: WorkflowActor, input: InterestInput): Promise<Interest> {
    requireTenant(actor);
    return this.repository.transact((snapshot) => {
      const property = this.dependencies.getProperty(input.propertyId);
      if (!property) throw new WorkflowError("NOT_FOUND", "This home could not be found.");
      if (property.status !== "available") {
        throw new WorkflowError("UNAVAILABLE", "This home is currently unavailable.");
      }
      const duplicate = snapshot.interests.find(
        (interest) =>
          interest.tenantId === actor.id &&
          interest.propertyId === input.propertyId &&
          activeInterestStatuses.has(interest.status),
      );
      if (duplicate) {
        throw new WorkflowError("DUPLICATE_INTEREST", "You already have an active interest in this home.");
      }

      const createdAt = isoNow(this.dependencies.now);
      const interest: Interest = {
        ...input,
        id: this.dependencies.createId("interest"),
        tenantId: actor.id,
        tenantName: actor.displayName,
        listerId: property.lister.id,
        status: "SUBMITTED",
        createdAt,
        updatedAt: createdAt,
      };
      snapshot.interests.push(interest);
      return interest;
    });
  }

  async getInterest(actor: WorkflowActor, interestId: string): Promise<Interest> {
    const interest = getInterestFrom(await this.repository.load(), interestId);
    requireInterestAccess(actor, interest);
    return interest;
  }

  async listTenantInterests(actor: WorkflowActor): Promise<Interest[]> {
    requireTenant(actor);
    return (await this.repository.load()).interests.filter((interest) => interest.tenantId === actor.id);
  }

  async listOwnerInterests(actor: WorkflowActor): Promise<Interest[]> {
    requireLister(actor);
    return (await this.repository.load()).interests.filter((interest) => interest.listerId === actor.id);
  }

  async acceptInterest(actor: WorkflowActor, interestId: string): Promise<Interest> {
    requireLister(actor);
    return this.repository.transact((snapshot) => {
      const interest = getInterestFrom(snapshot, interestId);
      if (interest.listerId !== actor.id) {
        throw new WorkflowError("UNAUTHORIZED", "You cannot manage this interest.");
      }
      const property = this.dependencies.getProperty(interest.propertyId);
      if (!property || property.status !== "available") {
        throw new WorkflowError("UNAVAILABLE", "This home is currently unavailable.");
      }
      if (interest.status !== "SUBMITTED") {
        throw new WorkflowError("INVALID_TRANSITION", "Only a submitted interest can be accepted.");
      }

      interest.status = "ACCEPTED";
      interest.updatedAt = isoNow(this.dependencies.now);
      if (!conversationForInterest(snapshot, interest.id)) {
        const createdAt = isoNow(this.dependencies.now);
        const conversation: Conversation = {
          id: this.dependencies.createId("conversation"),
          interestId: interest.id,
          propertyId: interest.propertyId,
          tenantId: interest.tenantId,
          listerId: interest.listerId,
          createdAt,
          updatedAt: createdAt,
          messages: [],
        };
        conversation.messages.push({
          id: this.dependencies.createId("message"),
          conversationId: conversation.id,
          senderId: null,
          kind: "system",
          body: "Match created ✓ You can now chat and schedule a visit.",
          createdAt,
        });
        snapshot.conversations.push(conversation);
      }
      return interest;
    });
  }

  async declineInterest(actor: WorkflowActor, interestId: string): Promise<Interest> {
    requireLister(actor);
    return this.repository.transact((snapshot) => {
      const interest = getInterestFrom(snapshot, interestId);
      if (interest.listerId !== actor.id) {
        throw new WorkflowError("UNAUTHORIZED", "You cannot manage this interest.");
      }
      if (interest.status !== "SUBMITTED") {
        throw new WorkflowError("INVALID_TRANSITION", "Only a submitted interest can be declined.");
      }
      interest.status = "DECLINED";
      interest.updatedAt = isoNow(this.dependencies.now);
      return interest;
    });
  }

  async withdrawInterest(actor: WorkflowActor, interestId: string): Promise<Interest> {
    requireTenant(actor);
    return this.repository.transact((snapshot) => {
      const interest = getInterestFrom(snapshot, interestId);
      if (interest.tenantId !== actor.id) {
        throw new WorkflowError("UNAUTHORIZED", "You cannot withdraw this interest.");
      }
      if (interest.status !== "SUBMITTED") {
        throw new WorkflowError("INVALID_TRANSITION", "Only a pending interest can be withdrawn.");
      }
      interest.status = "WITHDRAWN";
      interest.updatedAt = isoNow(this.dependencies.now);
      return interest;
    });
  }

  async getConversation(actor: WorkflowActor, conversationId: string): Promise<Conversation> {
    const snapshot = await this.repository.load();
    const conversation = getConversationFrom(snapshot, conversationId);
    requireConversationAccess(actor, conversation);
    return conversation;
  }

  async getConversationForInterest(actor: WorkflowActor, interestId: string): Promise<Conversation> {
    const snapshot = await this.repository.load();
    const interest = getInterestFrom(snapshot, interestId);
    requireInterestAccess(actor, interest);
    if (interest.status !== "ACCEPTED") {
      throw new WorkflowError("INVALID_TRANSITION", "A conversation is available after a match.");
    }
    const conversation = conversationForInterest(snapshot, interest.id);
    if (!conversation) throw new WorkflowError("NOT_FOUND", "We couldn't find this conversation.");
    return conversation;
  }

  async listConversations(actor: WorkflowActor): Promise<Conversation[]> {
    return (await this.repository.load()).conversations.filter(
      (conversation) => conversation.tenantId === actor.id || conversation.listerId === actor.id,
    );
  }

  async sendMessage(actor: WorkflowActor, conversationId: string, body: string): Promise<ConversationMessage> {
    const trimmed = body.trim();
    if (!trimmed) throw new WorkflowError("INVALID_TRANSITION", "Write a message before sending.");
    return this.repository.transact((snapshot) => {
      const conversation = getConversationFrom(snapshot, conversationId);
      requireConversationAccess(actor, conversation);
      const message: ConversationMessage = {
        id: this.dependencies.createId("message"),
        conversationId,
        senderId: actor.id,
        kind: "message",
        body: trimmed,
        createdAt: isoNow(this.dependencies.now),
      };
      conversation.messages.push(message);
      conversation.updatedAt = message.createdAt;
      return message;
    });
  }

  async shareContact(actor: WorkflowActor, conversationId: string): Promise<ContactConsent> {
    return this.repository.transact((snapshot) => {
      const conversation = getConversationFrom(snapshot, conversationId);
      requireConversationAccess(actor, conversation);
      const existing = snapshot.contactConsents.find(
        (consent) => consent.conversationId === conversationId && consent.userId === actor.id,
      );
      if (existing) return existing;
      const consent: ContactConsent = {
        id: this.dependencies.createId("consent"),
        conversationId,
        userId: actor.id,
        sharedAt: isoNow(this.dependencies.now),
      };
      snapshot.contactConsents.push(consent);
      return consent;
    });
  }

  async listVisits(actor: WorkflowActor): Promise<Visit[]> {
    return (await this.repository.load()).visits.filter(
      (visit) => visit.tenantId === actor.id || visit.listerId === actor.id,
    );
  }

  async createVisit(actor: WorkflowActor, input: CreateVisitInput): Promise<Visit> {
    return this.repository.transact((snapshot) => {
      const interest = getInterestFrom(snapshot, input.interestId);
      requireInterestAccess(actor, interest);
      if (interest.status !== "ACCEPTED") {
        throw new WorkflowError("INVALID_TRANSITION", "A visit can be scheduled after a match.");
      }
      if (!conversationForInterest(snapshot, interest.id)) {
        throw new WorkflowError("NOT_FOUND", "We couldn't find this conversation.");
      }
      const createdAt = isoNow(this.dependencies.now);
      const visit: Visit = {
        id: this.dependencies.createId("visit"),
        propertyId: interest.propertyId,
        interestId: interest.id,
        tenantId: interest.tenantId,
        listerId: interest.listerId,
        scheduledAt: input.scheduledAt,
        status: "REQUESTED",
        createdAt,
        updatedAt: createdAt,
      };
      snapshot.visits.push(visit);
      return visit;
    });
  }

  async confirmVisit(actor: WorkflowActor, visitId: string): Promise<Visit> {
    return this.repository.transact((snapshot) => {
      const visit = snapshot.visits.find((item) => item.id === visitId);
      if (!visit) throw new WorkflowError("NOT_FOUND", "We couldn't find this visit.");
      if (actor.id !== visit.tenantId && actor.id !== visit.listerId) {
        throw new WorkflowError("UNAUTHORIZED", "You cannot manage this visit.");
      }
      if (visit.status !== "REQUESTED") {
        throw new WorkflowError("INVALID_TRANSITION", "Only a requested visit can be confirmed.");
      }
      visit.status = "CONFIRMED";
      visit.updatedAt = isoNow(this.dependencies.now);
      const conversation = conversationForInterest(snapshot, visit.interestId);
      if (!conversation) throw new WorkflowError("NOT_FOUND", "We couldn't find this conversation.");
      conversation.messages.push({
        id: this.dependencies.createId("message"),
        conversationId: conversation.id,
        senderId: null,
        kind: "system",
        body: `Visit Confirmed ✓\n${new Date(visit.scheduledAt).toLocaleString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "numeric",
          minute: "2-digit",
        })}`,
        createdAt: visit.updatedAt,
      });
      conversation.updatedAt = visit.updatedAt;
      return visit;
    });
  }
}
