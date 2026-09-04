import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardForRole, useSession } from "@/lib/auth/session";
import { useInterestQuery } from "@/lib/workflow/query";

export const Route = createFileRoute("/tenant/interests/$interestId")({
  component: TenantInterestSuccess,
});

function TenantInterestSuccess() {
  const { interestId } = Route.useParams();
  const { actor, isReady } = useSession();
  const navigate = useNavigate({ from: "/tenant/interests/$interestId" });
  const interest = useInterestQuery(actor, interestId);

  useEffect(() => {
    if (!isReady) return;
    if (!actor) {
      void navigate({
        to: "/auth",
        search: { redirect: `/tenant/interests/${interestId}` },
      });
      return;
    }
    if (actor.role !== "tenant") {
      void navigate({ to: dashboardForRole(actor.role) });
    }
  }, [actor, interestId, isReady, navigate]);

  if (!isReady || !actor || actor.role !== "tenant") {
    return <div className="container-page py-12 text-sm text-muted-foreground">Loading interest…</div>;
  }
  if (interest.isPending)
    return (
      <div className="container-page py-20 text-center text-muted-foreground">
        Loading your interest…
      </div>
    );
  if (interest.isError || !interest.data) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-bold">Interest not found</h1>
        <Button asChild className="mt-5">
          <Link to="/rent">View Similar Homes</Link>
        </Button>
      </div>
    );
  }

  const content = {
    SUBMITTED: {
      title: "Interest Sent",
      message: "The property owner has received your request. We will notify you when they respond.",
    },
    ACCEPTED: {
      title: "You’re Matched",
      message: "The property owner accepted your interest. Secure messaging is now available.",
    },
    DRAFT: {
      title: "Interest draft",
      message: "This interest has not been sent yet.",
    },
    DECLINED: {
      title: "Interest closed",
      message: "The property owner was unable to proceed with this request.",
    },
    WITHDRAWN: {
      title: "Interest withdrawn",
      message: "You withdrew this interest. It is now read-only.",
    },
    EXPIRED: {
      title: "Interest expired",
      message: "This interest is no longer active.",
    },
  }[interest.data.status];

  return (
    <div className="bg-sand/50 py-16 sm:py-24">
      <section className="container-page">
        <div className="mx-auto max-w-xl surface-card p-7 text-center sm:p-10">
          <CheckCircle2 className="mx-auto h-11 w-11 text-verified" aria-hidden />
          <h1 className="mt-4 text-2xl font-extrabold">{content.title}</h1>
          <p className="mt-3 text-muted-foreground">{content.message}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/tenant/interests">View My Interests</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/rent">View Similar Homes</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
