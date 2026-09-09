import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/agent")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/agent" || location.pathname === "/agent/") {
      throw redirect({ to: "/dashboard/agent" });
    }
  },
});
