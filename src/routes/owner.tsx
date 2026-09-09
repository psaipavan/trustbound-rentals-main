import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/owner")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/owner" || location.pathname === "/owner/") {
      throw redirect({ to: "/dashboard/owner" });
    }
  },
});
