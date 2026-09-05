import { createFileRoute } from "@tanstack/react-router";
import { WorkflowConversation } from "@/components/workflow/WorkflowConversation";

export const Route = createFileRoute("/owner/messages/$conversationId")({
  component: OwnerConversation,
});

function OwnerConversation() {
  const { conversationId } = Route.useParams();
  return <WorkflowConversation role="owner" conversationId={conversationId} />;
}
