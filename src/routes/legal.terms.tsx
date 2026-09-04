import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Bricxley" },
      {
        name: "description",
        content: "The terms that govern use of the Bricxley rental marketplace.",
      },
      { property: "og:title", content: "Terms of Use — Bricxley" },
      { property: "og:description", content: "How Bricxley may be used by renters, owners and agents." },
    ],
  }),
  component: () => (
    <LegalPage
      title="Terms of Use"
      intro="These terms describe how Bricxley may be used. This is a prototype document and will be replaced by counsel-reviewed terms before launch."
      sections={[
        {
          heading: "Using Bricxley",
          body: "Bricxley is a marketplace connecting tenants, property owners and verified agents. We facilitate discovery, communication and visit scheduling; we are not a party to any rental agreement.",
        },
        {
          heading: "Listing accuracy",
          body: "Anyone posting a property must be the owner or an authorised agent, must declare their role accurately, and must declare brokerage where applicable. Misrepresenting an agent listing as owner-direct is a breach of these terms.",
        },
        {
          heading: "Payments",
          body: "Bricxley does not require tenants to pay money simply to view a property. Any request for a viewing payment should be reported through the listing’s Report option.",
        },
        {
          heading: "Verification and Bricxley Score",
          body: "Verification badges and the Bricxley Score reflect the checks the platform has actually performed. In the current prototype these values are illustrative and labelled as demo values.",
        },
        {
          heading: "Moderation",
          body: "Reported listings enter a human review queue. We may pause, request re-verification of, or remove content that breaches these terms.",
        },
      ]}
    />
  ),
});
