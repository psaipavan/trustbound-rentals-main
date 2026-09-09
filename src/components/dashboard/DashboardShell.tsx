import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { dashboardForRole, useSession } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export type DashboardSection = {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
  items: string[];
};

const roleLinks = [
  { to: "/dashboard/tenant", role: "tenant", label: "Tenant" },
  { to: "/dashboard/owner", role: "owner", label: "Owner" },
  { to: "/dashboard/agent", role: "agent", label: "Agent" },
] as const;

export function DashboardShell({
  role,
  title,
  subtitle,
  sections,
  aside,
}: {
  role: "tenant" | "owner" | "agent";
  title: string;
  subtitle: string;
  sections: DashboardSection[];
  aside?: React.ReactNode;
}) {
  const { actor, isReady, switchRole } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [active, setActive] = useState(sections[0]?.key ?? "");
  const current = sections.find((s) => s.key === active) ?? sections[0];

  useEffect(() => {
    if (!isReady) return;
    if (!actor) {
      // During navigation the leaving dashboard can render once more after the
      // location has become /auth. Keep the original protected path intact.
      if (pathname === "/auth") return;
      void navigate({ to: "/auth", search: { redirect: pathname } });
      return;
    }
    if (actor.role !== role) void navigate({ to: dashboardForRole(actor.role) });
  }, [actor, isReady, navigate, pathname, role]);

  if (!isReady || !actor || actor.role !== role) {
    return (
      <div className="container-page py-16 text-sm text-muted-foreground">Loading dashboard…</div>
    );
  }
  if (!current) return null;

  return (
    <div className="bg-sand/60">
      <div className="container-page py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              {role} dashboard
            </p>
            <h1 className="mt-1.5 text-3xl font-extrabold sm:text-4xl">{title}</h1>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex gap-1 rounded-full border border-border bg-card p-1">
            {roleLinks
              .filter((item) => (actor.roles ?? [actor.role]).includes(item.role))
              .map((r) => (
                <Link
                  key={r.to}
                  to={r.to}
                  onClick={() => void switchRole(r.role)}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                  activeProps={{
                    className: "bg-primary text-primary-foreground hover:text-primary-foreground",
                  }}
                >
                  {r.label}
                </Link>
              ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[250px_1fr]">
          <nav
            className="surface-card h-fit p-2 lg:sticky lg:top-24"
            aria-label="Dashboard sections"
          >
            <ul>
              {sections.map((s) => (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => setActive(s.key)}
                    aria-current={active === s.key}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition",
                      active === s.key
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <s.icon className="h-4 w-4" aria-hidden />
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-6">
            <section className="surface-card p-6">
              <h2 className="text-xl font-bold">{current.label}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{current.description}</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {current.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-border bg-background px-4 py-3.5 text-sm"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                Your Bricxley account controls these records. Updates from interests, messages and
                visits appear here as they happen.
              </p>
            </section>
            {aside}
          </div>
        </div>
      </div>
    </div>
  );
}
