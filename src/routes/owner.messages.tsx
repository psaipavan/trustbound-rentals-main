import { createFileRoute } from "@tanstack/react-router";
import { WorkflowInbox } from "@/components/workflow/WorkflowInbox";

export const Route = createFileRoute("/owner/messages")({
  component: () => <WorkflowInbox role="owner" />,
});
