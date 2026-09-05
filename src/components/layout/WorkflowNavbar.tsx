import { Link } from "@tanstack/react-router";
import { Menu, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { BricxleyLogo } from "@/components/brand/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "@/lib/auth/session";
import type { WorkflowRole } from "@/lib/workflow/types";

type WorkflowNavRole = Extract<WorkflowRole, "tenant" | "owner">;

const tenantDesktopLinks = [
  { to: "/rent", label: "Find a Home" },
  { to: "/tenant/interests", label: "My Interests" },
  { to: "/tenant/messages", label: "Messages" },
  { to: "/tenant/visits", label: "Visits" },
] as const;

const tenantMobileLinks = [
  { to: "/rent", label: "Explore" },
  { to: "/tenant/interests", label: "Interests" },
  { to: "/tenant/messages", label: "Messages" },
  { to: "/dashboard/tenant", label: "Profile" },
] as const;

const ownerDesktopLinks = [
  { to: "/dashboard/owner", label: "Dashboard" },
  { to: "/owner/interests", label: "Interests" },
  { to: "/list-property", label: "My Properties" },
  { to: "/owner/messages", label: "Messages" },
  { to: "/owner/visits", label: "Visits" },
] as const;

function NavLink({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <Link
      to={to as never}
      onClick={onClick}
      className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      activeProps={{ className: "bg-muted text-foreground" }}
    >
      {label}
    </Link>
  );
}

export function WorkflowNavbar({ role }: { role: WorkflowNavRole }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { actor } = useSession();
  const desktopLinks = role === "tenant" ? tenantDesktopLinks : ownerDesktopLinks;
  const mobileLinks = role === "tenant" ? tenantMobileLinks : ownerDesktopLinks;
  const initial = actor?.displayName.slice(0, 1).toUpperCase() ?? "U";

  useEffect(() => {
    const updateScrolledState = () => setScrolled(window.scrollY > 8);
    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolledState);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md transition-shadow duration-200 motion-reduce:transition-none ${
        scrolled ? "shadow-[var(--shadow-soft)]" : "shadow-none"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="shrink-0" aria-label="Bricxley home">
          <BricxleyLogo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {desktopLinks.map((link) => (
            <NavLink key={link.label} {...link} />
          ))}
        </div>

        <Link
          to={(role === "tenant" ? "/dashboard/tenant" : "/dashboard/owner") as never}
          className="hidden items-center gap-2 rounded-full p-1 pr-3 text-sm font-medium hover:bg-muted lg:flex"
          aria-label="Open profile"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span>Profile</span>
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open app menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[86vw] max-w-sm p-6">
            <SheetTitle className="sr-only">Workflow navigation</SheetTitle>
            <BricxleyLogo showTagline />
            <div className="mt-8 grid gap-1">
              {mobileLinks.map((link) => (
                <NavLink key={link.label} {...link} onClick={() => setOpen(false)} />
              ))}
              <NavLink
                to={role === "tenant" ? "/dashboard/tenant" : "/dashboard/owner"}
                label="Profile"
                onClick={() => setOpen(false)}
              />
            </div>
            <div className="mt-8 flex items-center gap-3 rounded-xl bg-muted p-3 text-sm">
              <UserRound className="h-4 w-4 text-primary" aria-hidden />
              <span className="font-medium">{actor?.displayName ?? "Profile"}</span>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
