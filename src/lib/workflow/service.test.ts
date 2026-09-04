import { expect, test } from "vitest";
import { getProperty, type Property } from "@/data/properties";
import { createMockWorkflowRepository } from "./mock-repository";
import { WorkflowService } from "./service";
import type { InterestInput, WorkflowActor } from "./types";

const tenant: WorkflowActor = {
  id: "u-tenant-demo",
  role: "tenant",
  displayName: "Sai",
};

const owner: WorkflowActor = {
  id: "u-anita",
  role: "owner",
  displayName: "A. Reddy",
};

const otherOwner: WorkflowActor = {
  id: "u-other-owner",
  role: "owner",
  displayName: "Other Owner",
};

const otherTenant: WorkflowActor = {
  id: "u-other-tenant",
  role: "tenant",
  displayName: "Another Tenant",
};

const input: InterestInput = {
  propertyId: "br-001",
  moveInDate: "2026-10-01",
  occupants: 2,
  occupationType: "Working Professional",
  leasePreference: "11 months",
  message: "Quiet household",
};

function createService(getPropertyById: (propertyId: string) => Property | undefined = getProperty) {
  let id = 0;
  return new WorkflowService(createMockWorkflowRepository(), {
    getProperty: getPropertyById,
    now: () => new Date("2026-09-18T10:00:00.000Z"),
    createId: (prefix) => `${prefix}-${++id}`,
  });
}

async function acceptedInterest(service: WorkflowService) {
  const interest = await service.createInterest(tenant, input);
  return service.acceptInterest(owner, interest.id);
}

test("creates one submitted interest for an available property", async () => {
  const result = await createService().createInterest(tenant, input);

  expect(result.status).toBe("SUBMITTED");
  expect(result.listerId).toBe("u-anita");
  expect(result.tenantId).toBe("u-tenant-demo");
});

test("rejects a second active interest for the same tenant and property", async () => {
  const service = createService();
  await service.createInterest(tenant, input);

  await expect(service.createInterest(tenant, input)).rejects.toMatchObject({
    code: "DUPLICATE_INTEREST",
  });
});

test("accepting a submitted interest creates a matched conversation", async () => {
  const service = createService();
  const interest = await service.createInterest(tenant, input);
  const accepted = await service.acceptInterest(owner, interest.id);
  const conversation = await service.getConversationForInterest(tenant, accepted.id);

  expect(accepted.status).toBe("ACCEPTED");
  expect(conversation.interestId).toBe(accepted.id);
  expect(conversation.tenantId).toBe("u-tenant-demo");
});

test("does not create a duplicate conversation when an accepted interest is read again", async () => {
  const service = createService();
  const interest = await acceptedInterest(service);

  await service.getConversationForInterest(tenant, interest.id);
  await service.getConversationForInterest(owner, interest.id);

  expect((await service.listConversations(tenant)).filter((item) => item.interestId === interest.id)).toHaveLength(1);
});

test("retrieves a matched conversation by the conversation id used in its route", async () => {
  const service = createService();
  const interest = await acceptedInterest(service);
  const conversation = await service.getConversationForInterest(tenant, interest.id);

  await expect(service.getConversation(tenant, conversation.id)).resolves.toMatchObject({
    id: conversation.id,
  });
});

test("rejects an owner who does not manage the listing", async () => {
  const service = createService();
  const interest = await service.createInterest(tenant, input);

  await expect(service.acceptInterest(otherOwner, interest.id)).rejects.toMatchObject({
    code: "UNAUTHORIZED",
  });
});

test("keeps one tenant from reading another tenant's interest", async () => {
  const service = createService();
  const interest = await service.createInterest(tenant, input);

  await expect(service.getInterest(otherTenant, interest.id)).rejects.toMatchObject({
    code: "UNAUTHORIZED",
  });
});

test("rejects new interest when the home is unavailable", async () => {
  const service = createService((propertyId) => {
    const property = getProperty(propertyId);
    return property ? { ...property, status: "paused" } : undefined;
  });

  await expect(service.createInterest(tenant, input)).rejects.toMatchObject({ code: "UNAVAILABLE" });
});

test("does not accept an interest after the home becomes unavailable", async () => {
  let isAvailable = true;
  const service = createService((propertyId) => {
    const property = getProperty(propertyId);
    return property ? { ...property, status: isAvailable ? "available" : "paused" } : undefined;
  });
  const interest = await service.createInterest(tenant, input);
  isAvailable = false;

  await expect(service.acceptInterest(owner, interest.id)).rejects.toMatchObject({ code: "UNAVAILABLE" });
});

test("allows only one concurrent active interest for the same tenant and home", async () => {
  const service = createService();
  const outcomes = await Promise.allSettled([
    service.createInterest(tenant, input),
    service.createInterest(tenant, input),
  ]);

  expect(outcomes.filter((outcome) => outcome.status === "fulfilled")).toHaveLength(1);
  expect(outcomes.filter((outcome) => outcome.status === "rejected")).toHaveLength(1);
  expect(await service.listTenantInterests(tenant)).toHaveLength(1);
});

test("does not allow a declined interest to be accepted", async () => {
  const service = createService();
  const interest = await service.createInterest(tenant, input);
  await service.declineInterest(owner, interest.id);

  await expect(service.acceptInterest(owner, interest.id)).rejects.toMatchObject({
    code: "INVALID_TRANSITION",
  });
});

test("records explicit contact consent without returning a phone number", async () => {
  const service = createService();
  const interest = await acceptedInterest(service);
  const conversation = await service.getConversationForInterest(tenant, interest.id);
  const consent = await service.shareContact(tenant, conversation.id);

  expect(consent).toMatchObject({ conversationId: conversation.id, userId: tenant.id });
  expect(consent).not.toHaveProperty("phoneNumber");
});

test("confirming a visit appends a system message to the matched conversation", async () => {
  const service = createService();
  const interest = await acceptedInterest(service);
  const conversation = await service.getConversationForInterest(tenant, interest.id);
  const visit = await service.createVisit(tenant, {
    interestId: interest.id,
    scheduledAt: "2026-09-21T16:00:00.000Z",
  });
  const confirmed = await service.confirmVisit(owner, visit.id);
  const refreshed = await service.getConversationForInterest(tenant, conversation.interestId);

  expect(confirmed.status).toBe("CONFIRMED");
  expect(refreshed.messages.some((message) => message.kind === "system" && message.body.includes("Visit Confirmed ✓"))).toBe(true);
});

test("persists both concurrent messages in one matched conversation", async () => {
  const service = createService();
  const interest = await acceptedInterest(service);
  const conversation = await service.getConversationForInterest(tenant, interest.id);

  await Promise.all([
    service.sendMessage(tenant, conversation.id, "Is parking included?"),
    service.sendMessage(owner, conversation.id, "Yes, one covered spot is included."),
  ]);

  const refreshed = await service.getConversation(tenant, conversation.id);
  expect(refreshed.messages.map((message) => message.body)).toEqual(
    expect.arrayContaining([
      "Is parking included?",
      "Yes, one covered spot is included.",
    ]),
  );
});
