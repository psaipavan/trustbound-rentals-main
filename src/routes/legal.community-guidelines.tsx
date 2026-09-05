import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/legal/community-guidelines")({
  head: () => ({
    meta: [
      { title: "Community Guidelines — Bricxley" },
      {
        name: "description",
        content:
          "The behaviour expected from tenants, owners and agents on Bricxley: honest listings, declared brokerage and respectful communication.",
      },
      { property: "og:title", content: "Community Guidelines — Bricxley" },
      {
        property: "og:description",
        content: "Honest listings. Declared roles. Respectful conversations.",
      },
    ],
  }),
  component: () => (
    <LegalPage
      title="Community Guidelines"
      intro="A marketplace is only as trustworthy as the behaviour it rewards. These are the standards Bricxley holds everyone to."
      sections={[
        {
          heading: "Be who you say you are",
          body: "Declare whether you are an owner or an agent. Agent listings are labelled as such and can never be presented as owner-direct.",
        },
        {
          heading: "List honestly",
          body: "Photos must be of the actual property. Rent, deposit, maintenance and brokerage must match what you will actually charge.",
        },
        {
          heading: "Keep listings current",
          body: "Confirm availability when prompted, and mark a home as rented once it is. Outdated listings waste everyone’s time.",
        },
        {
          heading: "No pay-to-view",
          body: "Never ask a tenant for money simply to view a property. This is grounds for removal from the platform.",
        },
        {
          heading: "Communicate respectfully",
          body: "No harassment, discrimination or pressure tactics. Keep conversations inside Bricxley Chat until both sides agree otherwise.",
        },
        {
          heading: "Report, don’t retaliate",
          body: "If something looks wrong, use Report Listing. Every report is reviewed by a human before any action is taken.",
        },
      ]}
    />
  ),
});
