import { useEffect } from "react";
import { createFileRoute, Link, notFound, Outlet, useRouterState } from "@tanstack/react-router";
import { Heart, MapPin, Share2 } from "lucide-react";
import { toast } from "sonner";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { BoundScorePanel } from "@/components/property/BoundScore";
import { VerificationBadge } from "@/components/property/VerificationBadge";
import { AgentCard, OwnerCard } from "@/components/property/ListerCard";
import { CostBreakdown } from "@/components/property/CostBreakdown";
import { ReportModal } from "@/components/property/ReportModal";
import { AvailabilityControl } from "@/components/property/AvailabilityControl";
import { LocationNearby } from "@/components/property/LocationNearby";
import { Button } from "@/components/ui/button";
import { getProperty, properties } from "@/data/properties";
import { hoursAgo, inr } from "@/lib/format";
import { useSaved } from "@/lib/saved-store";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth/session";
import { useTenantInterestsQuery } from "@/lib/workflow/query";
import { trackWorkflowEvent } from "@/lib/analytics";

export const Route = createFileRoute("/property/$propertyId")({
  loader: ({ params }) => {
    const property = getProperty(params.propertyId);
    if (!property) throw notFound();
    return { property };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Listing unavailable — Bricxley" }, { name: "robots", content: "noindex" }],
      };
    }
    const { property } = loaderData;
    const title = `${property.title}, ${property.locality} — ${inr(property.rent)}/month | Bricxley`;
    const description = `${property.bhk}BHK ${property.propertyType.toLowerCase()} in ${property.locality}, Hyderabad. Deposit ${inr(property.deposit)}. Brokerage ${property.brokerage > 0 ? inr(property.brokerage) : "₹0"}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  errorComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-bold">This listing didn’t load</h1>
      <Button asChild className="mt-4">
        <Link to="/rent">Back to rentals</Link>
      </Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-bold">Listing not found</h1>
      <p className="mt-2 text-muted-foreground">It may have been rented or removed.</p>
      <Button asChild className="mt-4">
        <Link to="/rent">Browse verified rentals</Link>
      </Button>
    </div>
  ),
  component: PropertyDetail,
});

function PropertyDetail() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { property } = Route.useLoaderData();
  const { isSaved, toggle } = useSaved();
  const { actor } = useSession();
  const { data: interests = [] } = useTenantInterestsQuery(actor);
  const saved = isSaved(property.id);
  const isAgent = property.lister.type === "agent";
  const activeInterest = interests.find(
    (interest) =>
      interest.propertyId === property.id &&
      (interest.status === "DRAFT" ||
        interest.status === "SUBMITTED" ||
        interest.status === "ACCEPTED"),
  );

  useEffect(() => {
    trackWorkflowEvent("property_viewed", { propertyId: property.id });
  }, [property.id]);

  if (pathname.endsWith("/interest")) return <Outlet />;

  const shareProperty = async () => {
    const shareData = {
      title: property.title,
      text: `${property.title} in ${property.locality}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Listing link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("We couldn't share this listing. Please copy the link from your browser.");
    }
  };

  const facts: [string, string][] = [
    ["Rent", `${inr(property.rent)} / month`],
    ["Deposit", inr(property.deposit)],
    ["Maintenance", `${inr(property.maintenance)} / month`],
    ["Configuration", `${property.bhk} BHK`],
    ["Bathrooms", String(property.bathrooms)],
    ["Built-up area", `${property.areaSqft} sq.ft`],
    ["Furnishing", property.furnishing],
    ["Floor", property.floor],
    ["Parking", property.parking],
    ["Available from", property.availableFrom],
    ["Tenant preference", property.tenantPreference],
    ["Pet policy", property.petPolicy],
    ["Property age", `${property.propertyAgeYears} years`],
    ["Property type", property.propertyType],
  ];

  const similar = properties.filter((p) => p.id !== property.id).slice(0, 3);

  return (
    <div className="bg-sand/50">
      <div className="container-page py-8">
        <nav className="text-sm text-muted-foreground">
          <Link to="/rent" className="hover:text-primary">
            Rentals
          </Link>
          <span className="px-2">/</span>
          <span>{property.locality}</span>
        </nav>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
          <div className="space-y-8">
            <PropertyGallery images={property.images} title={property.title} />

            <header className="surface-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold sm:text-3xl">{property.title}</h1>
                  <p className="mt-1.5 flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" aria-hidden />
                    {property.locality}, {property.city}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggle(property.id)}
                    aria-pressed={saved}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-primary"
                  >
                    <Heart
                      className={cn("h-4 w-4", saved ? "fill-destructive text-destructive" : "")}
                    />
                    {saved ? "Saved" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void shareProperty()}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-primary"
                  >
                    <Share2 className="h-4 w-4" aria-hidden /> Share
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {property.ownerVerified ? (
                  <VerificationBadge variant="owner" label="Owner Verified" animate />
                ) : null}
                {property.propertyVerified ? (
                  <VerificationBadge variant="property" label="Property Verified" animate />
                ) : null}
                {isAgent ? (
                  <>
                    <VerificationBadge variant="agent" label="Agent Listing" />
                    <VerificationBadge
                      variant="brokerage"
                      label={`Brokerage: ${inr(property.brokerage)}`}
                    />
                  </>
                ) : (
                  <VerificationBadge variant="direct" label="Owner Direct · Brokerage ₹0" />
                )}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Verified {hoursAgo(property.verifiedHoursAgo)} · availability confirmed{" "}
                {hoursAgo(property.availabilityConfirmedHoursAgo)}
              </p>

              <dl className="mt-6 grid gap-x-6 gap-y-3 border-t border-border pt-5 sm:grid-cols-2">
                {facts.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 text-sm">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </header>

            <section className="surface-card p-6">
              <h2 className="text-lg font-bold">About this home</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {property.description}
              </p>

              <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Amenities
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <li
                    key={a}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </section>

            <LocationNearby property={property} />

            <CostBreakdown property={property} />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <div className="surface-card space-y-3 p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold">{inr(property.rent)}</span>
                <span className="text-muted-foreground">/ month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Deposit {inr(property.deposit)} · Maintenance {inr(property.maintenance)}
              </p>
              {activeInterest ? (
                <Button asChild className="h-11 w-full">
                  <Link
                    to="/tenant/interests/$interestId"
                    params={{ interestId: activeInterest.id }}
                  >
                    <Heart className="h-4 w-4" aria-hidden /> Interest Sent
                  </Link>
                </Button>
              ) : property.status === "available" ? (
                <Button asChild className="h-11 w-full">
                  <Link to="/property/$propertyId/interest" params={{ propertyId: property.id }}>
                    <Heart className="h-4 w-4" aria-hidden /> I&apos;m Interested
                  </Link>
                </Button>
              ) : (
                <Button className="h-11 w-full" disabled>
                  Currently unavailable
                </Button>
              )}
              <p className="text-center text-xs font-semibold text-verified">
                ₹0 viewing fee — never pay to see a home.
              </p>
            </div>

            {isAgent ? (
              <AgentCard lister={property.lister} brokerage={property.brokerage} />
            ) : (
              <OwnerCard lister={property.lister} />
            )}

            <AvailabilityControl confirmedHoursAgo={property.availabilityConfirmedHoursAgo} />

            <BoundScorePanel score={property.boundScore} />

            <div className="flex justify-center">
              <ReportModal propertyId={property.id} />
            </div>
          </aside>
        </div>

        <section className="py-16">
          <h2 className="text-2xl font-extrabold">More verified homes</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <SimilarCard key={p.id} id={p.id} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SimilarCard({ id }: { id: string }) {
  const p = getProperty(id)!;
  return (
    <Link
      to="/property/$propertyId"
      params={{ propertyId: p.id }}
      className="surface-card hover-lift block overflow-hidden"
    >
      <img
        src={p.images[0]}
        alt={p.title}
        loading="lazy"
        width={1280}
        height={853}
        className="h-40 w-full object-cover"
      />
      <div className="p-4">
        <p className="font-semibold">{p.title}</p>
        <p className="text-sm text-muted-foreground">
          {p.locality} · {inr(p.rent)} / month
        </p>
      </div>
    </Link>
  );
}
