import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Bricxley" },
      {
        name: "description",
        content:
          "How Bricxley handles your personal data, phone number privacy and controlled contact sharing.",
      },
      { property: "og:title", content: "Privacy Policy — Bricxley" },
      {
        property: "og:description",
        content: "Your number stays private until you choose to share it.",
      },
    ],
  }),
  component: () => (
    <LegalPage
      title="Privacy Policy"
      intro="Contact privacy is a product principle, not a setting buried in a menu. This prototype policy explains the intent; the final policy will be counsel-reviewed."
      sections={[
        {
          heading: "Your phone number",
          body: "Phone numbers are collected for sign-in and account security. They are not displayed on listings, are not sold, and are not shared with other users automatically.",
        },
        {
          heading: "Controlled contact sharing",
          body: "Conversations happen inside Bricxley Chat. Contact details are exchanged only when both people explicitly choose to share them.",
        },
        {
          heading: "What we store",
          body: "Account details, listing content, saved homes, inquiries, visit requests, chat messages and reports — used to operate the marketplace and to investigate abuse.",
        },
        {
          heading: "Verification data",
          body: "Identity documents submitted for verification are used only to confirm identity and property association, with access restricted to the verification process.",
        },
        {
          heading: "Your controls",
          body: "You can review, correct, export or delete your account data, and adjust notification and contact-sharing preferences at any time from your profile.",
        },
      ]}
    />
  ),
});
