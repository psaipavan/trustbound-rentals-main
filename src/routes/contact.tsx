import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Bricxley" },
      {
        name: "description",
        content:
          "Questions about listings, verification, agents or partnerships? Send the Bricxley team a message.",
      },
      { property: "og:title", content: "Contact Bricxley" },
      { property: "og:description", content: "We read everything renters and owners send us." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Tell us what renting should feel like."
        subtitle="Whether you’re a renter, an owner, an agency or a partner — we want the friction you’ve experienced."
      />

      <section className="container-page py-16">
        <form
          className="surface-card mx-auto max-w-xl space-y-5 p-7"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Message sent", { description: "We’ll get back to you soon." });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-subject">Subject</Label>
            <Input id="c-subject" placeholder="Listing, verification, partnership…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-message">Message</Label>
            <Textarea id="c-message" rows={5} required />
          </div>
          <Button type="submit" size="lg" className="w-full">
            Send message
          </Button>
        </form>
      </section>
    </>
  );
}
