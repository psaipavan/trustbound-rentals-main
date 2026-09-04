import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const columns = [
  {
    title: "Discover",
    links: [
      { label: "Rent", to: "/rent" },
      { label: "Localities", to: "/localities" },
      { label: "Flatmates", to: "/flatmates" },
    ],
  },
  {
    title: "Owners",
    links: [
      { label: "Post Property", to: "/list-property" },
      { label: "Owner Dashboard", to: "/dashboard/owner" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "How It Works", to: "/how-it-works" },
      { label: "Safety", to: "/safety" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", to: "/legal/terms" },
      { label: "Privacy", to: "/legal/privacy" },
      { label: "Community Guidelines", to: "/legal/community-guidelines" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-navy text-navy-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-navy-foreground/70">
            Let’s bound together. A trusted rental marketplace for tenants, owners and verified
            agents in Hyderabad.
          </p>
          <div className="mt-5 flex gap-2">
            {[Twitter, Instagram, Linkedin].map((Icon, i) => (
              <span
                key={i}
                className="grid h-9 w-9 place-items-center rounded-full border border-navy-foreground/20 text-navy-foreground/80 transition hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-bold">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-navy-foreground/70 transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-navy-foreground/12">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-navy-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 In Bound. All rights reserved.</p>
          <p>Prototype experience — listing data shown is illustrative.</p>
        </div>
      </div>
    </footer>
  );
}
