import { createFileRoute } from "@tanstack/react-router";
import { WorkflowConversation } from "@/components/workflow/WorkflowConversation";

export const Route = createFileRoute("/tenant/messages/$conversationId")({
  component: TenantConversation,
});

function TenantConversation() {
  const { conversationId } = Route.useParams();
  return <WorkflowConversation role="tenant" conversationId={conversationId} />;
}
