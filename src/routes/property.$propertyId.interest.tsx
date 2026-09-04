import { useEffect } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { InterestWizard } from "@/components/workflow/InterestWizard";
import { PropertySummaryCard } from "@/components/workflow/PropertySummaryCard";
import { Button } from "@/components/ui/button";
import { dashboardForRole, useSession } from "@/lib/auth/session";
import { trackWorkflowEvent } from "@/lib/analytics";
import { getProperty } from "@/data/properties";
import { useCreateInterestMutation, useTenantInterestsQuery } from "@/lib/workflow/query";
import type { Interest, InterestInput } from "@/lib/workflow/types";

export const Route = createFileRoute("/property/$propertyId/interest")({
  loader: ({ params }) => {
    const property = getProperty(params.propertyId);
    if (!property) throw notFound();
    return { property };
  },
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-bold">Listing not found</h1>
      <p className="mt-2 text-muted-foreground">This home may have been rented or removed.</p>
      <Button asChild className="mt-5">
        <Link to="/rent">View Similar Homes</Link>
      </Button>
    </div>
  ),
  errorComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-bold">This interest form didn’t load</h1>
      <p className="mt-2 text-muted-foreground">Please try again or browse other verified homes.</p>
      <Button asChild className="mt-5">
        <Link to="/rent">View Similar Homes</Link>
      </Button>
    </div>
  ),
  component: InterestRoute,
});

function InterestRoute() {
  const { property } = Route.useLoaderData();
  const { actor, isReady } = useSession();
  const navigate = useNavigate({ from: "/property/$propertyId/interest" });
  const createInterest = useCreateInterestMutation(actor);
  const tenantInterests = useTenantInterestsQuery(actor);
  const interestPath = `/property/${property.id}/interest`;
  const recentInterest = tenantInterests.data?.reduce<Interest | undefined>((latest, interest) => {
    if (interest.status !== "SUBMITTED" && interest.status !== "ACCEPTED") return latest;
    if (!latest || interest.updatedAt > latest.updatedAt) return interest;
    return latest;
  }, undefined);

  useEffect(() => {
    if (!isReady) return;
    if (!actor) {
      void navigate({ to: "/auth", search: { redirect: interestPath } });
      return;
    }
    if (actor.role !== "tenant") {
      void navigate({ to: dashboardForRole(actor.role) });
      return;
    }
    if (property.status === "available") {
      trackWorkflowEvent("interest_started", { propertyId: property.id });
    }
  }, [actor, interestPath, isReady, navigate, property.id, property.status]);

  if (!isReady) return <InterestRouteLoading message="Loading your interest form…" />;
  if (!actor) return <InterestRouteLoading message="Taking you to sign in…" />;
  if (actor.role !== "tenant")
    return <InterestRouteLoading message="Taking you to your dashboard…" />;

  if (property.status !== "available") {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-lg surface-card p-6 text-center">
          <h1 className="text-xl font-bold">This home is currently unavailable.</h1>
          <Button asChild className="mt-5">
            <Link to="/rent">View Similar Homes</Link>
          </Button>
        </div>
      </div>
    );
  }

  const submitInterest = async (input: InterestInput) => {
    try {
      return await createInterest.mutateAsync(input);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "We couldn't send your interest. Please try again.",
      );
      throw error;
    }
  };

  return (
    <div className="bg-sand/50 py-8 sm:py-12">
      <div className="container-page">
        <Link
          to="/property/$propertyId"
          params={{ propertyId: property.id }}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to listing
        </Link>
        <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <h1 className="text-2xl font-extrabold">Tell the owner you’re interested</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              This takes a minute and does not share your contact details.
            </p>
            <div className="mt-6">
              <InterestWizard
                propertyId={property.id}
                propertyTitle={property.title}
                recentInterest={recentInterest}
                isSubmitting={createInterest.isPending}
                onSubmit={submitInterest}
                onSubmitted={(interest) => {
                  void navigate({
                    to: "/tenant/interests/$interestId" as never,
                    params: { interestId: interest.id } as never,
                  });
                }}
              />
            </div>
          </div>
          <PropertySummaryCard property={property} />
        </div>
      </div>
    </div>
  );
}

function InterestRouteLoading({ message }: { message: string }) {
  return (
    <div className="container-page py-20" role="status" aria-live="polite">
      <p className="text-center text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
