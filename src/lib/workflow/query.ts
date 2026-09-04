import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trackWorkflowEvent } from "@/lib/analytics";
import { createMockWorkflowRepository } from "./mock-repository";
import { WorkflowService } from "./service";
import {
  WorkflowError,
  type CreateVisitInput,
  type InterestInput,
  type WorkflowActor,
} from "./types";

const workflowService = new WorkflowService(createMockWorkflowRepository());

export const workflowKeys = {
  tenantInterests: (tenantId: string) => ["tenant-interests", tenantId] as const,
  ownerInterests: (ownerId: string) => ["owner-interests", ownerId] as const,
  interest: (actorId: string, interestId: string) => ["interest", actorId, interestId] as const,
  conversation: (actorId: string, conversationId: string) =>
    ["conversation", actorId, conversationId] as const,
  conversations: (actorId: string) => ["conversations", actorId] as const,
  visits: (actorId: string) => ["visits", actorId] as const,
};

function requireActor(actor: WorkflowActor | null): WorkflowActor {
  if (!actor) throw new WorkflowError("UNAUTHENTICATED", "Please sign in to continue.");
  return actor;
}

export function useTenantInterestsQuery(actor: WorkflowActor | null) {
  return useQuery({
    queryKey: workflowKeys.tenantInterests(actor?.id ?? "anonymous"),
    queryFn: () => workflowService.listTenantInterests(requireActor(actor)),
    enabled: actor?.role === "tenant",
  });
}

export function useOwnerInterestsQuery(actor: WorkflowActor | null) {
  return useQuery({
    queryKey: workflowKeys.ownerInterests(actor?.id ?? "anonymous"),
    queryFn: () => workflowService.listOwnerInterests(requireActor(actor)),
    enabled: actor?.role === "owner" || actor?.role === "agent",
  });
}

export function useInterestQuery(actor: WorkflowActor | null, interestId: string) {
  return useQuery({
    queryKey: workflowKeys.interest(actor?.id ?? "anonymous", interestId),
    queryFn: () => workflowService.getInterest(requireActor(actor), interestId),
    enabled: Boolean(actor && interestId),
  });
}

export function useConversationQuery(actor: WorkflowActor | null, conversationId: string) {
  return useQuery({
    queryKey: workflowKeys.conversation(actor?.id ?? "anonymous", conversationId),
    queryFn: () => workflowService.getConversation(requireActor(actor), conversationId),
    enabled: Boolean(actor && conversationId),
  });
}

export function useConversationsQuery(actor: WorkflowActor | null) {
  return useQuery({
    queryKey: workflowKeys.conversations(actor?.id ?? "anonymous"),
    queryFn: () => workflowService.listConversations(requireActor(actor)),
    enabled: Boolean(actor),
  });
}

export function useVisitsQuery(actor: WorkflowActor | null) {
  return useQuery({
    queryKey: workflowKeys.visits(actor?.id ?? "anonymous"),
    queryFn: () => workflowService.listVisits(requireActor(actor)),
    enabled: Boolean(actor),
  });
}

export function useCreateInterestMutation(actor: WorkflowActor | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InterestInput) =>
      workflowService.createInterest(requireActor(actor), input),
    onSuccess: (interest) => {
      trackWorkflowEvent("interest_submitted", {
        interestId: interest.id,
        propertyId: interest.propertyId,
      });
      void queryClient.invalidateQueries({
        queryKey: workflowKeys.tenantInterests(interest.tenantId),
      });
      void queryClient.invalidateQueries({
        queryKey: workflowKeys.interest(interest.tenantId, interest.id),
      });
    },
  });
}

export function useAcceptInterestMutation(actor: WorkflowActor | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (interestId: string) =>
      workflowService.acceptInterest(requireActor(actor), interestId),
    onSuccess: async (interest) => {
      trackWorkflowEvent("interest_accepted", {
        interestId: interest.id,
        propertyId: interest.propertyId,
      });
      const conversation = await workflowService.getConversationForInterest(
        requireActor(actor),
        interest.id,
      );
      trackWorkflowEvent("match_created", {
        conversationId: conversation.id,
        interestId: interest.id,
        propertyId: interest.propertyId,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workflowKeys.ownerInterests(interest.listerId) }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.tenantInterests(interest.tenantId),
        }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.interest(interest.tenantId, interest.id),
        }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.interest(interest.listerId, interest.id),
        }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.conversation(interest.tenantId, conversation.id),
        }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.conversation(interest.listerId, conversation.id),
        }),
        queryClient.invalidateQueries({ queryKey: workflowKeys.conversations(interest.tenantId) }),
        queryClient.invalidateQueries({ queryKey: workflowKeys.conversations(interest.listerId) }),
      ]);
    },
  });
}

