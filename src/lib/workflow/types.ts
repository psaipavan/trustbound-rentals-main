export const interestStatuses = [
  "DRAFT",
  "SUBMITTED",
  "ACCEPTED",
  "DECLINED",
  "WITHDRAWN",
  "EXPIRED",
] as const;

export type InterestStatus = (typeof interestStatuses)[number];

export const interestStatusGroups = {
  pending: ["SUBMITTED"],
  matched: ["ACCEPTED"],
  closed: ["DECLINED", "WITHDRAWN", "EXPIRED"],
} as const satisfies Record<"pending" | "matched" | "closed", readonly InterestStatus[]>;

export const visitStatuses = [
  "REQUESTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;

export type VisitStatus = (typeof visitStatuses)[number];

export type WorkflowRole = "tenant" | "owner" | "agent";

export type WorkflowActor = {
  id: string;
  role: WorkflowRole;
  displayName: string;
};

export type OccupationType =
  | "Working Professional"
  | "Student"
  | "Business"
  | "Family"
  | "Other";

export type InterestInput = {
  propertyId: string;
  moveInDate: string;
  occupants: number;
  occupationType: OccupationType;
  leasePreference?: string;
  message?: string;
};

export type Interest = InterestInput & {
  id: string;
  tenantId: string;
  tenantName: string;
  listerId: string;
  status: InterestStatus;
  createdAt: string;
  updatedAt: string;
};

export type ConversationMessage = {
  id: string;
  conversationId: string;
  senderId: string | null;
  kind: "message" | "system";
  body: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  propertyId: string;
  interestId: string;
  tenantId: string;
  listerId: string;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
};

export type ContactConsent = {
  id: string;
  conversationId: string;
  userId: string;
  sharedAt: string;
};

export type Visit = {
  id: string;
  propertyId: string;
  interestId: string;
  tenantId: string;
  listerId: string;
  scheduledAt: string;
  status: VisitStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateVisitInput = {
  interestId: string;
  scheduledAt: string;
};

export type WorkflowSnapshot = {
  interests: Interest[];
  conversations: Conversation[];
  visits: Visit[];
  contactConsents: ContactConsent[];
};

export type WorkflowRepository = {
  load: () => Promise<WorkflowSnapshot>;
  save: (snapshot: WorkflowSnapshot) => Promise<void>;
  transact: <T>(operation: (snapshot: WorkflowSnapshot) => T | Promise<T>) => Promise<T>;
};

export type WorkflowErrorCode =
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "UNAVAILABLE"
  | "DUPLICATE_INTEREST"
  | "INVALID_TRANSITION";

export class WorkflowError extends Error {
  constructor(
    public readonly code: WorkflowErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "WorkflowError";
  }
}
