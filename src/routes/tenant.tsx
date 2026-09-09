import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/tenant")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/tenant" || location.pathname === "/tenant/") {
      throw redirect({ to: "/dashboard/tenant" });
    }
  },
});
