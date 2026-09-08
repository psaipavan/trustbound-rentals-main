import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  BellRing,
  CalendarCheck,
  Lock,
  MessagesSquare,
  Send,
  Users,
} from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth/session";
import { createProperty } from "@/lib/properties/service";

const benefits = [
  { icon: Send, text: "Post your property in minutes" },
  { icon: Lock, text: "Control your privacy and when your number is shared" },
  { icon: MessagesSquare, text: "Manage inquiries in a single inbox" },
  { icon: CalendarCheck, text: "Schedule visits without phone tag" },
  { icon: BellRing, text: "Mark availability to keep the listing current" },
  { icon: Users, text: "See genuine tenant interest" },
  { icon: BarChart3, text: "Transparent listing performance" },
];

export const Route = createFileRoute("/list-property")({
  head: () => ({
    meta: [
      { title: "List your property on Bricxley — Hyderabad rentals" },
      {
        name: "description",
        content:
          "Post your rental on Bricxley. Control your privacy, manage inquiries, schedule visits and keep availability accurate.",
      },
      { property: "og:title", content: "List your property on Bricxley" },
      {
        property: "og:description",
        content: "Find the right tenant without the noise.",
      },
    ],
  }),
  component: ListPropertyPage,
});

function ListPropertyPage() {
  const { actor } = useSession();
  const navigate = useNavigate({ from: "/list-property" });
  const [propertyType, setPropertyType] = useState("Apartment");
  const [listedAs, setListedAs] = useState<"owner" | "agent">("owner");
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!actor) {
      await navigate({ to: "/auth", search: { redirect: "/list-property", role: listedAs } });
      return;
    }
    if (actor.role !== listedAs) {
      await navigate({ to: "/auth", search: { redirect: "/list-property", role: listedAs } });
      return;
    }
    const form = new FormData(event.currentTarget);
    setIsSaving(true);
    try {
      await createProperty(actor, {
        title: String(form.get("title") ?? ""),
        locality: String(form.get("locality") ?? ""),
        propertyType,
        monthlyRent: Number(form.get("rent") ?? 0),
        deposit: Number(form.get("deposit") ?? 0),
        brokerage: Number(form.get("brokerage") ?? 0),
        description: String(form.get("description") ?? ""),
        listedAs,
      });
      toast.success("Listing draft saved", {
        description: "It will be published after verification is complete.",
      });
      event.currentTarget.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't save this listing draft.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="For owners & verified agents"
        title="Find the right tenant without the noise."
        subtitle="Post once, stay in control of your contact details, and reach renters who can see exactly who they’re dealing with."
      />

      <section className="container-page grid gap-8 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="text-xl font-bold">Why owners list here</h2>
          <ul className="mt-5 space-y-3">
            {benefits.map((b) => (
              <li key={b.text} className="flex items-center gap-3 text-sm">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <b.icon className="h-4 w-4" aria-hidden />
                </span>
                {b.text}
              </li>
            ))}
          </ul>
        </div>

        <form className="surface-card space-y-5 p-6" onSubmit={(event) => void submit(event)}>
          <h2 className="text-xl font-bold">Start your listing</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="lp-title">Property title</Label>
              <Input
                id="lp-title"
                name="title"
                placeholder="e.g. Bright 2BHK in a quiet gated community"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lp-locality">Locality</Label>
              <Input id="lp-locality" name="locality" placeholder="Gachibowli" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lp-type">Property type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger id="lp-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Apartment", "Gated Community", "Independent House", "Villa", "Studio"].map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lp-rent">Monthly rent (₹)</Label>
              <Input id="lp-rent" name="rent" type="number" min={0} placeholder="32000" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lp-deposit">Deposit (₹)</Label>
              <Input
                id="lp-deposit"
                name="deposit"
                type="number"
                min={0}
                placeholder="64000"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lp-role">I am the</Label>
              <Select
                value={listedAs}
                onValueChange={(value) => setListedAs(value as "owner" | "agent")}
              >
                <SelectTrigger id="lp-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="agent">Verified agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lp-brokerage">Brokerage (₹)</Label>
              <Input id="lp-brokerage" name="brokerage" type="number" min={0} placeholder="0" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="lp-desc">Description</Label>
              <Textarea
                id="lp-desc"
                name="description"
                rows={4}
                placeholder="Tell renters what makes this home good."
              />
            </div>
          </div>

          <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            Agents must declare brokerage. It is displayed on the listing before any tenant makes
            contact — brokerage is never hidden on Bricxley.
          </p>

          <Button type="submit" size="lg" className="w-full" disabled={isSaving}>
            {isSaving ? "Saving listing…" : "Save listing draft"}
          </Button>
        </form>
      </section>
    </>
  );
}
