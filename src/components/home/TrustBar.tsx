import { BadgeCheck, IndianRupee, Lock, ReceiptText } from "lucide-react";

const items = [
  {
    icon: BadgeCheck,
    title: "Verified Listings",
    text: "Identity and property checks before a home goes live.",
  },
  {
    icon: ReceiptText,
    title: "Transparent Brokerage",
    text: "Agent brokerage is always shown upfront, never hidden.",
  },
  {
    icon: Lock,
    title: "Secure Conversations",
    text: "Talk through In Bound Chat without sharing your number.",
  },
  {
    icon: IndianRupee,
    title: "₹0 Viewing Fees",
    text: "You never pay simply to look at a property.",
  },
];

export function TrustBar() {
  return (
    <section className="container-page -mt-1 py-12" aria-label="Why In Bound is different">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="surface-card hover-lift p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-3.5 text-sm font-bold">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