export function useDeclineInterestMutation(actor: WorkflowActor | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (interestId: string) =>
      workflowService.declineInterest(requireActor(actor), interestId),
    onSuccess: (interest) => {
      trackWorkflowEvent("interest_declined", {
        interestId: interest.id,
        propertyId: interest.propertyId,
      });
      void queryClient.invalidateQueries({
        queryKey: workflowKeys.ownerInterests(interest.listerId),
      });
      void queryClient.invalidateQueries({
        queryKey: workflowKeys.tenantInterests(interest.tenantId),
      });
      void queryClient.invalidateQueries({
        queryKey: workflowKeys.interest(interest.tenantId, interest.id),
      });
      void queryClient.invalidateQueries({
        queryKey: workflowKeys.interest(interest.listerId, interest.id),
      });
    },
  });
}

export function useWithdrawInterestMutation(actor: WorkflowActor | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (interestId: string) =>
      workflowService.withdrawInterest(requireActor(actor), interestId),
    onSuccess: (interest) => {
      void queryClient.invalidateQueries({
        queryKey: workflowKeys.tenantInterests(interest.tenantId),
      });
      void queryClient.invalidateQueries({
        queryKey: workflowKeys.ownerInterests(interest.listerId),
      });
      void queryClient.invalidateQueries({
        queryKey: workflowKeys.interest(interest.tenantId, interest.id),
      });
      void queryClient.invalidateQueries({
        queryKey: workflowKeys.interest(interest.listerId, interest.id),
      });
    },
  });
}

export function useSendMessageMutation(actor: WorkflowActor | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, body }: { conversationId: string; body: string }) =>
      workflowService.sendMessage(requireActor(actor), conversationId, body),
    onSuccess: async (message) => {
      const conversation = await workflowService.getConversation(
        requireActor(actor),
        message.conversationId,
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: workflowKeys.conversation(conversation.tenantId, conversation.id),
        }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.conversation(conversation.listerId, conversation.id),
        }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.conversations(conversation.tenantId),
        }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.conversations(conversation.listerId),
        }),
      ]);
    },
  });
}

export function useShareContactMutation(actor: WorkflowActor | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      workflowService.shareContact(requireActor(actor), conversationId),
    onSuccess: async (consent) => {
      trackWorkflowEvent("contact_shared", { conversationId: consent.conversationId });
      const conversation = await workflowService.getConversation(
        requireActor(actor),
        consent.conversationId,
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: workflowKeys.conversation(conversation.tenantId, conversation.id),
        }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.conversation(conversation.listerId, conversation.id),
        }),
      ]);
    },
  });
}

export function useCreateVisitMutation(actor: WorkflowActor | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVisitInput) =>
      workflowService.createVisit(requireActor(actor), input),
    onSuccess: async (visit) => {
      trackWorkflowEvent("visit_requested", { interestId: visit.interestId, visitId: visit.id });
      const conversation = await workflowService.getConversationForInterest(
        requireActor(actor),
        visit.interestId,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workflowKeys.visits(visit.tenantId) }),
        queryClient.invalidateQueries({ queryKey: workflowKeys.visits(visit.listerId) }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.conversation(conversation.tenantId, conversation.id),
        }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.conversation(conversation.listerId, conversation.id),
        }),
      ]);
    },
  });
}

export function useConfirmVisitMutation(actor: WorkflowActor | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (visitId: string) => workflowService.confirmVisit(requireActor(actor), visitId),
    onSuccess: async (visit) => {
      trackWorkflowEvent("visit_confirmed", { interestId: visit.interestId, visitId: visit.id });
      const conversation = await workflowService.getConversationForInterest(
        requireActor(actor),
        visit.interestId,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workflowKeys.visits(visit.tenantId) }),
        queryClient.invalidateQueries({ queryKey: workflowKeys.visits(visit.listerId) }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.conversation(conversation.tenantId, conversation.id),
        }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.conversation(conversation.listerId, conversation.id),
        }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.conversations(conversation.tenantId),
        }),
        queryClient.invalidateQueries({
          queryKey: workflowKeys.conversations(conversation.listerId),
        }),
      ]);
    },
  });
}
