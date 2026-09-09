import { useEffect, type ComponentType, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  Compass,
  Heart,
  Home,
  MessageCircle,
  Search,
  UserRound,
} from "lucide-react";
import { BricxleyLogo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { dashboardForRole, useSession } from "@/lib/auth/session";

type DashboardRole = "tenant" | "owner" | "agent";

type NavigationItem = {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  mobile?: boolean;
};

const navigationByRole: Record<DashboardRole, NavigationItem[]> = {
  tenant: [
    { label: "Home", to: "/dashboard/tenant", icon: Home, mobile: true },
    { label: "Search", to: "/rent", icon: Search, mobile: true },
    { label: "Saved Homes", to: "/tenant/saved", icon: Heart },
    { label: "My Interests", to: "/tenant/interests", icon: Compass, mobile: true },
    { label: "Messages", to: "/tenant/messages", icon: MessageCircle, mobile: true },
    { label: "Visits", to: "/tenant/visits", icon: CalendarDays },
    { label: "Profile", to: "/dashboard/tenant", icon: UserRound, mobile: true },
  ],
  owner: [
    { label: "Home", to: "/dashboard/owner", icon: Home, mobile: true },
    { label: "My Properties", to: "/owner/properties", icon: Building2, mobile: true },
    { label: "Interests", to: "/owner/interests", icon: Compass, mobile: true },
    { label: "Messages", to: "/owner/messages", icon: MessageCircle, mobile: true },
    { label: "Visits", to: "/owner/visits", icon: CalendarDays },
    { label: "Profile", to: "/dashboard/owner", icon: UserRound, mobile: true },
  ],
  agent: [
    { label: "Home", to: "/dashboard/agent", icon: Home, mobile: true },
    { label: "My Listings", to: "/owner/properties", icon: Building2, mobile: true },
    { label: "Client Interests", to: "/owner/interests", icon: Compass, mobile: true },
    { label: "Messages", to: "/owner/messages", icon: MessageCircle, mobile: true },
    { label: "Visits", to: "/owner/visits", icon: CalendarDays },
    { label: "Profile", to: "/dashboard/agent", icon: UserRound, mobile: true },
  ],
};

const roleLabels: Record<DashboardRole, string> = {
  tenant: "Tenant",
  owner: "Owner",
  agent: "Agent",
};

export function DashboardShell({
  role,
  title,
  subtitle,
  action,
  children,
}: {
  role: DashboardRole;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const { actor, isReady, switchRole } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigation = navigationByRole[role];
  const availableRoles = (actor?.roles ?? [actor?.role]).filter(
    (value): value is DashboardRole => value === "tenant" || value === "owner" || value === "agent",
  );

  useEffect(() => {
    if (!isReady) return;
    if (!actor) {
      if (pathname === "/auth") return;
      void navigate({ to: "/auth", search: { redirect: pathname } });
      return;
    }
    if (actor.role !== role) void navigate({ to: dashboardForRole(actor.role) });
  }, [actor, isReady, navigate, pathname, role]);

  const changeRole = async (nextRole: DashboardRole) => {
    if (nextRole === actor?.role) return;
    await switchRole(nextRole);
    await navigate({ to: dashboardForRole(nextRole) });
  };

  if (!isReady || !actor || actor.role !== role) {
    return (
      <div className="container-page py-16 text-sm text-muted-foreground">Loading dashboard…</div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-sand/40 pb-24 lg:pb-10">
      <div className="container-page grid gap-7 py-6 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:py-8">
        <aside className="surface-card hidden h-fit p-3 lg:sticky lg:top-24 lg:block">
          <div className="px-2 pb-5 pt-2">
            <BricxleyLogo />
          </div>
          <nav aria-label={`${roleLabels[role]} dashboard navigation`}>
            <ul className="grid gap-1">
              {navigation.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to as never}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    activeProps={{
                      className:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    }}
                  >
                    <item.icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {availableRoles.length > 1 ? (
            <div className="mt-6 border-t border-border px-2 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Switch role
              </p>
              <div className="mt-2 grid gap-1">
                {availableRoles.map((availableRole) => (
                  <Button
                    key={availableRole}
                    type="button"
                    variant={availableRole === role ? "secondary" : "ghost"}
                    size="sm"
                    className="justify-start"
                    onClick={() => void changeRole(availableRole)}
                    disabled={availableRole === role}
                  >
                    {roleLabels[availableRole]}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <main className="min-w-0">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                {roleLabels[role]} workspace
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
            </div>
            {action}
          </header>
          {children}
        </main>
      </div>

      <nav
        aria-label="Mobile dashboard navigation"
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-border bg-background/95 p-1.5 shadow-[var(--shadow-panel)] backdrop-blur lg:hidden"
      >
        {navigation
          .filter((item) => item.mobile)
          .slice(0, 5)
          .map((item) => (
            <Link
              key={item.label}
              to={item.to as never}
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.65rem] font-medium text-muted-foreground"
              activeProps={{ className: "bg-primary/10 text-primary" }}
            >
              <item.icon className="h-4 w-4" aria-hidden />
              <span className="truncate">{item.label.replace("My ", "")}</span>
            </Link>
          ))}
      </nav>
    </div>
  );
}

export function DashboardStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="surface-card min-w-0 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-extrabold tracking-tight">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
        <Icon className="h-4 w-4 text-primary" aria-hidden />
      </div>
    </div>
  );
}
