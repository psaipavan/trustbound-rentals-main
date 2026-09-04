import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Menu } from "lucide-react";
import { BricxleyLogo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSaved } from "@/lib/saved-store";

const links = [
  { to: "/rent", label: "Rent" },
  { to: "/list-property", label: "List Property" },
  { to: "/flatmates", label: "Flatmates" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/safety", label: "Safety" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { saved, setCompareOpen } = useSaved();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="shrink-0" aria-label="Bricxley home">
          <BricxleyLogo />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-muted text-foreground" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="sm" onClick={() => setCompareOpen(true)}>
            <Heart className="h-4 w-4" />
            Saved{saved.length ? ` (${saved.length})` : ""}
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/list-property">Post Property</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[86vw] max-w-sm p-6">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <BricxleyLogo showTagline />
            <ul className="mt-8 space-y-1">
              {links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-muted"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/localities"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-muted"
                >
                  Localities
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard/tenant"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-muted"
                >
                  Dashboards
                </Link>
              </li>
            </ul>
            <div className="mt-6 space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link to="/auth" onClick={() => setOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/list-property" onClick={() => setOpen(false)}>
                  Post Property
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
